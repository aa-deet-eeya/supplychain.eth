import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { toBytes32 } from "./utils";
const PRODUCT_ADDRS = process.env.PRODUCT_ADDRS;
const PRODUCT_ABI = require(process.env.PRODUCT_ABI_DIR) as string;


export class Product {
    private _product: Contract

    constructor(web3: Web3) {
        this._product = new web3.eth.Contract(PRODUCT_ABI["abi"], PRODUCT_ADDRS);
    }

    public enrollManufacturer(
        manufacturerAddrs: string,
        companyPrefix: string,
        companyName: string,
        validityTime: string,
        sender: string) {
        return this._product.methods.enrollManufacturer(
            manufacturerAddrs,
            companyPrefix,
            toBytes32(companyName),
            validityTime,
        ).send({ from: sender });
    }

    public enrollProduct(_EPC: string, sender: string) {
        return this._product.methods.enrollProduct(_EPC).send({ from: sender });
    }

    public shipProduct(recipient: string, _EPC: string, sender:string) {
        return this._product.methods.shipProduct(recipient, _EPC).send({ from: sender });
    }

    public receiveProduct(_EPC: string, sender:string) {
        return this._product.methods.receiveProduct(_EPC).send({ from: sender });
    }

    public getCurrentOwner(_EPC: string) {
        return this._product.methods.getCurrentOwner(_EPC).call();
    }

    public getRecipient(_EPC: string) {
        return this._product.methods.getRecipient(_EPC).call();
    }

    public getProductStatus(_EPC: string, sender: string) {
        return this._product.methods.getProductStatus(_EPC).send({ from: sender});
    }

    public getManufacturerAddress(_EPC: string) {
        return this._product.methods.getManufacturerAddress(_EPC).call();
    }

    public getCompanyPrefix(_EPC: string) {
        return this._product.methods.getCompanyPrefix(_EPC).call();
    }

    public manufacturers(index: number) {
        return this._product.methods.manufacturers(index).call();
    }
}
