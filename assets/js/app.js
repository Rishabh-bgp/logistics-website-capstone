/* Kargonaut Logistics — home page features. Vanilla JS, no dependencies. */
(function () {
  "use strict";
  var D = window.KGN_DATA, K = window.KGN;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = K.escapeHTML;
  var STORE = "kgn-bookings";
  var STAGES = ["Picked up", "In transit", "Customs", "Out for delivery", "Delivered"];
  var MODE_ICON = { road: "i-truck", air: "i-plane", sea: "i-ship" };

  function cityName(code) { return D.cities[code] ? D.cities[code][0] : code; }
  function scrollToEl(el) { el.scrollIntoView({ behavior: K.reducedMotion() ? "auto" : "smooth", block: "start" }); }

  /* =========================================================
     Storage helpers
     ========================================================= */
  function loadBookings() {
    try { var v = JSON.parse(localStorage.getItem(STORE) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function saveBookings(list) { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) { /* ignore */ } }

  /* =========================================================
     City <select>s
     ========================================================= */
  function fillCitySelect(sel, domesticOnly) {
    var groups = { India: [], International: [] };
    Object.keys(D.cities).forEach(function (code) {
      var c = D.cities[code];
      if (domesticOnly && !c[5]) return;
      groups[c[5] ? "India" : "International"].push('<option value="' + code + '">' + esc(c[0]) + (c[5] ? "" : ", " + esc(c[1])) + (c[4] ? " ⚓" : "") + "</option>");
    });
    var html = sel.dataset.placeholder ? '<option value="">' + esc(sel.dataset.placeholder) + "</option>" : "";
    Object.keys(groups).forEach(function (g) { if (groups[g].length) html += '<optgroup label="' + g + '">' + groups[g].join("") + "</optgroup>"; });
    sel.innerHTML = html;
  }
  $$("select[data-cities]").forEach(function (s) { fillCitySelect(s, s.dataset.cities === "domestic"); });

  /* =========================================================
     Services filter
     ========================================================= */
  var filterBtns = $$("#serviceFilters .chip");
  var serviceCards = $$("#serviceGrid .service-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter, shown = 0;
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      serviceCards.forEach(function (card) {
        var match = f === "all" || card.dataset.mode.split(" ").indexOf(f) > -1;
        card.classList.toggle("is-hidden", !match);
        card.classList.remove("pop");
        if (match) { void card.offsetWidth; card.classList.add("pop"); shown++; }
      });
      $("#serviceCount").textContent = "Showing " + shown + " service" + (shown === 1 ? "" : "s");
    });
  });

  /* =========================================================
     Animated counters
     ========================================================= */
  function runCounter(el) {
    var target = parseFloat(el.dataset.target), dec = parseInt(el.dataset.decimals || "0", 10), suffix = el.dataset.suffix || "";
    var fmt = function (v) { return v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix; };
    if (K.reducedMotion()) { el.textContent = fmt(target); return; }
    var start = null, dur = 1700;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  var counters = $$(".count");
  if (K.reducedMotion()) counters.forEach(runCounter);
  else if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { runCounter(x.target); cio.unobserve(x.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(runCounter);

  /* =========================================================
     Shipment tracking
     ========================================================= */
  var trackForm = $("#trackForm"), trackInput = $("#trackId"), trackError = $("#trackError"), trackResult = $("#trackResult");

  function normaliseId(v) {
    v = String(v || "").toUpperCase().replace(/\s+/g, "");
    var m = v.match(/^KGN-?(\d{5})-?([A-Z]{2})$/);
    return m ? "KGN-" + m[1] + "-" + m[2] : v;
  }

  function findShipment(id) {
    if (D.samples[id]) return D.samples[id];
    var b = loadBookings().filter(function (x) { return x.id === id; })[0];
    if (!b) return null;
    return {
      from: b.from, to: b.to, mode: b.mode, service: D.service[b.service].label, weight: b.weight, pieces: 1, stage: -1,
      booking: b,
      events: [[null, "Picked up", "Pickup scheduled for " + K.formatDate(new Date(b.pickupDate + "T10:00:00"))], [null, "In transit", ""], [null, "Customs", ""], [null, "Out for delivery", ""], [null, "Delivered", ""]]
    };
  }

  function statusOf(s) {
    if (s.stage === -1) return ["Pickup scheduled", "s-pending"];
    if (s.delayed) return ["Delayed", "s-delayed"];
    return [["Picked up", "In transit", "In customs", "Out for delivery", "Delivered"][s.stage], ["s-transit", "s-transit", "s-customs", "s-out", "s-delivered"][s.stage]];
  }

  function trackShipment(raw) {
    var id = normaliseId(raw);
    trackInput.value = id;
    var s = id ? findShipment(id) : null;
    if (!s) {
      trackInput.setAttribute("aria-invalid", "true");
      trackError.textContent = id ? "We couldn't find shipment \u201c" + id + "\u201d. Check the ID, or try one of the samples." : "Enter a tracking ID, for example KGN-48213-IN.";
      trackResult.hidden = true;
      return false;
    }
    trackInput.removeAttribute("aria-invalid");
    trackError.textContent = "";
    renderTracking(id, s);
    return true;
  }

  function renderTracking(id, s) {
    var now = new Date(), st = statusOf(s);
    var eta;
    if (s.stage === 4) eta = "Delivered " + K.formatDateTime(new Date(now.getTime() + s.events[4][0] * 3600e3));
    else if (s.booking) eta = K.formatDate(new Date(s.booking.delivery));
    else eta = K.formatDate(new Date(now.getTime() + s.etaHours * 3600e3)) + " (in ~" + (s.etaHours < 24 ? s.etaHours + " h" : Math.round(s.etaHours / 24) + " days") + ")";
    $("#tId").textContent = id;
    $("#tRoute").textContent = cityName(s.from) + " \u2192 " + cityName(s.to);
    $("#tMode").textContent = D.rates[s.mode].label + " \u00b7 " + s.service;
    $("#tWeight").textContent = s.weight + " kg \u00b7 " + s.pieces + (s.pieces > 1 ? " pieces" : " piece");
    $("#tStatus").innerHTML = '<span class="badge ' + st[1] + '">' + esc(st[0]) + "</span>";
    $("#tEta").textContent = eta;

    var domestic = D.cities[s.from][5] && D.cities[s.to][5];
    var icons = ["i-box", MODE_ICON[s.mode], "i-doc", "i-pin", "i-check"];
    $("#timeline").innerHTML = s.events.map(function (ev, i) {
      var skipped = i === 2 && domestic;
      var cls = skipped ? "skipped" : (i < s.stage || (i === s.stage && s.stage === 4)) ? "done" : (i === s.stage ? "current" : "");
      if (skipped && s.stage > 2) cls = "skipped done";
      var time = ev[0] !== null ? '<time datetime="' + new Date(now.getTime() + ev[0] * 3600e3).toISOString() + '">' + K.formatDateTime(new Date(now.getTime() + ev[0] * 3600e3)) + "</time>" : "";
      var note = ev[2] || (i > s.stage ? "Pending" : "");
      return '<li class="' + cls + '" style="--i:' + i + '"' + (cls.indexOf("current") > -1 ? ' aria-current="step"' : "") + '>' +
        '<span class="dot"><svg aria-hidden="true"><use href="#' + icons[i] + '"></use></svg></span>' +
        "<div><h4>" + STAGES[i] + (cls.indexOf("done") > -1 ? '<span class="sr-only"> (completed)</span>' : "") + "</h4><p>" + esc(note) + "</p>" + time + "</div></li>";
    }).join("");

    var progress = s.stage === -1 ? 0 : (s.progress !== undefined ? s.progress : [0.04, 0.5, 0.78, 0.94, 1][s.stage]);
    $("#tProgressText").textContent = Math.round(progress * 100) + "% of route complete";
    trackResult.hidden = false;
    drawRoute(s.from, s.to, s.mode, progress, domestic);
    var bar = $("#tProgress");
    bar.style.width = "0%";
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = (progress * 100) + "%"; }); });
  }

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  function drawRoute(from, to, mode, progress, domestic) {
    var svg = $("#routeMap"), layer = $("#routeLayer");
    var a = K.project(D.cities[from][2], D.cities[from][3]), b = K.project(D.cities[to][2], D.cities[to][3]);
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    var c = [(a[0] + b[0]) / 2 + (dy / len) * len * 0.22, (a[1] + b[1]) / 2 - Math.abs(dx / len) * len * 0.22 - len * 0.05];
    var xs = [a[0], b[0], c[0]], ys = [a[1], b[1], c[1]];
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var w = Math.max((maxX - minX) * 1.5, domestic ? 70 : 220), h = w / 2;
    if ((maxY - minY) * 1.5 > h) { h = (maxY - minY) * 1.5; w = h * 2; }
    var vx = (minX + maxX) / 2 - w / 2, vy = (minY + maxY) / 2 - h / 2;
    svg.setAttribute("viewBox", vx.toFixed(1) + " " + vy.toFixed(1) + " " + w.toFixed(1) + " " + h.toFixed(1));
    // pick the dot layer whose density suits the zoom level
    var layerName = (w < 160 && vx > 640 && vx + w < 800) ? "Region" : (w < 420 && vx > 560 && vx + w < 1000 && vy > 70 && vy + h < 330) ? "Mid" : "Global";
    ["Region", "Mid", "Global"].forEach(function (n) { $("#routeDots" + n).style.display = n === layerName ? "" : "none"; });
    $("#routeDotsRegion").setAttribute("stroke-width", 0.85);
    $("#routeDotsMid").setAttribute("stroke-width", 1.9);
    $("#routeDotsGlobal").setAttribute("stroke-width", 2.4);

    var u = w / 100;
    layer.innerHTML = "";
    var d = "M" + a[0] + " " + a[1] + " Q" + c[0] + " " + c[1] + " " + b[0] + " " + b[1];
    layer.appendChild(svgEl("path", { d: d, class: "route-base", "stroke-width": u * 0.7, "stroke-dasharray": u * 1.2 + " " + u * 1.4 }));
    var done = svgEl("path", { d: d, class: "route-done", "stroke-width": u * 0.9, pathLength: 100, "stroke-dasharray": "100 100", "stroke-dashoffset": 100 });
    layer.appendChild(done);
    var horizontal = Math.abs(dx) >= Math.abs(dy);
    [[a, from], [b, to]].forEach(function (p, i) {
      layer.appendChild(svgEl("circle", { cx: p[0][0], cy: p[0][1], r: u * 1.3, class: "route-city", "stroke-width": u * 0.4 }));
      var sign = (i === 0 ? -1 : 1) * (horizontal ? (dx >= 0 ? 1 : -1) : (dy >= 0 ? 1 : -1));
      var lx = horizontal ? p[0][0] + sign * u * 2.6 : p[0][0] - u * 2.6;
      var ly = horizontal ? p[0][1] + u * 1.1 : p[0][1] + sign * u * 2.4 + u * 1.1;
      var anchor = horizontal ? (sign > 0 ? "start" : "end") : "end";
      var t = svgEl("text", { x: lx, y: ly, class: "route-label", "font-size": u * 3.1, "text-anchor": anchor, "stroke-width": u * 0.8 });
      t.textContent = cityName(p[1]);
      layer.appendChild(t);
    });
    var veh = svgEl("g", { class: "route-vehicle" });
    veh.appendChild(svgEl("circle", { r: u * 3, cx: 0, cy: 0 }));
    veh.appendChild(svgEl("use", { href: "#" + MODE_ICON[mode], x: -u * 1.8, y: -u * 1.8, width: u * 3.6, height: u * 3.6 }));
    layer.appendChild(veh);
    var total = done.getTotalLength();
    function place(p) { var pt = done.getPointAtLength(total * p); veh.setAttribute("transform", "translate(" + pt.x.toFixed(2) + " " + pt.y.toFixed(2) + ")"); }
    if (K.reducedMotion()) { done.setAttribute("stroke-dashoffset", 100 - progress * 100); place(progress); return; }
    place(0);
    requestAnimationFrame(function () {
      done.setAttribute("stroke-dashoffset", 100 - progress * 100);
      var start = null;
      function anim(t) { if (!start) start = t; var k = Math.min(1, (t - start) / 1800), e = 1 - Math.pow(1 - k, 3); place(progress * e); if (k < 1) requestAnimationFrame(anim); }
      requestAnimationFrame(anim);
    });
  }

  if (trackForm) {
    trackForm.addEventListener("submit", function (e) { e.preventDefault(); trackShipment(trackInput.value); });
    $$(".sample-id").forEach(function (b) { b.addEventListener("click", function () { trackShipment(b.dataset.id); }); });
  }
  var quick = $("#quickTrack");
  if (quick) quick.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("#quickTrackId").value.trim();
    scrollToEl($("#track"));
    if (v) trackShipment(v); else trackInput.focus();
  });
  window.KGN.track = trackShipment;

  /* =========================================================
     Instant quote
     ========================================================= */
  var qf = $("#quoteForm");
  function readQuote() {
    return {
      from: $("#qFrom").value, to: $("#qTo").value, weight: $("#qWeight").value,
      len: $("#qLen").value, wid: $("#qWid").value, hei: $("#qHei").value,
      mode: (qf.querySelector('input[name="qMode"]:checked') || {}).value,
      service: (qf.querySelector('input[name="qService"]:checked') || {}).value
    };
  }
  var lastQuote = null;
  function updateQuote() {
    var o = readQuote(), q = K.quote(o), notice = $("#qNotice");
    lastQuote = q.ok ? { opts: o, q: q } : null;
    $("#qBook").disabled = !q.ok;
    if (!q.ok) {
      notice.hidden = false; notice.textContent = q.error;
      ["qDistance", "qBase", "qFreight", "qService", "qFuel", "qSubtotal", "qGst"].forEach(function (id) { $("#" + id).textContent = "\u2014"; });
      $("#qTotal").textContent = "\u2014"; $("#qEta").textContent = "Not available for this combination"; $("#qEta").dataset.days = "";
      return;
    }
    notice.hidden = true;
    $("#qDistance").textContent = q.km.toLocaleString("en-IN") + " km";
    $("#qActual").textContent = q.actual + " kg";
    $("#qVol").textContent = q.volumetric + " kg";
    $("#qChargeable").textContent = q.chargeable + " kg";
    $("#qActualBox").classList.toggle("win", q.actual >= q.volumetric);
    $("#qVolBox").classList.toggle("win", q.volumetric > q.actual);
    $("#qBase").textContent = K.formatINR(q.base);
    $("#qFreight").textContent = K.formatINR(q.freight);
    $("#qService").textContent = K.formatINR(q.serviceFee);
    $("#qFuel").textContent = K.formatINR(q.fuel);
    $("#qSubtotal").textContent = K.formatINR(q.subtotal);
    $("#qGst").textContent = K.formatINR(q.gst);
    $("#qTotal").textContent = K.formatINR(q.total);
    $("#qTotal").dataset.value = q.total;
    $("#qEta").dataset.days = q.days;
    $("#qEta").textContent = q.days === 0 ? "Today by 9 PM (same-day)" : K.formatDate(q.delivery) + " \u00b7 " + q.days + (q.days === 1 ? " day" : " days");
  }
  if (qf) {
    qf.addEventListener("input", updateQuote);
    qf.addEventListener("change", updateQuote);
    qf.addEventListener("submit", function (e) { e.preventDefault(); });
    $("#qSwap").addEventListener("click", function () { var f = $("#qFrom").value; $("#qFrom").value = $("#qTo").value; $("#qTo").value = f; updateQuote(); });
    $$(".stepper button", qf).forEach(function (b) {
      b.addEventListener("click", function () {
        var input = $("#" + b.dataset.for), step = parseFloat(b.dataset.step);
        input.value = Math.max(0.5, Math.round((parseFloat(input.value || 0) + step) * 10) / 10);
        updateQuote();
      });
    });
    $("#qFrom").value = "MUM"; $("#qTo").value = "DEL";
    updateQuote();
    $("#qBook").addEventListener("click", function () {
      if (!lastQuote) return;
      prefillBooking(lastQuote.opts);
      scrollToEl($("#book"));
      setTimeout(function () { $("#sName").focus({ preventScroll: true }); }, 400);
      K.toast("Quote copied into the pickup form.");
    });
  }

  /* =========================================================
     Book a pickup (multi-step)
     ========================================================= */
  var bf = $("#bookForm"), step = 1, STEPS = 4;
  function todayISO() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function prefillBooking(o) {
    if (D.cities[o.from][5]) $("#sCity").value = o.from;
    $("#rCity").value = o.to;
    $("#bWeight").value = o.weight; $("#bLen").value = o.len; $("#bWid").value = o.wid; $("#bHei").value = o.hei;
    var m = bf.querySelector('input[name="bMode"][value="' + o.mode + '"]'); if (m) m.checked = true;
    var s = bf.querySelector('input[name="bService"][value="' + o.service + '"]'); if (s) s.checked = true;
    showStep(1);
  }
  function setErr(id, msg) {
    var input = $("#" + id), err = $("#err-" + id);
    if (msg) { input.setAttribute("aria-invalid", "true"); } else input.removeAttribute("aria-invalid");
    if (err) err.textContent = msg || "";
    return !msg;
  }
  function bookingOpts() {
    return {
      from: $("#sCity").value, to: $("#rCity").value, weight: $("#bWeight").value, len: $("#bLen").value, wid: $("#bWid").value, hei: $("#bHei").value,
      mode: (bf.querySelector('input[name="bMode"]:checked') || {}).value, service: (bf.querySelector('input[name="bService"]:checked') || {}).value
    };
  }
  function validateStep(n) {
    var ok = true, v = function (id) { return $("#" + id).value.trim(); };
    var phone = /^[6-9]\d{9}$/, pin = /^\d{6}$/;
    function req(id, label, test, bad) {
      var val = v(id), msg = "";
      if (!val) msg = label + " is required.";
      else if (test && !test(val)) msg = bad;
      if (!setErr(id, msg)) ok = false;
    }
    if (n === 1) {
      req("sName", "Sender name", function (x) { return x.length >= 2; }, "Use at least 2 characters.");
      req("sPhone", "Phone", function (x) { return phone.test(x.replace(/[\s-]/g, "")); }, "Enter a 10-digit Indian mobile number.");
      req("sAddress", "Pickup address", function (x) { return x.length >= 8; }, "Add a little more detail (8+ characters).");
      req("sCity", "Pickup city");
      req("sPin", "PIN code", function (x) { return pin.test(x); }, "PIN codes have 6 digits.");
      req("pickupDate", "Pickup date", function (x) {
        if (x < todayISO()) return false;
        return new Date(x + "T12:00:00").getDay() !== 0;
      }, "Choose today or a later date (no pickups on Sundays).");
    }
    if (n === 2) {
      req("rName", "Receiver name", function (x) { return x.length >= 2; }, "Use at least 2 characters.");
      req("rPhone", "Phone", function (x) { return /^\+?[\d\s-]{8,16}$/.test(x); }, "Enter a valid phone number.");
      req("rAddress", "Delivery address", function (x) { return x.length >= 8; }, "Add a little more detail (8+ characters).");
      req("rCity", "Delivery city");
      req("rPin", "Postal code", function (x) { return /^[A-Za-z0-9\s-]{3,10}$/.test(x); }, "Enter a valid postal code.");
      if (ok && v("rCity") === v("sCity")) { setErr("rCity", "Delivery city must differ from the pickup city."); ok = false; }
    }
    if (n === 3) {
      req("pkgType", "Package type");
      req("bWeight", "Weight", function (x) { var w = parseFloat(x); return w > 0 && w <= 5000; }, "Enter 0.1 to 5,000 kg.");
      if (ok) {
        var q = K.quote(bookingOpts());
        setErr("bWeight", "");
        $("#err-bMode").textContent = q.ok ? "" : q.error;
        if (!q.ok) ok = false;
      }
    }
    if (n === 4) {
      var agree = $("#agree");
      if (!agree.checked) { agree.setAttribute("aria-invalid", "true"); $("#err-agree").textContent = "Please confirm the package contains no prohibited items."; ok = false; }
      else { agree.removeAttribute("aria-invalid"); $("#err-agree").textContent = ""; }
    }
    if (!ok) { var first = bf.querySelector('.step-pane:not([hidden]) [aria-invalid="true"]'); if (first) first.focus(); }
    return ok;
  }
  function renderReview() {
    var o = bookingOpts(), q = K.quote(o), v = function (id) { return esc($("#" + id).value.trim()); };
    $("#review").innerHTML =
      "<section><h4>Pickup</h4><p><strong>" + v("sName") + "</strong> \u00b7 " + v("sPhone") + "<br>" + v("sAddress") + ", " + esc(cityName(o.from)) + " " + v("sPin") + "<br>On " + esc(K.formatDate(new Date($("#pickupDate").value + "T12:00:00"))) + "</p></section>" +
      "<section><h4>Delivery</h4><p><strong>" + v("rName") + "</strong> \u00b7 " + v("rPhone") + "<br>" + v("rAddress") + ", " + esc(cityName(o.to)) + " " + v("rPin") + "</p></section>" +
      "<section><h4>Package</h4><p>" + v("pkgType") + " \u00b7 " + esc(o.weight) + " kg (chargeable " + q.chargeable + " kg) \u00b7 " + D.rates[o.mode].label + " \u00b7 " + D.service[o.service].label + "</p></section>" +
      '<section><h4>Estimate</h4><p><strong id="reviewTotal">' + K.formatINR(q.total) + "</strong> incl. GST \u00b7 delivery by " + esc(K.formatDate(K.addDays(new Date($("#pickupDate").value + "T12:00:00"), q.days))) + "</p></section>";
  }
  function showStep(n) {
    step = n;
    $$(".step-pane", bf).forEach(function (p) { p.hidden = Number(p.dataset.step) !== n; });
    $$("#bookSteps li").forEach(function (li, i) {
      li.classList.toggle("active", i + 1 === n); li.classList.toggle("done", i + 1 < n);
      if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("#bBack").hidden = n === 1;
    $("#bNext").innerHTML = n === STEPS ? 'Confirm booking <svg aria-hidden="true"><use href="#i-check"></use></svg>' : 'Continue <svg aria-hidden="true"><use href="#i-arrow"></use></svg>';
    $("#stepStatus").textContent = "Step " + n + " of " + STEPS;
    if (n === 4) renderReview();
  }
  function newBookingId(existing) {
    var id;
    do {
      var n = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 1e9);
      id = "KGN-" + String(10000 + (n % 90000)) + "-BK";
    } while (existing.some(function (b) { return b.id === id; }) || D.samples[id]);
    return id;
  }
  function confirmBooking() {
    var o = bookingOpts(), q = K.quote(o), list = loadBookings();
    var pickup = $("#pickupDate").value;
    var b = {
      id: newBookingId(list), createdAt: new Date().toISOString(), from: o.from, to: o.to, mode: o.mode, service: o.service,
      weight: parseFloat(o.weight), dims: [o.len, o.wid, o.hei].map(Number), pkgType: $("#pkgType").value,
      sender: $("#sName").value.trim(), receiver: $("#rName").value.trim(), pickupDate: pickup,
      delivery: K.addDays(new Date(pickup + "T12:00:00"), q.days).toISOString(), total: q.total, status: "Pickup scheduled"
    };
    list.unshift(b); saveBookings(list);
    bf.hidden = true; $("#bookSteps").hidden = true;
    var c = $("#bookConfirm");
    c.hidden = false;
    $("#confirmId").textContent = b.id;
    $("#confirmText").textContent = "Pickup from " + cityName(b.from) + " on " + K.formatDate(new Date(pickup + "T12:00:00")) + ", delivering to " + cityName(b.to) + ". Estimated total " + K.formatINR(b.total) + " (pay on pickup).";
    c.focus();
    renderShipments();
    K.toast("Booking " + b.id + " confirmed!");
  }
  if (bf) {
    $("#pickupDate").min = todayISO();
    (function () { var d = new Date(); d.setDate(d.getDate() + (d.getDay() === 6 ? 2 : 1)); $("#pickupDate").value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); })();
    bf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(step)) return;
      if (step < STEPS) { showStep(step + 1); var f = bf.querySelector('.step-pane:not([hidden]) input, .step-pane:not([hidden]) select'); if (f) f.focus(); }
      else confirmBooking();
    });
    $("#bBack").addEventListener("click", function () { if (step > 1) showStep(step - 1); });
    $("#bookAnother").addEventListener("click", function () {
      bf.reset(); bf.hidden = false; $("#bookSteps").hidden = false; $("#bookConfirm").hidden = true;
      $$('[aria-invalid="true"]', bf).forEach(function (x) { x.removeAttribute("aria-invalid"); });
      $$(".field-error", bf).forEach(function (x) { x.textContent = ""; });
      $("#pickupDate").min = todayISO();
      showStep(1); $("#sName").focus();
    });
    $("#trackBooked").addEventListener("click", function () { var id = $("#confirmId").textContent; scrollToEl($("#track")); trackShipment(id); });
    $("#copyId").addEventListener("click", function () {
      var id = $("#confirmId").textContent;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(id).then(function () { K.toast("Booking ID copied."); }, function () { K.toast("Copy failed. ID: " + id); });
      else K.toast("Your booking ID is " + id);
    });
    showStep(1);
  }

  /* My shipments */
  function renderShipments() {
    var list = loadBookings(), box = $("#shipList");
    if (!box) return;
    $("#shipCount").textContent = list.length;
    $("#clearShipments").hidden = list.length === 0;
    if (!list.length) {
      box.innerHTML = '<li class="empty"><svg aria-hidden="true"><use href="#i-box"></use></svg>No bookings yet. Book a pickup and it will appear here, saved on this device.</li>';
      return;
    }
    box.innerHTML = list.map(function (b) {
      return '<li class="ship-item neu"><div class="top"><span class="id">' + esc(b.id) + '</span><span class="badge s-pending">' + esc(b.status) + "</span></div>" +
        '<div class="route">' + esc(cityName(b.from)) + " \u2192 " + esc(cityName(b.to)) + "</div>" +
        '<div class="sub">' + esc(D.rates[b.mode].label) + " \u00b7 " + esc(D.service[b.service].label) + " \u00b7 " + esc(b.weight) + " kg \u00b7 " + K.formatINR(b.total) + " \u00b7 pickup " + esc(K.formatDate(new Date(b.pickupDate + "T12:00:00"))) + "</div>" +
        '<div class="acts"><button type="button" class="btn btn-neu btn-sm" data-track="' + esc(b.id) + '">Track</button>' +
        '<button type="button" class="btn btn-neu btn-sm" data-remove="' + esc(b.id) + '" aria-label="Remove booking ' + esc(b.id) + '">Remove</button></div></li>';
    }).join("");
  }
  var shipList = $("#shipList");
  if (shipList) {
    shipList.addEventListener("click", function (e) {
      var t = e.target.closest("[data-track]"), r = e.target.closest("[data-remove]");
      if (t) { scrollToEl($("#track")); trackShipment(t.dataset.track); }
      if (r) {
        if (r.dataset.armed) { saveBookings(loadBookings().filter(function (b) { return b.id !== r.dataset.remove; })); renderShipments(); K.toast("Booking removed."); }
        else { r.dataset.armed = "1"; r.textContent = "Confirm remove"; setTimeout(function () { if (r.isConnected) { delete r.dataset.armed; r.textContent = "Remove"; } }, 4000); }
      }
    });
    $("#clearShipments").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      if (btn.dataset.armed) { saveBookings([]); delete btn.dataset.armed; btn.textContent = "Clear all"; renderShipments(); K.toast("All bookings cleared."); }
      else { btn.dataset.armed = "1"; btn.textContent = "Tap again to clear"; setTimeout(function () { delete btn.dataset.armed; btn.textContent = "Clear all"; }, 4000); }
    });
    renderShipments();
  }

  /* =========================================================
     Coverage map with clickable hubs
     ========================================================= */
  var VIEWS = { india: [666.7, 128, 122.2, 104], global: [0, 0, 1000, 420] };
  var cov = $("#coverageMap");
  function hubXY(h) { var c = D.cities[h.id]; return K.project(c[2], c[3]); }
  function renderHubs(view) {
    var vb = VIEWS[view], svg = $("#coverageSvg"), wrap = $("#hubButtons");
    svg.setAttribute("viewBox", vb.join(" "));
    cov.style.aspectRatio = vb[2] + " / " + vb[3];
    $("#covDotsRegion").style.display = view === "india" ? "" : "none";
    $("#covDotsGlobal").style.display = view === "india" ? "none" : "";
    wrap.innerHTML = "";
    var placed = [], aspect = vb[3] / vb[2];
    D.hubs.slice().sort(function (a, b) { return (b.major ? 1 : 0) - (a.major ? 1 : 0); }).forEach(function (h, i) {
      var p = hubXY(h), x = (p[0] - vb[0]) / vb[2], y = (p[1] - vb[1]) / vb[3];
      if (x < 0.02 || x > 0.98 || y < 0.02 || y > 0.98) return;
      if (view === "global" && D.cities[h.id][5] && !h.major) return; // keep the global view readable
      // skip hubs that would sit on top of one already placed (keeps every button clickable)
      if (placed.some(function (q) { return Math.hypot(q[0] - x, (q[1] - y) * aspect) < 0.03; })) return;
      placed.push([x, y]);
      var b = document.createElement("button");
      b.type = "button"; b.className = "hub-btn" + (h.major ? " major" : "");
      b.style.left = (x * 100) + "%"; b.style.top = (y * 100) + "%"; b.style.setProperty("--d", (i % 5) * 0.4 + "s");
      b.dataset.hub = h.id; b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", cityName(h.id) + " " + h.type.toLowerCase() + " hub");
      wrap.appendChild(b);
    });
    var sel = $("#hubButtons [data-hub='" + (currentHub || "MUM") + "']") || $("#hubButtons .hub-btn");
    if (sel) selectHub(sel.dataset.hub, false);
  }
  var currentHub = "MUM";
  function selectHub(id, focusPanel) {
    currentHub = id;
    var h = D.hubs.filter(function (x) { return x.id === id; })[0], c = D.cities[id];
    $$("#hubButtons .hub-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.hub === id)); });
    $("#hubName").textContent = c[0] + ", " + c[1];
    $("#hubType").textContent = h.type + (c[4] ? " \u00b7 seaport access" : "");
    $("#hubArea").textContent = h.area;
    $("#hubDaily").textContent = h.daily;
    $("#hubLinks").textContent = h.links.length;
    $("#hubLinkNames").textContent = "Direct lanes to " + h.links.map(cityName).join(", ") + ".";
    var layer = $("#hubLinks-layer"), p = hubXY(h);
    layer.innerHTML = "";
    var vb = $("#coverageSvg").getAttribute("viewBox").split(" ").map(Number), sw = vb[2] / 500;
    h.links.forEach(function (l) {
      var q = K.project(D.cities[l][2], D.cities[l][3]);
      var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - Math.abs(q[0] - p[0]) * 0.25 - 2;
      layer.appendChild(svgEl("path", { d: "M" + p[0] + " " + p[1] + " Q" + mx + " " + my + " " + q[0] + " " + q[1], style: "stroke-width:" + sw + ";stroke-dasharray:" + sw * 3 + " " + sw * 3 }));
    });
    if (focusPanel) $("#hubPanel").focus();
  }
  if (cov) {
    $("#hubButtons").addEventListener("click", function (e) { var b = e.target.closest(".hub-btn"); if (b) selectHub(b.dataset.hub, false); });
    $$('input[name="mapView"]').forEach(function (r) { r.addEventListener("change", function () { renderHubs(r.value); }); });
    renderHubs("india");
  }

  /* =========================================================
     Testimonials carousel
     ========================================================= */
  var car = $("#testimonials");
  if (car) {
    var track = $(".carousel-track", car), slides = $$(".slide", car), idx = 0, timer = null, paused = false, hovering = false;
    var dots = $(".dots", car), playBtn = $("#carPlay");
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Show testimonial " + (i + 1) + " of " + slides.length);
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
    });
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-100 * idx) + "%)";
      slides.forEach(function (s, j) { var on = j === idx; s.setAttribute("aria-hidden", String(!on)); if (on) s.removeAttribute("inert"); else s.setAttribute("inert", ""); });
      $$("button", dots).forEach(function (d, j) { if (j === idx) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    }
    function schedule() { clearInterval(timer); if (!paused && !hovering) timer = setInterval(function () { go(idx + 1); }, 6000); }
    function setPaused(p) {
      paused = p; playBtn.setAttribute("aria-label", p ? "Play testimonials" : "Pause testimonials");
      playBtn.querySelector("use").setAttribute("href", p ? "#i-play" : "#i-pause"); schedule();
    }
    $("#carPrev").addEventListener("click", function () { go(idx - 1); schedule(); });
    $("#carNext").addEventListener("click", function () { go(idx + 1); schedule(); });
    playBtn.addEventListener("click", function () { setPaused(!paused); });
    car.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    car.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    car.addEventListener("focusin", function () { hovering = true; schedule(); });
    car.addEventListener("focusout", function () { hovering = false; schedule(); });
    car.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { go(idx - 1); } if (e.key === "ArrowRight") { go(idx + 1); } });
    var sx = null;
    track.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    track.addEventListener("pointerup", function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 50) go(idx + (e.clientX < sx ? 1 : -1)); sx = null; });
    go(0);
    setPaused(K.reducedMotion());
  }

  /* =========================================================
     Pricing toggle
     ========================================================= */
  var bill = $("#billingToggle");
  function renderPrices(yearly) {
    bill.setAttribute("aria-checked", String(yearly));
    $$(".plan .amt").forEach(function (el) {
      var m = Number(el.dataset.monthly);
      var v = yearly ? Math.round(m * 10 / 12) : m;
      el.textContent = K.formatINR(v);
      var billed = el.closest(".plan").querySelector(".billed");
      billed.textContent = yearly ? "Billed " + K.formatINR(m * 10) + " yearly (2 months free)" : "Billed monthly, cancel anytime";
    });
  }
  if (bill) { bill.addEventListener("click", function () { renderPrices(bill.getAttribute("aria-checked") !== "true"); }); renderPrices(false); }

  /* =========================================================
     FAQ accordion
     ========================================================= */
  $$(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".faq-item").classList.toggle("open", open);
      var panel = $("#" + btn.getAttribute("aria-controls"));
      if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
    });
  });

  /* =========================================================
     Careers → contact form
     ========================================================= */
  $$("[data-apply]").forEach(function (b) {
    b.addEventListener("click", function () {
      $("#cSubject").value = "careers";
      $("#cMessage").value = "Hi Kargonaut team, I'd like to apply for the " + b.dataset.apply + " role. Here is a short note about me: ";
      scrollToEl($("#contact"));
      setTimeout(function () { $("#cName").focus({ preventScroll: true }); }, 450);
    });
  });

  /* =========================================================
     Contact form
     ========================================================= */
  var cf = $("#contactForm");
  if (cf) cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    function check(id, cond, msg) {
      var input = $("#" + id), err = $("#err-" + id);
      if (!cond) { input.setAttribute("aria-invalid", "true"); err.textContent = msg; if (ok) input.focus(); ok = false; }
      else { input.removeAttribute("aria-invalid"); err.textContent = ""; }
    }
    var name = $("#cName").value.trim(), email = $("#cEmail").value.trim(), msg = $("#cMessage").value.trim();
    check("cName", name.length >= 2, "Please tell us your name.");
    check("cEmail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), "Please enter a valid email address.");
    check("cSubject", $("#cSubject").value !== "", "Please choose a topic.");
    check("cMessage", msg.length >= 10, "Your message should be at least 10 characters.");
    var status = $("#contactStatus");
    if (!ok) { status.className = "form-status err"; status.textContent = "Please fix the highlighted fields."; return; }
    status.className = "form-status ok";
    status.textContent = "Thanks, " + name.split(" ")[0] + "! Your message is in. We reply within one business day.";
    cf.reset();
  });
})();
