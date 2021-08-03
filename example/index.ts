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

        let tx = await product.enrollManufacturer(
            manufacturerManager,
            "321",
            "NewCompany LLC",
            "3600000",
            manufacturerAdmin
        );

        console.log(tx.events.ManufacturerCreated.returnValues);
        
        const product1EPC = "112257";
        tx = await product.enrollProduct(
            product1EPC,
            manufacturerManager
        );

        console.log(tx.events.ProductCreated.returnValues);
        
        let status = await product.getProductStatus(product1EPC, manufacturerManager);
        tx = await product.shipProduct(
            retailer,
            product1EPC,
            manufacturerManager
        )


        console.log(`Manufacturer Address: `, await product.getManufacturerAddress(product1EPC));
        console.log(`CompanyName: `, fromBytes32(await product.getManufacturerName(product1EPC)));
        console.log(`CompanyPrefix: `, await product.getCompanyPrefix(product1EPC));
        console.log(`ProductStatus: `, status.events.ProductStatusEvent.returnValues.status);
        console.log(`CurrentOwner: `, await product.getCurrentOwner(product1EPC));
        console.log(`Recipient: `, await product.getRecipient(product1EPC));

    
    }
    catch (error){
        console.log(error);
    }
    
    wallet.engine.stop();
})();
