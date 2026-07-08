/* CH89 Enhancement Layer — behaviour (reveal-on-scroll, mode transitions, ripple) */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) return;

  /* ---------- 1. Scroll reveal for cards ---------- */
  var REVEAL_SELECTOR = [
    ".game-card",
    ".message-card",
    ".gov-v4-card",
    ".gov-v3-access-card",
    ".g19-card",
    ".t73-v26-card",
    ".t73-v30-card",
    ".t73-v94-review-card",
    ".t73-v27-old-report-card",
    ".ch89-stable-review-card",
    ".rule-item",
    ".stat"
  ].join(",");

  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ch-enh-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
  }

  var staggerIndex = 0;
  function prepareReveal(root) {
    if (!io || !root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll(REVEAL_SELECTOR);
    staggerIndex = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains("ch-enh-reveal") || el.classList.contains("ch-enh-in")) continue;
      el.classList.add("ch-enh-reveal");
      el.style.setProperty("--ch-stagger", Math.min(staggerIndex * 45, 360) + "ms");
      staggerIndex++;
      io.observe(el);
    }
  }

  /* ---------- 2. Mode switch transition ---------- */
  function animateModePanel(mode) {
    var panel = document.getElementById("mode-" + mode);
    if (!panel) return;
    panel.classList.remove("ch-enh-mode-in");
    /* restart animation */
    void panel.offsetWidth;
    panel.classList.add("ch-enh-mode-in");
    prepareReveal(panel);
  }

  var wrapped = false;
  function wrapSwitchMode() {
    if (wrapped || typeof window.switchMode !== "function") return;
    var original = window.switchMode;
    window.switchMode = function (mode, btn) {
      var result = original.apply(this, arguments);
      try {
        animateModePanel(mode);
      } catch (_) {}
      return result;
    };
    wrapped = true;
  }
  var wrapAttempts = 0;
  var wrapTimer = window.setInterval(function () {
    wrapAttempts++;
    wrapSwitchMode();
    if (wrapped || wrapAttempts > 100) window.clearInterval(wrapTimer);
  }, 100);

  /* ---------- 3. Button ripple ---------- */
  document.addEventListener(
    "pointerdown",
    function (e) {
      var btn =
        e.target && e.target.closest
          ? e.target.closest(".btn, .mode-btn, .ch89-auth-primary, .ch89-social-btn")
          : null;
      if (!btn) return;
      var style = window.getComputedStyle(btn);
      if (style.position === "static") btn.style.position = "relative";
      if (style.overflow !== "hidden") btn.style.overflow = "hidden";
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ch-enh-ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(ripple);
      window.setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 600);
    },
    { passive: true }
  );

  /* ---------- 4. Reveal cards rendered later (dynamic content) ---------- */
  if ("MutationObserver" in window) {
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType === 1) prepareReveal(node.parentNode || node);
        }
      }
    });
    var start = function () {
      if (document.body) {
        mo.observe(document.body, { childList: true, subtree: true });
        prepareReveal(document.body);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})();
