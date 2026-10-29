/* Omakaseya - satu script untuk semuanya.
   Pasang SATU embed di Carrd:  <script src="https://DOMAIN-VERCEL-OMAKASE/omakase.js"></script>
   - Ada container id="omakase-order"   -> memuat form order
   - Ada container id="omakase-tracker" -> memuat tracker
   Atribut data-width, data-scale, data-bg, data-theme, data-api ikut diteruskan ke keduanya. */
(function () {
  "use strict";
  var cs = document.currentScript || document.querySelector('script[src*="/omakase.js"]');
  if (!cs || !cs.src) return;
  var BASE = new URL(cs.src).origin;
  var ATTRS = ["data-width", "data-scale", "data-bg", "data-theme", "data-api"];

  function add(file) {
    var s = document.createElement("script");
    s.src = BASE + "/" + file;
    ATTRS.forEach(function (a) { var v = cs.getAttribute(a); if (v != null) s.setAttribute(a, v); });
    document.head.appendChild(s);
  }

  function go() {
    var tries = 0, loaded = {};
    (function look() {
      if (document.getElementById("omakase-order") && !loaded.order) { loaded.order = 1; add("omakase-order.js"); }
      if (document.getElementById("omakase-tracker") && !loaded.tracker) { loaded.tracker = 1; add("omakase-tracker.js"); }
      if (++tries < 40 && !(loaded.order && loaded.tracker)) setTimeout(look, 250);
    })();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
