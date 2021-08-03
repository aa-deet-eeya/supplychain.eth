import dotenv from 'dotenv';
dotenv.config();

import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { Product } from './Product';
import { fromBytes32 } from './utils';

const MNEMONIC = process.env.MNEMONIC as string;
const RPC_URL = process.env.RPC_URL as string;

(async() => {
    const wallet = await new HDWalletProvider(MNEMONIC, RPC_URL, 0, 10);

    try {
        const web3 = new Web3(wallet);
        const product = new Product(web3);
        const accounts = await web3.eth.getAccounts();

        const manufacturerAdmin = accounts[0];
        const manufacturerManager = accounts[1];
        const retailer = accounts[2];
        const customer1 = accounts[3];
        const customer2 = accounts[4];

        console.log(`\n\n~~~~~~~~~~~~~~ CREATE Manufacturer ~~~~~~~~~~~~~~~`);
        let tx = await product.enrollManufacturer(
            manufacturerManager,  // manufacturer address
            "1234",  // companyPrefix
            "New Company pvt. Ltd", // companyName
            "3600000", // validtyTime :  1000*60*60
            manufacturerAdmin  //  admin address
        );

        console.log(`ManufacturerCreated  `, tx.events.ManufacturerCreated.returnValues);
        
        console.log(`\n\n~~~~~~~~~~~~~~~~ CREATE PRODUCT ~~~~~~~~~~~~~~~~~~`);
        const product1EPC = "1234567899";
        tx = await product.enrollProduct(
            product1EPC,    // _EPC
            manufacturerManager  // manufacturer address
        );

        console.log(`ProductCreated  `, tx.events.ProductCreated.returnValues);
        
        let status = await product.getProductStatus(product1EPC, manufacturerManager);
        console.log(`Manufacturer Address: `, await product.getManufacturerAddress(product1EPC));
        console.log(`CompanyName: `, fromBytes32(await product.getManufacturerName(product1EPC)));
        console.log(`CompanyPrefix: `, await product.getCompanyPrefix(product1EPC));
        console.log(`ProductStatus: `, status.events.ProductStatusEvent.returnValues.status);
        
        console.log(`\n\n~~~~~~~~~~~~~~~~ SHIP PRODUCT ~~~~~~~~~~~~~~~~~~~~`);
        tx = await product.shipProduct(
            retailer,   // retailer
            product1EPC,    // _EPC
            manufacturerManager   // manufacturer address
        )
        
        status = await product.getProductStatus(product1EPC, manufacturerManager);
        console.log(`CurrentOwner (ManufacturerManager) : `, await product.getCurrentOwner(product1EPC));
        console.log(`Recipient (retailer): `, await product.getRecipient(product1EPC));
        console.log(`ProductStatus: `, status.events.ProductStatusEvent.returnValues.status);

        console.log(`\n\n~~~~~~~~~~~~~~~ RECEIVE PRODUCT ~~~~~~~~~~~~~~~~~`);
        tx = await product.receiveProduct(
            product1EPC,    // _EPC
            retailer    //  new owner
        );

        console.log(`CurrentOwner (Retailer) : `, await product.getCurrentOwner(product1EPC));
        
        tx = await product.shipProduct(
            customer1,   // customer1
            product1EPC,    // _EPC
            retailer   // retailer address
        );

        console.log(`Recipient (Customer1): `, await product.getRecipient(product1EPC));

        console.log(`\n\n~~~~~~~~~~~~~~ SELL to CUSTOMER1 ~~~~~~~~~~~~~~~~`);
        tx = await product.receiveProduct(
            product1EPC,    // _EPC
            customer1    //  new owner
        );

        console.log(`CurrentOwner (Customer1): `, await product.getCurrentOwner(product1EPC));
        
        tx = await product.shipProduct(
            customer2,   // customer1
            product1EPC,    // _EPC
            customer1   // retailer address
        );

        console.log(`Recipient (Customer2): `, await product.getRecipient(product1EPC));

        console.log(`\n\n~~~~~~~~~~~~~~ SELL to CUSTOMER2 ~~~~~~~~~~~~~~~~`);
        tx = await product.receiveProduct(
            product1EPC,    // _EPC
            customer2    //  new owner
        );

        console.log(`CurrentOwner (Customer2): `, await product.getCurrentOwner(product1EPC));

    }
    catch (error){
        console.log(error);
    }
    
    wallet.engine.stop();
})();
