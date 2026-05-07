/** Runs before paint — keep in sync with ThemeToggle. */
export const THEME_STORAGE_KEY = "gems-theme";

export const themeBlockingScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var r=document.documentElement;var v=localStorage.getItem(k);if(v==="dark"){r.classList.add("dark");}else if(v==="light"){r.classList.remove("dark");}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){r.classList.add("dark");}}catch(e){}})();`;
