var socket = io();

socket.on('connect', function () {
  console.log('connected to server');

  var params = jQuery.deparam(window.location.search);
  params.optionThree = 'Against all';
  console.log(params);

  jQuery('td#name')[0].textContent = params.optionOne;
  jQuery('td#name')[1].textContent = params.optionTwo;
  jQuery('td#name')[2].textContent = params.optionThree;
  jQuery('[name=voting-list]')[0][0].textContent = params.optionOne;
  jQuery('[name=voting-list]')[0][1].textContent = params.optionTwo;
  jQuery('[name=voting-list]')[0][2].textContent = params.optionThree;

  socket.emit('startVoting', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
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
  if (jQuery('[name=accounts-list]').val() == 0) {
    alert('Please choose account to make vote');
  } else {
    socket.emit('newVote', {
      option: jQuery('[name=voting-list]').val(),
      address: jQuery('[name=accounts-list]').val()
    });
  }
});
