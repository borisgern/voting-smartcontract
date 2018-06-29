//var socket = io();

var socket = io();

function updateStatus (message) {
  jQuery('#status').text(`Status: ${message}`);
}

// socket.on('connect', function () {
// var socket = io.connect('http://localhost:3000', {
//     reconnection: false
// });

//var socket = io.connect('http://localhost:3000');
socket.on('connect', function () {

  var params = jQuery.deparam(window.location.search);
  params.optionThree = 'Against all';

  updateStatus('Setting voting options');
  jQuery('td#name')[0].textContent = params.optionOne;
  jQuery('td#name')[1].textContent = params.optionTwo;
  jQuery('td#name')[2].textContent = params.optionThree;
  jQuery('[name=voting-list]')[0][0].textContent = params.optionOne;
  jQuery('[name=voting-list]')[0][1].textContent = params.optionTwo;
  jQuery('[name=voting-list]')[0][2].textContent = params.optionThree;
  updateStatus('Generating new accounts');

  socket.emit('startVoting', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {

      console.log('No error');
    }
  });
});

// var params = jQuery.deparam(window.location.search);
// params.optionThree = 'Against all';
//
// updateStatus('Setting voting options');
// jQuery('td#name')[0].textContent = params.optionOne;
// jQuery('td#name')[1].textContent = params.optionTwo;
// jQuery('td#name')[2].textContent = params.optionThree;
// jQuery('[name=voting-list]')[0][0].textContent = params.optionOne;
// jQuery('[name=voting-list]')[0][1].textContent = params.optionTwo;
// jQuery('[name=voting-list]')[0][2].textContent = params.optionThree;
// updateStatus('Generating new accounts');
//
// socket.emit('startVoting', params, function (err) {
//   if (err) {
//     alert(err);
//     window.location.href = '/';
//   } else {
//
//     console.log('No error');
//   }
// });

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('blockchainInit', function (accounts) {


  var template = jQuery('#accounts-list-template').html();

  for (var i = 0; i<accounts.length; i++) {
    var html = Mustache.render(template, {
      value: accounts[i],
      text: accounts[i]
    });
    jQuery('[name=accounts-list]').append(html);
  };

  jQuery('[name=accounts-list]')[0][0].remove();
  jQuery('#send-button').removeAttr('disabled');
  updateStatus('Ready for voting');
});

socket.on('newVoteResult', function (result) {
  for(var i = 0; i<result.length; i++) {
    jQuery('td#option')[i].textContent = result[i].result;
  }
  updateStatus('Voting result was syncronized with blockchain');
  console.log('new result is', result);
});

socket.on('updateStatus', function (message) {
  updateStatus(message);
});
// , function (voteResult) {
//
// }
jQuery('#vote-form').on('submit', function (e) {
  e.preventDefault();
  socket.emit('newVote', {
    option: jQuery('[name=voting-list]').val(),
    address: jQuery('[name=accounts-list]').val()
  });
});
