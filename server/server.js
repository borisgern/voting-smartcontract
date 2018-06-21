const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var {checkBlockchainStatus, initVoting, createContractObject, createContractInstance, getResult, vote, getAccountsList} = require('./utils/blockchain-calls');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var votingResult = [{name: 'Candidate 1', result: 0}, {name: 'Candidate 2', result: 0}, {name: 'Against all', result: 0}];
var sc;
var scInst;
const contrOBJ = createContractObject('./voting.sol');
const candidateOptions = [1, 2, 3]

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('client is connected to server');

  socket.on('startVoting', (candidateNames) => {
    console.log('candidates before voting', votingResult);
    votingResult[0].name = candidateNames.optionOne;
    votingResult[1].name = candidateNames.optionTwo;
    sc = initVoting(candidateOptions);
    sc.then((contr) => {
      console.log(`contract ${contr.address} was added in blockchain`);
      scInst = createContractInstance(contr.address, contrOBJ);
      var res = getResult(scInst, candidateOptions);
      for (var i = 0; i < res.length; i++) {
        votingResult[0].result = res[i].c;
        console.log(`Result for ${votingResult[i].name} is: ${res[i]}`);
      };
      io.emit('blockchainInit', getAccountsList())
      io.emit('newVoteResult', votingResult);
    }, (e) => {
      console.log(e);
    });
  });

  socket.on('newVote', (receivedVote) => {
    console.log(`new vote from ${receivedVote.address} received: ${receivedVote.option}`);
    if (vote(scInst, receivedVote.option, receivedVote.address)) {
      console.log(`account ${receivedVote.address} voted`);
    };
    var res = getResult(scInst, candidateOptions);
    for (var i = 0; i < res.length; i++) {
      votingResult[i].result = res[i];
      console.log(`Result for ${votingResult[i].name} is: ${votingResult[i].result}`);
    };
    io.emit('newVoteResult', votingResult);
  });

});

server.listen(port, () => {
  console.log(`Server up at port ${port}`);
});

//change condition to oposite later
  // if (checkBlockchainStatus()) {
  //   options.optOne = names.optionOne;
  //   options.optTwo = names.OptionTwo;
  //   console.log('updated candidates', options);
  //   var sc = initVoting([1, 2, 3]);
  //   sc.then((contr) => {
  //     console.log(`contract ${contr.address} was added in blockchain`);
  //     // var scInst = createContractInstance(contr.address, contrOBJ);
  //     // getResult(scInst, options);
  //     // if (vote(scInst, 1, "0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d")) {
  //     //   console.log(`account 0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d voted`);
  //     // };
  //     // getResult(scInst, options);
  //     // if (vote(scInst, 1, "0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d")) {
  //     //   console.log(`account 0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d voted`);
  //     // };
  //     // getResult(scInst, options);
  //   }, e => {
  //      console.log(e);
  //   });
  //
  // };
