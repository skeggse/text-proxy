var $ = document.querySelector.bind(document);

var socket = io();

socket.emit('join', location.pathname);

socket.on('update', function(text) {
  $('#content').textContent = text;
});
