const { fromBytes32, toBytes32, fromUnit, catchRevert } = require('./utils.js');
const Product = artifacts.require('./Product.sol');

contract('Product', accounts => {
    describe('Product Tests', async()=> {
        let _productInstance, _manufacturerAdmin, _manufacturerManager, _retailer, _customer1, _customer2;
        const companyPrefix = "1234",
        companyName = "New Company pvt. Ltd",
        product1EPC = "1234567899";

        beforeEach(async() => {
            _productInstance = await Product.deployed();

            _manufacturerAdmin = accounts[0];
            _manufacturerManager = accounts[1];
            _retailer = accounts[2];
            _customer1 = accounts[3];
            _customer2 = accounts[4];
        });

        /**
         * This case checks if _manufacturerAdmin is able to enroll Manufacturers and this is
         * based on the event emitted by enrollManufacturer method
         */
        it('should be able to enroll manufacturers', async ()=> {
            const tx = await _productInstance.enrollManufacturer(
                _manufacturerManager,
                companyPrefix,  
                toBytes32(companyName),
                "3600000",
                { from: _manufacturerAdmin }
            );

            /* Assert from the event emitted from the contract transaction */
            const event = tx.logs[0].args;
            assert(fromBytes32(event.companyName), "New Company pvt. Ltd", "Company Name does not match");
            assert((event.companyPrefix).toString(), "1234", "Company Prefix is wrong");


            /**
             * This is where _customer1 who is not authorized to enrollManufacturer tries to
             * authorize a shady person as manufacturerManager
             */
            await catchRevert(_productInstance.enrollManufacturer(
                _customer2,
                "8921371",  
                toBytes32("Shady AF Company LLC"),
                "3600000",
                { from: _customer1 }
            ), 'Ownable: caller is not the owner.');
        });

        /**
         * This case checks if _manufacturerManager enrolled by _manufacturerAdmin 
         * is able to enroll Products and this is based on the event emitted by
         * enrollProduct method in the Contract
         */
        it('should be able to enroll Product', async ()=> {
            const tx = await _productInstance.enrollProduct(
                product1EPC,
                { from: _manufacturerManager }
            );

            /* Assert from the event emitted from the contract transaction */
            const event = tx.logs[0].args;
            assert(event._EPC.toString(), product1EPC, "Electronic Product Code does not match");
            assert(event.owner, _manufacturerManager, "Manufacturer does not have the ownership of the product");


            /**
             * If someone who is not authorized to register their products on the
             * chain tries to register their products on the chain
             */

            await catchRevert(_productInstance.enrollProduct(
                "2615317823",
                { from: _customer2 }
            ), 'Manufacturer Doesnt Exist');
        });

        /**
         * This case tests if the product is shipped to the Retailer succesfully or not
         */
        it('should be able to ship Product to Retailer', async()=> {
            await _productInstance.shipProduct(
                _retailer,
                product1EPC,
                { from: _manufacturerManager }
            );

            const recipient = await _productInstance.getRecipient(product1EPC);
            assert(recipient, _retailer, "Retailer is not the Recipient");
            
            /* Assert from the event emitted from the contract transaction */
            let status_tx = await _productInstance.getProductStatus(product1EPC, { from: _retailer });
            let event = status_tx.logs[0].args;
            assert(event.status, "Shipped", "Product status is not 'Shipped'");

            /**
             * The Product with product1EPC is meant for _retailer
             * if anyone else other than the _retailer tries to 
             * recieve the product the the Contract should throw 
             * an error
             */
            await catchRevert(_productInstance.receiveProduct(
                product1EPC,
                { from: _customer2 }
            ), "The product wasn't meant for the sender");
            
            
            await _productInstance.receiveProduct(
                product1EPC,
                { from: _retailer }
            );
            const owner = await _productInstance.getCurrentOwner(product1EPC);
            assert(owner, _retailer, "Retailer is not the Owner");
            
            /* Assert from the event emitted from the contract transaction */
            status_tx = await _productInstance.getProductStatus(product1EPC, { from: _retailer });
            event = status_tx.logs[0].args;
            assert(event.status, "Owned", "Product status is not 'Shipped'");
        });

        it('should be able to exchange after being Owned', async() => {
            /**
             * Now that the _retailer owns the product,
             * _retailer holds the authority to further 
             * sell/ship the product further down the 
             * chain to the customers
             */

            await _productInstance.shipProduct(
                _customer1,
                product1EPC,
                { from: _retailer }
            );

            const recipient = await _productInstance.getRecipient(product1EPC);
            assert(recipient, _customer1, "Customer1 is not the Recipient");
            
            /* Assert from the event emitted from the contract transaction */
            let status_tx = await _productInstance.getProductStatus(product1EPC, { from: _retailer });
            let event = status_tx.logs[0].args;
            assert(event.status, "Shipped", "Product status is not 'Shipped'");


            /**
             * Now if a shady person in between tries to recieve the product
             */
            await catchRevert(_productInstance.receiveProduct(
                product1EPC,
                { from: _customer2 }
            ), "The product wasn't meant for the sender");


            await _productInstance.receiveProduct(
                product1EPC,
                { from: _customer1 }
            );
            const owner = await _productInstance.getCurrentOwner(product1EPC);
            assert(owner, _customer1, "Customer1 is not the Owner");
            
            /* Assert from the event emitted from the contract transaction */
            status_tx = await _productInstance.getProductStatus(product1EPC, { from: _retailer });
            event = status_tx.logs[0].args;
            assert(event.status, "Owned", "Product status is not 'Shipped'");
        })
    })
});
