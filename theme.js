/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/theme.js
   Dark / Light theme toggle with CSS variable system
   ═══════════════════════════════════════════════════════════ */

var TozaTheme = (function () {
    "use strict";

    var STORAGE_KEY = "tozahavo-theme";
    var currentTheme = "dark";

    /* ── Set theme ────────────────────────────────────── */
    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute("data-theme", theme);

        // Persist
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}

        // Update toggle icon
        var icon = document.getElementById("theme-toggle-icon");
        if (icon) {
            if (theme === "dark") {
                icon.className = "ph-bold ph-sun text-lg";
            } else {
                icon.className = "ph-bold ph-moon text-lg";
            }
        }
    }

    /* ── Toggle ───────────────────────────────────────── */
    function toggle() {
        setTheme(currentTheme === "dark" ? "light" : "dark");
    }

    /* ── Initialize ───────────────────────────────────── */
    function init() {
        // Priority: localStorage > prefers-color-scheme > default (dark)
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

        if (saved === "light" || saved === "dark") {
            currentTheme = saved;
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            currentTheme = "light";
        } else {
            currentTheme = "dark";
        }

        setTheme(currentTheme);

        // Bind toggle button
        var btn = document.getElementById("theme-toggle");
        if (btn) {
            btn.addEventListener("click", toggle);
        }
    }

    /* ── Public API ───────────────────────────────────── */
    return {
        init: init,
        setTheme: setTheme,
        toggle: toggle,
        getTheme: function () { return currentTheme; }
    };

})();
