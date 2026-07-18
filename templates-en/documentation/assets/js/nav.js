/*
 * Reversa Documentation - Navigation helper
 *
 * Marks the current page link as active,
 * enables theme toggling via the header button,
 * persists the choice in localStorage.
 */

(function () {
    "use strict";

    const STORAGE_KEY_THEME = "reversa.doc.theme";
    const VALID_STYLES = ["sober", "premium", "dense", "exploratory"];

    /**
     * Populates the <nav> with links read from window.RV_DATA.nav.
     * If the Publisher already filled it via NAV_LINKS server-side, keeps it.
     * If the nav is empty (partial regeneration case), fills it here.
     * Single source of truth: window.RV_DATA.nav (generated from
     * pagesGenerated in .state.json by the Publisher).
     */
    function renderNav() {
        const nav = document.querySelector(".reversa-doc-nav");
        if (!nav) return;
        // If the nav already has <a>, respect the server-side render.
        if (nav.querySelector("a")) return;
        if (!window.RV_DATA || !Array.isArray(window.RV_DATA.nav)) return;
        const html = window.RV_DATA.nav
            .map(function (item) {
                return '<a href="' + item.href + '" data-page-id="' + item.id + '">' + item.label + '</a>';
            })
            .join("");
        nav.innerHTML = html;
    }

    /**
     * Marks the navigation link that points to the current page.
     */
    function highlightActiveLink() {
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const links = document.querySelectorAll(".reversa-doc-nav a[href]");
        links.forEach((link) => {
            const target = link.getAttribute("href").split("/").pop();
            if (target === currentPath) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
        });
    }

    /**
     * Cycles through the 4 theme variants in the defined order.
     */
    function cycleTheme() {
        const body = document.body;
        const current = body.getAttribute("data-style") || "sober";
        const currentIndex = VALID_STYLES.indexOf(current);
        const nextIndex = (currentIndex + 1) % VALID_STYLES.length;
        const next = VALID_STYLES[nextIndex];
        applyTheme(next);
    }

    function applyTheme(style) {
        if (!VALID_STYLES.includes(style)) return;
        document.body.setAttribute("data-style", style);
        try {
            localStorage.setItem(STORAGE_KEY_THEME, style);
        } catch (e) {
            /* localStorage unavailable, ignore */
        }
        updateThemeButtonLabel(style);
    }

    function restoreTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_THEME);
            if (saved && VALID_STYLES.includes(saved)) {
                applyTheme(saved);
                return;
            }
        } catch (e) {
            /* ignore */
        }
        const initial = document.body.getAttribute("data-style") || "sober";
        updateThemeButtonLabel(initial);
    }

    function updateThemeButtonLabel(style) {
        const btn = document.querySelector(".theme-toggle .theme-toggle-label");
        if (btn) btn.textContent = capitalize(style);
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function attachThemeToggle() {
        const btn = document.querySelector(".theme-toggle");
        if (!btn) return;
        btn.addEventListener("click", cycleTheme);
    }

    /**
     * Adds keyboard navigation support:
     * j/k to move between content sections,
     * Esc to close modals (future).
     */
    function attachKeyboardNav() {
        document.addEventListener("keydown", (e) => {
            if (e.target.matches("input, textarea, select")) return;
            if (e.key === "j") scrollBySection(1);
            else if (e.key === "k") scrollBySection(-1);
        });
    }

    function scrollBySection(direction) {
        const sections = Array.from(document.querySelectorAll(".reversa-doc-main h2, .reversa-doc-main h3"));
        if (sections.length === 0) return;
        const scrollTop = window.scrollY + 80;
        let currentIndex = 0;
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= scrollTop + 4) currentIndex = i;
        }
        const targetIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
        sections[targetIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        renderNav();
        highlightActiveLink();
        restoreTheme();
        attachThemeToggle();
        attachKeyboardNav();
    }
})();
