/** Runs before paint — keep in sync with ThemeToggle. */
export const THEME_STORAGE_KEY = "gems-theme";

export const themeBlockingScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var r=document.documentElement;var v=localStorage.getItem(k);if(v==="dark"){r.classList.add("dark");}else{r.classList.remove("dark");}}catch(e){}})();`;
