window.Graph = {};

(function() {
  var   w = 600,
        h = 300,
   margin = 0;

  var vis = d3.select("body")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  var base = vis.append("svg:g").attr("transform", "translate(0, 300)");
  var g = vis.append("svg:g").attr("transform", "translate(45, 300)");

  var lagData = [],
       tpData = [],
     waitData = [],
    usageData = [];

  var MAX_HISTORY = 50;

  function updateData(arr, data) {
    arr.push(data);
    if (arr.length > MAX_HISTORY) arr.shift();
  }

  var labelOffset = 0;

  function drawLine(data, units, miny) {
    if (!miny || d3.max(data) > miny) miny = d3.max(data);
    var y = d3.scale.linear().domain([0, miny]).range([0 + margin, h - margin]),
        x = d3.scale.linear().domain([0, MAX_HISTORY]).range([0 + margin, w - margin]);

    var line = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d) { return -1 * y(d); });

    g.append("svg:path").attr("d", line(data));

    // now for a max label
    base.append("svg:text")
      .attr("class", "linktext")
      .attr('x', 0)
      .attr('y', 17 * labelOffset++ - (h - 10))
      .text(miny + units);
  }

  Graph.addSample = function(lag, throughput, waitTime, usage) {
    d3.selectAll('svg path').remove();
    d3.selectAll('svg text').remove();

    labelOffset = 0;

    updateData(waitData, waitTime);
    drawLine(waitData, "ms");

    updateData(usageData, usage);
    drawLine(usageData, "%", 100);

    updateData(tpData, throughput);
    drawLine(tpData, "rps", 10);

    updateData(lagData, lag);
    drawLine(lagData, "ms", 50);
  };
})();
