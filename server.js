var express = require('express'),
        app = express.createServer(),
         io = require('socket.io').listen(app),
         os = require('os'),
     bcrypt = require('bcrypt');

app.listen(process.env['PORT'] || 3000);

var workComplete = 0;
function doOneWorks(cb) {
  bcrypt.genSalt(12, function(err, salt) {
    bcrypt.hash("B4c0/\/", salt, function(err, hash) {
      // Store hash in your password DB.
      workComplete++;
      cb();
    });
  });
}

app.get('/load/:work?', function(req, res) {
  // how much work should we do?  the client can send in a work factor,
  // and this causes one API hit to have the affect of N
  var work = parseInt(req.params.work, 10) || 1;
  var workDone = 0;
  for (var i = 0; i < work; i++) doOneWorks(function() {
    if (++workDone === work) res.send("okie dokie");
  });
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
var running = false;
var ran = 0;

var throughput = 0.0;
setInterval(function() {
  if (!clients.length) return;

  // don't run more frequently than once every 700ms
  var now = new Date();
  if (now - ran < 690) return;

  // update throughput
  throughput = ((throughput * 3 + 
                 (workComplete / ((now - ran) / 1000))) / 4).toFixed(1);
  workComplete = 0;

  ran = now;

  var cur = os.cpus();
  var o = {
    cpus: [], // per-cpu stats about usage
    usage: 0, // total % of avail compute in use
    load: os.loadavg().map(function(x) { return x.toFixed(3); }), // load averages
    throughput: throughput
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

