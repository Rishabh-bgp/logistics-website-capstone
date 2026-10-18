/* Applies the saved (or system) theme before first paint to avoid a flash. */
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  try {
    var saved = localStorage.getItem("kgn-theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.setAttribute("data-theme", theme);
  } catch (e) {
    root.setAttribute("data-theme", "dark");
  }
})();
