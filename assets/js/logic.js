/* Kargonaut pricing & helper logic — pure functions, no DOM. */
(function () {
  "use strict";
  var D = window.KGN_DATA;

  function toRad(d) { return d * Math.PI / 180; }

  // Great-circle distance in km (haversine, Earth radius 6371 km)
  function haversine(a, b) {
    var dLat = toRad(b[2] - a[2]);
    var dLon = toRad(b[3] - a[3]);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(a[2])) * Math.cos(toRad(b[2])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }

  function city(code) { return D.cities[code]; }

  function routeKm(from, to, mode) {
    return Math.round(haversine(city(from), city(to)) * D.rates[mode].factor);
  }

  function transitDays(km, mode, service, international) {
    if (service === "sameday") return 0;
    var days;
    if (mode === "road") days = Math.ceil(km / 500) + 1;
    else if (mode === "air") days = 1 + Math.ceil(km / 5000) + (international ? 1 : 0);
    else days = Math.ceil(km / 600) + 4;
    if (service === "express") days = mode === "sea" ? Math.ceil(days * 0.75) : Math.max(1, Math.ceil(days * 0.6));
    return days;
  }

  function addDays(date, n) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  /* opts: { from, to, mode, service, weight, len, wid, hei, today? }
     returns { ok:true, ...breakdown } or { ok:false, error } */
  function quote(opts) {
    var a = city(opts.from), b = city(opts.to);
    if (!a || !b) return { ok: false, error: "Choose an origin and a destination." };
    if (opts.from === opts.to) return { ok: false, error: "Origin and destination must be different cities." };
    var w = Number(opts.weight);
    if (!(w > 0) || w > 5000) return { ok: false, error: "Enter a weight between 0.1 and 5,000 kg." };
    var L = Math.max(0, Number(opts.len) || 0), W = Math.max(0, Number(opts.wid) || 0), H = Math.max(0, Number(opts.hei) || 0);
    var domestic = a[5] && b[5];
    var mode = opts.mode, service = opts.service;
    if (mode === "road" && !domestic) return { ok: false, error: "Road freight runs between Indian cities only. Try air or sea for this lane." };
    if (mode === "sea" && !(a[4] && b[4])) return { ok: false, error: "Sea freight needs a seaport at both ends (for example Mumbai, Chennai, Kolkata, Kochi, Dubai or Singapore)." };
    var r = D.rates[mode], s = D.service[service];
    var km = routeKm(opts.from, opts.to, mode);
    if (service === "sameday") {
      var allowed = domestic && (mode === "air" || (mode === "road" && km <= D.sameDayMaxRoadKm));
      if (!allowed) return { ok: false, error: "Same-day is available on domestic air, or on road lanes up to " + D.sameDayMaxRoadKm + " km." };
    }
    var vol = (L * W * H) / r.divisor;
    var chargeable = Math.ceil(Math.max(w, vol) * 2) / 2;
    var base = r.base;
    var freight = Math.round(chargeable * km * r.perKgKm);
    var serviceFee = Math.round(freight * (s.mult - 1));
    var fuel = Math.round((base + freight + serviceFee) * D.fuelRate);
    var subtotal = base + freight + serviceFee + fuel;
    var gst = Math.round(subtotal * D.gstRate);
    var days = transitDays(km, mode, service, !domestic);
    return {
      ok: true, km: km, actual: w, volumetric: Math.round(vol * 100) / 100, chargeable: chargeable,
      base: base, freight: freight, serviceFee: serviceFee, fuel: fuel, subtotal: subtotal, gst: gst,
      total: subtotal + gst, days: days, delivery: addDays(opts.today || new Date(), days), domestic: domestic
    };
  }

  var inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  function formatINR(n) { return inr.format(n); }
  function formatDate(d) { return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); }
  function formatDateTime(d) {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " +
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  // Flat equirectangular projection used by every dot map
  function project(lat, lon) {
    var m = D.map;
    return [(lon + 180) / 360 * m.W, (m.LAT0 - lat) / (m.LAT0 - m.LAT1) * m.H];
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.KGN = {
    haversine: haversine, routeKm: routeKm, transitDays: transitDays, quote: quote, addDays: addDays,
    formatINR: formatINR, formatDate: formatDate, formatDateTime: formatDateTime, project: project,
    city: city, escapeHTML: escapeHTML,
    reducedMotion: function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  };
})();
