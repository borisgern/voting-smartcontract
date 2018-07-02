var Web3 = require('web3');
var solc = require('solc');
const fs = require('fs');

var pas = "1";

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var coinbaseAddress = web3.eth.coinbase;

var generateAccounts = (number) => {
  var accounts = [];
  for (var i = 0; i<number; i++) {
    accounts.push(createAccount(pas));
  }
  return accounts;
};

var createContractObject = (scCode) => {
  var compiledSC = solc.compile(fs.readFileSync(scCode).toString());
  console.log("contract was compiled");
  var BIN = compiledSC.contracts[':Voting'].bytecode;
  var ABI = JSON.parse(compiledSC.contracts[':Voting'].interface);
  var OBJ = web3.eth.contract(ABI);

  return {BIN, ABI, OBJ};
};

var initVoting = (options) => {

    var contract = createContractObject('./voting.sol');
    return new Promise((resolve, reject) => {
      web3.personal.unlockAccount(coinbaseAddress, pas, 30);
      contract.OBJ.new(options, {from: coinbaseAddress, data: `0x${contract.BIN}`, gas: 4700000}, (e, contr) => {
            if(!e) {
              if(contr.address) {
                  resolve({contr, contract});
               }
             } else {
               reject(e);
             }
          });
    });
};

var createAccount = (pas) => {
  return web3.personal.newAccount(pas);
};

var createContractInstance = (contr, scObject) => {
  return contractInstance = scObject.OBJ.at(contr);
};

var getResult = (sc, options) => {
  var res = [];
  for (var i = 0; i < options.length; i++) {
    res[i] = sc.checkResult.call(options[i]);
  };
  return res;
};

var vote = (sc, option, address) => {
  web3.personal.unlockAccount(coinbaseAddress, pas, 30);
  //console.log('address balance before', web3.eth.getBalance(address));
  var tx = web3.eth.sendTransaction({from: coinbaseAddress, to: address, value: 300000000000000});
  while (web3.eth.getTransactionReceipt(tx) === null);
  //console.log('address balance after', web3.eth.getBalance(address));
  web3.personal.unlockAccount(address, pas, 30);

  tx = sc.vote(option, {from: address, gas: '0x186A0', gasPrice: '0x77359400'});
  while (web3.eth.getTransactionReceipt(tx) === null);

  console.log('vote added in blockchain in block', web3.eth.getTransactionReceipt(tx).blockNumber);
};


module.exports = {initVoting, createContractObject, createContractInstance, getResult, vote, generateAccounts};
