# supplychain.eth

### Blockchain Enabled AntiCounterfeiting Suite

This was originally developed as a MiniProject for my 6th sem undergrad. This explores a possible solution of leveraging Blockchain tech in post supply chain situation where technologies like RFID are in-effective. This explores the idea of immutability and ownership in ethereum.


## Running locally

To run this project locally,
1. First clone the project using `git clone git@github.com:aa-deet-eeya/supplychain.eth.git`,
2. Install all the dependencies using `npm i`,
3. Install and fire up ganache/geth, you can use `npm run ganache` to run ganache-cli, 
4. Migrate the contracts using `npm run migrate`,
5. Now using the contract address in the output of `npm run migrate` and create `.env` file from `.env.example`

To run the tests you can run `npm run test` to run the test suite
