var express = require('express'),
        app = express.createServer(),
         io = require('socket.io').listen(app),
         os = require('os');

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
var last = os.cpus();
const NUM_CPUS = last.length;
setInterval(function() {
  if (!clients.length) return;

  var cur = os.cpus();

  var o = {
    cpus: [], // per-cpu stats about usage
    usage: 0, // total % of avail compute in use
    load: os.loadavg().map(function(x) { return x.toFixed(3); }) // load averages
  };

  // now let's massage the output of os.cpus() into something nicer to deal
  // with
  for (var i = 0; i < NUM_CPUS; i++) {
    var cpu = { };

    var total = 0;
    delete cur[i].times.irq;
    Object.keys(cur[i].times).forEach(function(k) {
      cpu[k] = cur[i].times[k] - last[i].times[k];
      total += cpu[k];
    });

    var left = 0.0;
    Object.keys(cpu).forEach(function(k) {
      var b = (cpu[k] / total) * 100;
      cpu[k] = Math.round((b + left));
      left = b - cpu[k];
    });
    o.cpus.push(cpu);

    o.usage += (100 - cpu.idle) / NUM_CPUS;
  }

  o.usage = Math.round(o.usage).toFixed(0);

  // and send state down to the client
  clients.forEach(function(client) {
    client.emit('state', o);
  });

  last = cur;
}, 700);

