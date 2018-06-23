const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var {initVoting, createContractObject, createContractInstance, getResult, vote, generateAccounts} = require('./utils/blockchain-calls');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var votingResult = [{name: 'Candidate 1', result: 0}, {name: 'Candidate 2', result: 0}, {name: 'Against all', result: 0}];

var scInst;
const candidateOptions = [1, 2, 3]

var updateVotingResult = (res) => {
  var sameResult = 0;
  for (var i = 0; i < res.length; i++) {
    if (votingResult[i].result == res[i]) {
      sameResult++;
    }
    votingResult[i].result = res[i];
    console.log(`Result for ${votingResult[i].name} is: ${votingResult[i].result}`);
  };
  return sameResult;
};

var sc = initVoting(candidateOptions);
sc.then((result) => {
  console.log(`contract ${result.contr.address} was added in blockchain`);
  scInst = createContractInstance(result.contr.address, result.contract);
}, (e) => {
console.log(e);
});

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('client is connected to server');

  socket.on('startVoting', (params, callback) => {

    if (!params.optionOne || !params.optionTwo) {
      callback('Candidate names are required');
    } else {
      callback();
      votingResult[0].name = params.optionOne;
      votingResult[1].name = params.optionTwo;

  }

  io.emit('blockchainInit', generateAccounts(params.votersNumber));
  updateVotingResult(getResult(scInst, candidateOptions));
  io.emit('newVoteResult', votingResult);
  });

  socket.on('newVote', (receivedVote) => {
    console.log(`new vote from ${receivedVote.address} received: ${receivedVote.option}`);
    io.emit('updateStatus', `Received vote from ${receivedVote.address} for ${votingResult[receivedVote.option-1].name}, sending vote in blockchain`)

    if (vote(scInst, receivedVote.option, receivedVote.address)) {
      console.log(`account ${receivedVote.address} voted`);
    };

    if (updateVotingResult(getResult(scInst, candidateOptions)) == 0) {
      io.emit('updateStatus', `Account ${receivedVote.address} has already voted, new vote for ${votingResult[receivedVote.option-1].name} was not counted`)
    }
    io.emit('newVoteResult', votingResult);

  });

});

server.listen(port, () => {
  console.log(`Server up at port ${port}`);
});
