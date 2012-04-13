var socket = io.connect('/');
socket.on('state', function (data) {
  updateLatency(new Date());
  updateDisplay(data);
});


function addProc(p) {
  function gimmeChars(cnt, ch) {
    var b = '';
    for (var i = 0; i < cnt; i++) b += ch;
    return b;
  }

  var proc = $("<div class=\"proc\"></div>");
  proc.append($("<span class='cn'>[</span>"));

  // 100 bars
  proc.append($('<span/>').addClass('st').text(gimmeChars(p.sys, '|')));
  proc.append($('<span/>').addClass('ni').text(gimmeChars(p.nice, '|')));
  proc.append($('<span/>').addClass('ut').text(gimmeChars(p.user, '|')));
  proc.append($('<span/>').addClass('id').text(gimmeChars(p.idle, ' ')));

  proc.append($("<span class='cn'>]</span>"));
  $("#processors").append(proc);
}

function updateDisplay(state) {
  $("#numcores").text(state.cpus.length);
  $("#loadavg").text(state.load.join(" "));
  $("#usage").text(state.usage + "%");
  $("#processors").empty();
  state.cpus.forEach(addProc);
}


var lastMsg;
var latency = 0;
function updateLatency(t) {
  if (lastMsg) {
    var delay = 700 - (t - lastMsg);
    if (delay < 0) delay = 0;
    latency = Math.round((delay + (latency * 4)) / 5);
  }
  lastMsg = t;
  $('#latency').text(latency + "ms");
}