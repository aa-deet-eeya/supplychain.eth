const BN =  require("bn.js");
const Web3 = require("web3");

const { toBN, toWei, fromWei, rightPad, asciiToHex, hexToAscii } = Web3.utils;

/**
 * Converts to standard unit used for Blockchain tokens
 * @param {string|number} amount
 * @returns {BN}
 */
const toUnit = (amount) => {
  return toBN(toWei(amount.toString(), 'ether'));
};

/**
 * Converts to Wei from Ether
 * @param {string|number} amount
 * @returns {BN}
 */
const fromUnit = (amount) => {
  return fromWei(amount.toString(), 'ether');
};

/**
 * Converts keys to 32 byte strings
 * @param {string} key
 * @returns {string}
 */
const toBytes32 = (key) => {
  return rightPad(asciiToHex(key), 64);
};

/**
 * Converts keys from 32 byte strings
 * @param {string} key
 * @returns {string}
 */
const fromBytes32 = (key) => {
  return hexToAscii(key);
};


/**
 * This is try catch function for testing the Exceptions in the Contract tests
 */
async function tryCatch(promise, message) {
    // const PREFIX = "VM Exception while processing transaction: ";
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.includes(message), "Expected an error containing '" + message + "' but got '" + error.message + "' instead");
    }
};

/**
 * This catches the Revert exceptions from the contract
 * @param promise 
 */
async function catchRevert(promise, msg) {
  await tryCatch(promise, msg);
};

module.exports = {
    toUnit,
    fromUnit,
    toBytes32,
    fromBytes32,
    catchRevert,
};
