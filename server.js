var {checkBlockchainStatus, initVoting, createContractObject, createContractInstance} = require('./utils/blockchain-calls');

var options = [1, 2, 3];

var contrOBJ = createContractObject('./voting.sol');

//change condition to oposite later
if (checkBlockchainStatus()) {
  var sc = initVoting(options);
  sc.then((contr) => {
    console.log(`contract ${contr.address} was added in blockchain`);
    var scInst = createContractInstance(contr.address, contrOBJ);
    //console.log();
  }, e => {
     console.log(e);
  });

};
