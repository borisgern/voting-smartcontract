var Web3 = require('web3');
var solc = require('solc');
const fs = require('fs');

var pas = "1";

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var checkBlockchainStatus = () => {
  if(web3.eth.accounts) {
    //console.log(web3.eth.accounts);
    //console.log(web3.personal.newAccount());;
    return true;
  } else {
      return false
  }
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
    var coinbaseAccount = createAccount(pas);
    console.log(`coinbase account ${coinbaseAccount} was created`);
    var contract = createContractObject('./voting.sol');
    return sc = new Promise((resolve, reject) => {
      web3.personal.unlockAccount(coinbaseAccount, pas, 30);
      contract.OBJ.new(options, {from: coinbaseAccount, data: `0x${contract.BIN}`, gas: 4700000}, (e, contr) => {
            if(!e) {
              if(contr.address) {
                  resolve(contr);
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
  var contractInstance = scObject.OBJ.at(contr);
  var owner = contractInstance.owner.call();
  console.log(`Owner of contract is ${owner}`);
};



module.exports = {checkBlockchainStatus, initVoting, createContractObject, createContractInstance};
