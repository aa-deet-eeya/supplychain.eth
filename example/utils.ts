import BN from "bn.js";
import Web3 from "web3";

const { toBN, toWei, rightPad, asciiToHex } = Web3.utils;

/**
 * Converts to standard unit used for Blockchain tokens
 * @param {string|number} amount
 * @returns {BN}
 */
const toUnit = (amount: string | number | BN): BN => {
  return toBN(toWei(amount.toString(), 'ether'));
};

/**
 * Converts keys to 32 byte strings
 * @param {string} key
 * @returns {string}
 */
const toBytes32 = (key: string): string => {
  return rightPad(asciiToHex(key), 64);
};

export {
    toUnit,
    toBytes32
}
