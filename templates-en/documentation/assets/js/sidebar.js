/*
 * Reversa Documentation - Reactive sidebar helper
 *
 * Each control inside the sidebar declares a data-param.
 * Changes fire the "reversa:param-change" event for the
 * specific page to react to, and persist in localStorage.
 *
 * The "Reset" button restores the defaults declared in data-default.
 * The "Download PNG" button captures the main canvas from the viewport.
 */

(function () {
    "use strict";

    const STORAGE_PREFIX = "reversa.sidebar.";

    /**
     * Initializes all controls in the current sidebar.
     */
    function init() {
        const sidebar = document.querySelector(".reversa-doc-sidebar");
        if (!sidebar) return;

        const pageId = sidebar.dataset.page || document.body.dataset.page || "default";
        const controls = sidebar.querySelectorAll("[data-param]");

        controls.forEach((control) => {
            attachControl(control, pageId);
            restoreControl(control, pageId);
        });

        attachResetButton(sidebar, pageId);
        attachExportButton(sidebar);
    }

    function attachControl(control, pageId) {
        const eventName = control.type === "checkbox" ? "change" : "input";
        control.addEventListener(eventName, () => {
            const param = control.dataset.param;
            const value = readControlValue(control);
            persistValue(pageId, param, value);
            dispatchChange(param, value, control);
        });
    }

    function readControlValue(control) {
        if (control.type === "checkbox") return control.checked;
        if (control.type === "range" || control.type === "number") {
            return parseFloat(control.value);
        }
        return control.value;
    }

    function writeControlValue(control, value) {
        if (control.type === "checkbox") control.checked = !!value;
        else control.value = value;
    }

    function restoreControl(control, pageId) {
        const param = control.dataset.param;
        const key = STORAGE_PREFIX + pageId + "." + param;
        let saved;
        try {
            saved = localStorage.getItem(key);
        } catch (e) {
            return;
        }
        if (saved === null) return;

        try {
            const parsed = JSON.parse(saved);
            writeControlValue(control, parsed);
            dispatchChange(param, parsed, control);
        } catch (e) {
            /* corrupted data, ignore silently */
        }
    }

    function persistValue(pageId, param, value) {
        try {
            const key = STORAGE_PREFIX + pageId + "." + param;
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* ignore if localStorage is unavailable */
        }
    }

    function dispatchChange(param, value, control) {
        const event = new CustomEvent("reversa:param-change", {
            detail: { param, value, control },
            bubbles: true
        });
        control.dispatchEvent(event);
    }

    function attachResetButton(sidebar, pageId) {
        const btn = sidebar.querySelector("[data-action='reset']") || sidebar.querySelector("#reset");
        if (!btn) return;
        btn.addEventListener("click", () => {
            const controls = sidebar.querySelectorAll("[data-param]");
            controls.forEach((control) => {
                const defaultValue = control.dataset.default;
                if (defaultValue === undefined) return;
                let value = defaultValue;
                if (control.type === "checkbox") value = defaultValue === "true";
                else if (control.type === "range" || control.type === "number") value = parseFloat(defaultValue);
                writeControlValue(control, value);
                persistValue(pageId, control.dataset.param, value);
                dispatchChange(control.dataset.param, value, control);
            });
        });
    }

    function attachExportButton(sidebar) {
        const btn = sidebar.querySelector("[data-action='export-png']") || sidebar.querySelector("#export-png");
        if (!btn) return;
        btn.addEventListener("click", () => {
            const canvas = document.querySelector("canvas");
            if (!canvas) {
                showToast("No canvas to export on this page.");
                return;
            }
            canvas.toBlob((blob) => {
                if (!blob) {
                    showToast("Failed to generate PNG.");
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = inferExportName();
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, "image/png");
        });
    }

    function inferExportName() {
        const page = document.body.dataset.page || "view";
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        return "reversa-" + page + "-" + stamp + ".png";
    }

    function showToast(message) {
        const existing = document.querySelector(".reversa-toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "reversa-toast";
        toast.setAttribute("role", "status");
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
