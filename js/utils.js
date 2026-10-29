/* Small helpers shared by the other modules. */

export const root = document.documentElement;
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

/* localStorage can throw (private mode, blocked storage), so every access is guarded */
export const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* not saved, nothing else to do */ }
  },
};

/* Modules talk through a few document events instead of importing each other:
   cpv:langchange, cpv:themechange, cpv:routechange, cpv:motionchange */
export function emit(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(name, handler) {
  document.addEventListener(name, handler);
}
