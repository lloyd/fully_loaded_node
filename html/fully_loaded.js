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
  $("#throughput").text(state.throughput + "rps");
  $("#processors").empty();
  state.cpus.forEach(addProc);
}


var lastMsg;
var latency = 0;
function updateLatency(t) {
  if (lastMsg) {
    var delay = (t - lastMsg) - 700;
    if (delay < 0) delay = 0;
    latency = Math.round((delay + (latency * 4)) / 5);
  }
  lastMsg = t;
  $('#latency').text(latency + "ms");
}

var requestTime = 0;
function requestLoad(load) {
  var startTime = new Date();
  var alphabet = "abcdefhijklmnopqrstuvwxyzABCDEFHIJKLMNOPQRSTUVWXYZ";
  var random = '?' + alphabet[Math.floor((Math.random()*alphabet.length))];
  $.get('/load/' + load + random, function(data, textStatus) {
    var curReqTime = (new Date() - startTime) / load;
    if (!requestTime) requestTime = curReqTime;
    else requestTime = (requestTime * 9 + curReqTime) / 10;
    $("#wait").text(requestTime.toFixed(0) + "ms");
    requestLoad(load);
  });
}

function runLoad() {
  // how much load should we run?  cores * 10 / 4
  var load = Math.round(parseInt($("#numcores").text(), 10) * 10 / 8);
  for (var i = 0; i < 8; i++) requestLoad(load);
}

$(document).ready(function() {
  $('button').click(function() {
    $('button').attr('disabled', 'disabled');

    runLoad();
  });
});
