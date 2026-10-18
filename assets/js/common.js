/* Shared UI for every page: theme, menu, reveal, toasts, newsletter, back-to-top. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---- Theme toggle (saved in localStorage) ---- */
  var toggle = document.getElementById("themeToggle");
  function applyTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-checked", String(theme === "dark"));
      var use = toggle.querySelector("use");
      if (use) use.setAttribute("href", theme === "dark" ? "#i-moon" : "#i-sun");
    }
    if (save) { try { localStorage.setItem("kgn-theme", theme); } catch (e) { /* storage blocked */ } }
    window.dispatchEvent(new CustomEvent("kgn:theme", { detail: theme }));
  }
  applyTheme(root.getAttribute("data-theme") || "dark", false);
  if (toggle) toggle.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("menuButton");
  var nav = document.getElementById("site-nav");
  function setMenu(open, returnFocus) {
    if (!burger || !nav) return;
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
    else if (returnFocus) burger.focus();
  }
  if (burger && nav) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true", false); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false, false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    document.addEventListener("click", function (e) {
      if (burger.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false, false);
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.KGN.reducedMotion()) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Scroll-spy for in-page nav links ---- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  if (spyLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spyLinks.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* ---- Toasts ---- */
  var wrap = document.createElement("div");
  wrap.className = "toast-wrap";
  wrap.setAttribute("role", "status");
  wrap.setAttribute("aria-live", "polite");
  document.body.appendChild(wrap);
  window.KGN.toast = function (msg) {
    var t = document.createElement("div");
    t.className = "toast glass";
    t.innerHTML = '<svg aria-hidden="true"><use href="#i-check"></use></svg><span></span>';
    t.querySelector("span").textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.remove(); }, 3600);
  };

  /* ---- Newsletter ---- */
  var news = document.getElementById("newsletterForm");
  if (news) news.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("newsEmail");
    var err = document.getElementById("newsError");
    var v = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      input.setAttribute("aria-invalid", "true");
      err.textContent = "Please enter a valid email address.";
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    err.textContent = "";
    try { localStorage.setItem("kgn-newsletter", v); } catch (x) { /* ignore */ }
    news.reset();
    window.KGN.toast("You're on the list! Weekly freight insights are on their way.");
  });

  /* ---- Back to top ---- */
  var top = document.getElementById("toTop");
  if (top) {
    window.addEventListener("scroll", function () { top.classList.toggle("show", window.scrollY > 900); }, { passive: true });
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: window.KGN.reducedMotion() ? "auto" : "smooth" });
      var skip = document.querySelector(".skip-link"); if (skip) skip.focus();
    });
  }

  /* ---- Pause SVG (SMIL) animations when the user prefers reduced motion ---- */
  if (window.KGN.reducedMotion()) {
    document.querySelectorAll("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  }
})();
