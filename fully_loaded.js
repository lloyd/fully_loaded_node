$(document).ready(function() {
  function incHash() {
    var nth = parseInt(window.location.hash.substr(1) || "1", 10) + 1;
    nth = (nth > 3) ? 1 : nth;
    window.location.hash = "#" + nth;
  }

  function showSlide(last) {
    function showNew() {
      var nth = window.location.hash.substr(1) || "1";
      $("div.slide:nth-child(" + nth + ")").fadeIn(700);
    }
    if (last) $("div.slide:nth-child(" + last + ")").fadeOut(500, showNew);
    else showNew()
  }

  showSlide(null);

  $('body').click(function() {
    var nth = window.location.hash.substr(1) || "1"; 
    incHash();
    showSlide(nth);
  });
});
