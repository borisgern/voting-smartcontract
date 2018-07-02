const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var {initVoting, createContractObject, createContractInstance, getResult, vote, generateAccounts} = require('./utils/blockchain-calls');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

io.set('heartbeat timeout', 60000);
io.set('heartbeat interval', 25000);

var exec = require('child_process').exec, child;

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

var startNewVoting = async () => {
  let result = await initVoting(candidateOptions);
  if (result) {
    console.log(`contract ${result.contr.address} was added in blockchain`);
    scInst = createContractInstance(result.contr.address, result.contract);
    await updateVotingResult(getResult(scInst, candidateOptions));
    return true;
  }
  return false;
};

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('client is connected to server', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('disconnect: ', reason);
  });

  socket.on('initContract', (callback) => {
    startNewVoting().then((res) => {
      if(res) {
        callback()
      } else {
        callback('Unable to add smart contract in blockchain', res)
      }
    });
  });

  socket.on('startVoting', (params, callback) => {
    if (!params.optionOne || !params.optionTwo) {
      callback('Candidate names are required');
    } else {
      callback();
      votingResult[0].name = params.optionOne;
      votingResult[1].name = params.optionTwo;
    }

  socket.emit('blockchainInit', generateAccounts(params.votersNumber));
  socket.emit('newVoteResult', votingResult);
  });

  socket.on('newVote', (receivedVote) => {
    console.log(`new vote from ${receivedVote.address} received: ${receivedVote.option}`);
    socket.emit('updateStatus', `Received vote from ${receivedVote.address} for ${votingResult[receivedVote.option-1].name}, sending vote in blockchain`);
    vote(scInst, receivedVote.option, receivedVote.address);

    if (updateVotingResult(getResult(scInst, candidateOptions)) !== 0) {
      socket.emit('updateStatus', `Account ${receivedVote.address} has already voted, new vote for ${votingResult[receivedVote.option-1].name} was not counted`)
    } else {
      socket.emit('newVoteResult', votingResult);
    }
  });
});

server.listen(port, () => {
  console.log(`Server up at port ${port}`);
});
