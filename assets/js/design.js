/* Design system page demos. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  var sw = $("#demoSwitch");
  sw.addEventListener("click", function () {
    var on = sw.getAttribute("aria-checked") !== "true";
    sw.setAttribute("aria-checked", String(on));
    $("#demoSwitchLabel").textContent = on ? "Insurance on" : "Insurance off";
  });

  var range = $("#dialRange"), arc = $("#dialArc"), ARC = 329.9;
  function updateDial() {
    var v = Number(range.value);
    arc.setAttribute("stroke-dashoffset", (ARC * (1 - v / 100)).toFixed(1));
    $("#dialOut").innerHTML = v + "%<small>LOAD</small>";
    var free = Math.round(32 * (1 - v / 100) * 10) / 10;
    $("#dialSpace").textContent = free + " ft";
    $("#dialPallets").textContent = "Room for about " + Math.floor(free / 4) * 2 + " more standard pallets";
    var b = $("#dialBadge");
    b.className = "badge " + (v >= 80 ? "s-delivered" : v >= 50 ? "s-customs" : "s-delayed");
    b.textContent = v >= 80 ? "Efficient" : v >= 50 ? "Room to consolidate" : "Under-loaded";
  }
  range.addEventListener("input", updateDial);
  updateDial();

  var TOKENS = [["--primary", "Primary"], ["--primary-2", "Indigo"], ["--accent", "Accent"], ["--accent-2", "Amber"], ["--cyan", "Cyan"], ["--success", "Success"], ["--warning", "Warning"], ["--danger", "Danger"], ["--bg", "Background"], ["--neu-bg", "Neu surface"], ["--text", "Text"], ["--muted", "Muted"]];
  function renderSwatches() {
    var cs = getComputedStyle(document.documentElement);
    $("#swatches").innerHTML = TOKENS.map(function (t) {
      var v = cs.getPropertyValue(t[0]).trim();
      return '<div class="swatch neu"><i style="background:' + v + '"></i><span>' + t[1] + "<code>" + t[0] + " · " + v + "</code></span></div>";
    }).join("");
  }
  renderSwatches();
  window.addEventListener("kgn:theme", renderSwatches);
})();
