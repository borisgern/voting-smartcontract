
var socket = io();

socket.on('connect', function () {
  console.log('connected to server');

  socket.emit('startVoting', {optionOne: "Boris", optionTwo: "Liza"});
});

socket.on('blockchainInit', function (accounts) {
  console.log(accounts);

  var template = jQuery('#accounts-list-template').html();
  console.log(template);
  for (var i = 0; i<10; i++) {
    var html = Mustache.render(template, {
      value: accounts[i],
      text: accounts[i]
    });
    jQuery('[name=accounts-list]').append(html);
  };

  console.log(html);
  console.log(jQuery('#voting-list-template').html());
  console.log(jQuery('[name=voting-list]')[0][0]);
  //jQuery('[name=voting-list]')[0][0].outerHTML = html;
});

socket.on('newVoteResult', function (result) {
  for(var i = 0; i<result.length; i++) {
    jQuery('td#option')[i].textContent = result[i].result;
  }
  console.log('new result is', result);
});

jQuery('#vote-form').on('submit', function (e) {
  e.preventDefault();
  console.log('on submit ', jQuery('[name=voting-list]').val());
  socket.emit('newVote', {
    option: jQuery('[name=voting-list]').val(),
    address: jQuery('[name=accounts-list]').val()
  });
});
