var socket = io();

socket.on('connect', function () {
  console.log('connected to the server');
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

});
