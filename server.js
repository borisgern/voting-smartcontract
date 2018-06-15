var {checkBlockchainStatus, initVoting, createContractObject, createContractInstance, getResult, vote} = require('./utils/blockchain-calls');

var options = [1, 2, 3];

var contrOBJ = createContractObject('./voting.sol');

//change condition to oposite later
if (checkBlockchainStatus()) {
  var sc = initVoting(options);
  sc.then((contr) => {
    console.log(`contract ${contr.address} was added in blockchain`);
    var scInst = createContractInstance(contr.address, contrOBJ);
    getResult(scInst, options);
    if (vote(scInst, 1, "0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d")) {
      console.log(`account 0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d voted`);
    };
    getResult(scInst, options);
  }, e => {
     console.log(e);
  });

};
