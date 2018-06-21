
var socket = io();

socket.on('connect', function () {
  console.log('connected to server');

  socket.emit('startVoting', {optionOne: "Boris", optionTwo: "Liza"});
});

socket.on('newVoteResult', function (result) {
  for(var i = 0; i<result.length; i++) {
    jQuery('td#option')[i].textContent = result[i].result;
  }
  console.log('new result is', result);
});

jQuery('#vote-form').on('submit', function (e) {
  e.preventDefault();
  console.log(jQuery('td#option'));
  console.log('on submit ', jQuery('[name=voting-list]').val());
  socket.emit('newVote', {
    option: jQuery('[name=voting-list]').val(),
    address: "0xa405f72b3edcac4f6d7e6d0e5274198cf9f0255d"
  });
});
