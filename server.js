var express = require('express'),
        app = express.createServer(),
         io = require('socket.io').listen(app);

app.listen(process.env['PORT'] || 3000);

app.get('/load', function(req, res) {
  // XXX generate load
  res.send('ok');
});

// serve the UI
app.use(express.static(__dirname + '/html'));

// keep track of all connected clients
var clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  socket.on('disconnect', function (data) {
    clients.splice(clients.indexOf(socket), 1);
  });
});

// every 700ms send down server state to all connected clients
// XXX write me
