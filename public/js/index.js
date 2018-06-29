var socket = io();

socket.on('connect', function () {
  console.log('connected to server');
  jQuery('#status').text(`Status: Adding smart contract in blockchain`) ;
  socket.emit('initContract', function (err) {
    if (err) {
      alert(err);
    } else {
      jQuery('#start-button').removeAttr('disabled');
      jQuery('#status').text(`Ready for voting, press start button to proceed`) ;
    }
  });
});
