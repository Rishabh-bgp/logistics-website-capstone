/* Kargonaut customer dashboard (demo). Charts are drawn by hand with <canvas> and SVG. */
(function () {
  "use strict";
  var D = window.KGN_DATA, K = window.KGN;
  var $ = function (s) { return document.querySelector(s); };
  var SVGNS = "http://www.w3.org/2000/svg";
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  /* ---------- deterministic demo data (seeded PRNG) ---------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rnd = mulberry32(2026);
  var pick = function (arr) { return arr[Math.floor(rnd() * arr.length)]; };
  var codes = Object.keys(D.cities), domestic = codes.filter(function (c) { return D.cities[c][5]; });
  var STATUS_W = [["Delivered", 52], ["In transit", 16], ["Customs", 6], ["Out for delivery", 9], ["Pending", 10], ["Delayed", 7]];
  function weightedStatus() { var r = rnd() * 100, acc = 0; for (var i = 0; i < STATUS_W.length; i++) { acc += STATUS_W[i][1]; if (r < acc) return STATUS_W[i][0]; } return "Delivered"; }
  var today = new Date(); today.setHours(12, 0, 0, 0);
  var rows = [];
  for (var i = 0; i < 64; i++) {
    var from = rnd() < 0.7 ? pick(domestic) : pick(codes), to;
    do { to = rnd() < 0.6 ? pick(domestic) : pick(codes); } while (to === from);
    var a = D.cities[from], b = D.cities[to], dom = a[5] && b[5];
    var mode = dom ? (rnd() < 0.7 ? "road" : "air") : (a[4] && b[4] && rnd() < 0.5 ? "sea" : "air");
    var service = rnd() < 0.55 ? "economy" : "express";
    var weight = Math.round((mode === "sea" ? 200 + rnd() * 1800 : 0.5 + rnd() * 60) * 10) / 10;
    var q = K.quote({ from: from, to: to, mode: mode, service: service, weight: weight, len: 0, wid: 0, hei: 0 });
    var age = Math.floor(rnd() * 90);
    var status = age > 20 ? (rnd() < 0.93 ? "Delivered" : "Delayed") : weightedStatus();
    var date = new Date(today.getTime() - age * 864e5);
    var suffix = { India: "IN", UAE: "AE", Singapore: "SG", "Sri Lanka": "LK", China: "CN", Japan: "JP", Netherlands: "NL", Germany: "DE", UK: "GB", Kenya: "KE", USA: "US", Australia: "AU" }[a[1]];
    rows.push({ id: "KGN-" + (10000 + Math.floor(rnd() * 89999)) + "-" + suffix, from: from, to: to, route: a[0] + " → " + b[0], mode: mode, status: status, date: date, weight: weight, cost: q.ok ? q.total : 0 });
  }
  window.KGN_ROWS = rows; // exposed for automated tests

  /* ---------- greeting + KPIs ---------- */
  var h = new Date().getHours();
  $("#greeting").textContent = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  var transit = rows.filter(function (r) { return ["In transit", "Customs", "Out for delivery"].indexOf(r.status) > -1; }).length;
  var delayed = rows.filter(function (r) { return r.status === "Delayed"; }).length;
  var done = rows.filter(function (r) { return r.status === "Delivered" || r.status === "Delayed"; });
  var onTime = done.length ? (done.filter(function (r) { return r.status === "Delivered"; }).length / done.length) * 100 : 0;
  $("#kpiTotal").textContent = rows.length.toLocaleString("en-IN");
  $("#kpiTransit").textContent = transit;
  $("#kpiDelayed").textContent = delayed + " delayed, needs attention";
  $("#kpiSpend").textContent = K.formatINR(rows.reduce(function (s, r) { return s + r.cost; }, 0));
  $("#kpiOntime").textContent = onTime.toFixed(1) + "%";
  requestAnimationFrame(function () { $("#gaugeVal").setAttribute("stroke-dashoffset", (301.6 * (1 - onTime / 100)).toFixed(1)); });

  function sparkPath(values) {
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    return values.map(function (v, i) { return (i ? "L" : "M") + (i / (values.length - 1) * 100).toFixed(1) + " " + (36 - (v - min) / ((max - min) || 1) * 32).toFixed(1); }).join(" ");
  }

  /* ---------- weekly series ---------- */
  var weeks = [];
  for (var w = 25; w >= 0; w--) {
    var booked = Math.round(70 + 25 * Math.sin((26 - w) / 3.2) + rnd() * 18 + (26 - w) * 1.4);
    weeks.push({ label: K.formatDate(new Date(today.getTime() - w * 7 * 864e5)).replace(/^\w+, /, ""), booked: booked, ontime: Math.round(booked * (0.9 + rnd() * 0.08)) });
  }
  $("#spark1").setAttribute("d", sparkPath(weeks.slice(-12).map(function (x) { return x.booked; })));
  $("#spark2").setAttribute("d", sparkPath(weeks.slice(-12).map(function (x) { return x.booked - x.ontime; })));
  $("#spark3").setAttribute("d", sparkPath(weeks.slice(-12).map(function (x) { return x.booked * 410 + (x.booked % 7) * 900; })));

  /* ---------- canvas line chart ---------- */
  var canvas = $("#lineChart"), ctx = canvas.getContext("2d"), tip = $("#lineTip"), range = 12, pts = [], anim = 1;
  function drawLine() {
    var box = $("#lineBox"), dpr = window.devicePixelRatio || 1, W = box.clientWidth, H = box.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var data = weeks.slice(-range), pad = { l: 40, r: 12, t: 14, b: 30 };
    var max = Math.ceil(Math.max.apply(null, data.map(function (d) { return d.booked; })) / 20) * 20;
    var X = function (i) { return pad.l + i * (W - pad.l - pad.r) / (data.length - 1); };
    var Y = function (v) { return H - pad.b - (v / max) * (H - pad.t - pad.b) * anim; };
    ctx.font = "600 11px " + css("--font"); ctx.fillStyle = css("--faint"); ctx.strokeStyle = css("--grid-line"); ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gy = H - pad.b - g / 4 * (H - pad.t - pad.b);
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(String(max * g / 4), pad.l - 8, gy + 4);
    }
    ctx.textAlign = "center";
    var every = Math.ceil(data.length / 7);
    data.forEach(function (d, i) { if (i % every === 0 || i === data.length - 1) ctx.fillText(d.label, X(i), H - 8); });
    function series(key, color, fill) {
      ctx.beginPath();
      data.forEach(function (d, i) {
        var x = X(i), y = Y(d[key]);
        if (!i) ctx.moveTo(x, y);
        else { var px = X(i - 1), py = Y(data[i - 1][key]), cx = (px + x) / 2; ctx.bezierCurveTo(cx, py, cx, y, x, y); }
      });
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();
      if (fill) {
        ctx.lineTo(X(data.length - 1), H - pad.b); ctx.lineTo(X(0), H - pad.b); ctx.closePath();
        var gr = ctx.createLinearGradient(0, pad.t, 0, H - pad.b); gr.addColorStop(0, "rgba(139,92,246,.35)"); gr.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = gr; ctx.fill();
      }
    }
    series("booked", "#8b5cf6", true);
    series("ontime", "#22d3ee", false);
    pts = data.map(function (d, i) { return { x: X(i), y: Y(d.booked), d: d }; });
    $("#lineSummary").textContent = "Over the last " + range + " weeks, weekly bookings ranged from " +
      Math.min.apply(null, data.map(function (d) { return d.booked; })) + " to " + Math.max.apply(null, data.map(function (d) { return d.booked; })) +
      ". Latest week: " + data[data.length - 1].booked + " booked, " + data[data.length - 1].ontime + " delivered on time.";
  }
  function animateLine() {
    if (K.reducedMotion()) { anim = 1; drawLine(); return; }
    var start = null;
    function f(t) { if (!start) start = t; anim = Math.min(1, (t - start) / 900); anim = 1 - Math.pow(1 - anim, 3); drawLine(); if (anim < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  canvas.addEventListener("mousemove", function (e) {
    if (!pts.length) return;
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, best = pts[0];
    pts.forEach(function (p) { if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p; });
    tip.hidden = false; tip.style.left = best.x + "px"; tip.style.top = best.y + "px";
    tip.textContent = best.d.label + ": " + best.d.booked + " booked · " + best.d.ontime + " on time";
  });
  canvas.addEventListener("mouseleave", function () { tip.hidden = true; });
  document.querySelectorAll('input[name="range"]').forEach(function (r) { r.addEventListener("change", function () { range = Number(r.value); animateLine(); }); });
  var rT; window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(drawLine, 120); });
  window.addEventListener("kgn:theme", function () { drawLine(); });
  animateLine();

  /* ---------- SVG donut ---------- */
  var modes = { road: 0, air: 0, sea: 0 };
  rows.forEach(function (r) { modes[r.mode]++; });
  var colors = { road: "#8b5cf6", air: "#22d3ee", sea: "#ff7a3d" }, C = 2 * Math.PI * 60, offset = 0, donut = $("#donut");
  Object.keys(modes).forEach(function (m) {
    var len = modes[m] / rows.length * C, c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("cx", 85); c.setAttribute("cy", 85); c.setAttribute("r", 60); c.setAttribute("class", "donut-seg");
    c.setAttribute("stroke", colors[m]); c.setAttribute("stroke-dasharray", (len - 2).toFixed(2) + " " + (C - len + 2).toFixed(2)); c.setAttribute("stroke-dashoffset", (-offset).toFixed(2));
    var t = document.createElementNS(SVGNS, "title"); t.textContent = D.rates[m].label + ": " + modes[m] + " shipments"; c.appendChild(t);
    donut.appendChild(c); offset += len;
  });
  $("#donutTotal").textContent = rows.length;
  $("#donutList").innerHTML = Object.keys(modes).map(function (m) {
    return '<li><span><i style="display:inline-block;width:12px;height:12px;border-radius:4px;background:' + colors[m] + ';margin-right:.5rem"></i>' + D.rates[m].label + "</span><strong>" + Math.round(modes[m] / rows.length * 100) + "%</strong></li>";
  }).join("");

  /* ---------- SVG bars ---------- */
  var months = [];
  for (var mi = 5; mi >= 0; mi--) {
    var md = new Date(today.getFullYear(), today.getMonth() - mi, 1);
    months.push({ label: md.toLocaleDateString("en-IN", { month: "short" }), v: Math.round(42 + rnd() * 38 + (5 - mi) * 4) });
  }
  var bars = $("#bars"), maxV = Math.max.apply(null, months.map(function (m) { return m.v; })), bw = 42, gap = (420 - 6 * bw) / 7;
  bars.innerHTML = months.map(function (m, i) {
    var bh = m.v / maxV * 160, x = gap + i * (bw + gap), y = 185 - bh, last = i === months.length - 1;
    return '<g class="bar"><title>' + m.label + ": ₹" + m.v + "k</title>" +
      '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="12" fill="url(#' + (last ? "barGradHot" : "barGrad") + ')"/>' +
      '<text x="' + (x + bw / 2) + '" y="' + (y - 8) + '" text-anchor="middle">' + m.v + "</text>" +
      '<text x="' + (x + bw / 2) + '" y="205" text-anchor="middle">' + m.label + "</text></g>";
  }).join("");

  /* ---------- table: sort, search, filter, paginate ---------- */
  var state = { key: "date", dir: "desc", q: "", status: "", page: 1, size: 8 };
  var MODE_LABEL = { road: "Road", air: "Air", sea: "Sea" };
  var BADGE = { "Delivered": "s-delivered", "In transit": "s-transit", "Customs": "s-customs", "Out for delivery": "s-out", "Pending": "s-pending", "Delayed": "s-delayed" };
  function filtered() {
    var q = state.q.toLowerCase();
    var list = rows.filter(function (r) {
      return (!state.status || r.status === state.status) && (!q || (r.id + " " + r.route).toLowerCase().indexOf(q) > -1);
    });
    list.sort(function (a, b) {
      var x = a[state.key], y = b[state.key];
      if (x instanceof Date) { x = x.getTime(); y = y.getTime(); }
      var c = typeof x === "number" ? x - y : String(x).localeCompare(String(y));
      return state.dir === "asc" ? c : -c;
    });
    return list;
  }
  function render() {
    var list = filtered(), pages = Math.max(1, Math.ceil(list.length / state.size));
    state.page = Math.min(state.page, pages);
    var start = (state.page - 1) * state.size, slice = list.slice(start, start + state.size);
    $("#tBody").innerHTML = slice.length ? slice.map(function (r) {
      return "<tr><td class=\"id\">" + r.id + "</td><td>" + K.escapeHTML(r.route) + "</td><td>" + MODE_LABEL[r.mode] + '</td><td><span class="badge ' + BADGE[r.status] + '">' + r.status + "</span></td><td>" +
        r.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + '</td><td class="num">' + r.weight.toLocaleString("en-IN") + ' kg</td><td class="num">' + K.formatINR(r.cost) + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="empty">No shipments match your filters.</td></tr>';
    $("#tInfo").textContent = list.length ? "Showing " + (start + 1) + "–" + (start + slice.length) + " of " + list.length + " shipments" : "Showing 0 of 0 shipments";
    var html = '<button type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? " disabled" : "") + ' aria-label="Previous page">‹</button>';
    for (var p = 1; p <= pages; p++) html += '<button type="button" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : "") + ' aria-label="Page ' + p + '">' + p + "</button>";
    html += '<button type="button" data-page="' + (state.page + 1) + '"' + (state.page === pages ? " disabled" : "") + ' aria-label="Next page">›</button>';
    $("#tPages").innerHTML = html;
    document.querySelectorAll("#shipTable th").forEach(function (th) {
      th.setAttribute("aria-sort", th.dataset.key === state.key ? (state.dir === "asc" ? "ascending" : "descending") : "none");
    });
  }
  document.querySelectorAll("#shipTable th button").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.parentElement.dataset.key;
      if (state.key === key) state.dir = state.dir === "asc" ? "desc" : "asc";
      else { state.key = key; state.dir = (key === "date" || key === "cost" || key === "weight") ? "desc" : "asc"; }
      state.page = 1; render();
    });
  });
  $("#tSearch").addEventListener("input", function (e) { state.q = e.target.value.trim(); state.page = 1; render(); });
  $("#tStatus").addEventListener("change", function (e) { state.status = e.target.value; state.page = 1; render(); });
  $("#tPages").addEventListener("click", function (e) { var b = e.target.closest("button[data-page]"); if (b && !b.disabled) { state.page = Number(b.dataset.page); render(); } });
  $("#exportCsv").addEventListener("click", function () {
    var lines = [["Tracking ID", "From", "To", "Mode", "Status", "Booked", "Weight (kg)", "Cost (INR)"].join(",")];
    filtered().forEach(function (r) { lines.push([r.id, D.cities[r.from][0], D.cities[r.to][0], MODE_LABEL[r.mode], r.status, r.date.toISOString().slice(0, 10), r.weight, r.cost].join(",")); });
    var url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    var a = document.createElement("a"); a.href = url; a.download = "kargonaut-shipments.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    K.toast("Exported " + (lines.length - 1) + " shipments to CSV.");
  });
  render();

  /* sidebar active link on scroll */
  var links = document.querySelectorAll('.dash-side nav a[href^="#"]');
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) links.forEach(function (a) { if (a.getAttribute("href") === "#" + x.target.id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (a) { var t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t); });
  }
})();
