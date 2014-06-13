var express = require('express');
var Socket = require('socket.io');
var http = require('http');
var url = require('url');

var app = express();
var server = http.createServer(app);

var main = /^\/[a-z0-9_-]+\/?$/;

app.use(function cors(req, res, next) {
  var origin = req.header('origin');
  if (origin && url.parse(origin).protocol === 'chrome-extension:') {
    res.header({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Credentials': true
    });
  }
  if (req.method === 'options') {
    return res.send(200, '');
  }
  next();
});
app.use(express.logger('dev'));
app.use(express.json({strict: true}));
app.use(function dispatch(req, res, next) {
  if (!main.test(req.url)) {
    return next();
  }
  if (req.method === 'POST' || req.method === 'PUT') {
    if (typeof req.body.text !== 'string') {
      return res.json(400, {
        message: 'text must be a string'
      });
    }
    // TODO: scalability
    io.sockets.in(req.url).emit('update', req.body.text);
    return res.send(204, '');
  }
  req.url = '/main.html';
  next();
});
app.use(express.static(__dirname + '/public'));
app.use(function(req, res) {
  res.send(404, 'not found');
});

var io = new Socket(server);

// TODO: authentication
io.sockets.on('connection', function(socket) {
  socket.on('join', function(room) {
    socket.join(room);
  });

  socket.on('leave', function(room) {
    socket.leave(room);
  });
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('listening on', port);
});
