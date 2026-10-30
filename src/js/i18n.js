/* Language: English is the copy written in the page templates; Portuguese comes from i18n/pt.js.
   Elements opt in with data-i18n (inner HTML), data-i18n-aria (aria-label) or data-i18n-alt (alt). */
import { root, storage, emit } from './utils.js';
import PT from './i18n/pt.js';

/* English strings that only exist in JavaScript */
const EN_EXTRA = {
  copiedT: 'Email copied!',
  copiedB: 'Paste it wherever you like.',
  copyFailT: 'Couldn’t copy automatically',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  pauseAnim: 'Pause animation',
  playAnim: 'Play animation',
  closeMenu: 'Close menu',
  toOther: 'Ver em português',
};

const EN = {};
let lang = 'en';

export const t = (key) => (lang === 'pt' ? PT : EN)[key] ?? EN[key] ?? '';
export const getLang = () => lang;

/* read the English copy from the page before anything is translated */
function readEnglish() {
  const keep = (key, value) => {
    if (!(key in EN)) EN[key] = value;
  };
  document.querySelectorAll('[data-i18n]').forEach((el) => keep(el.dataset.i18n, el.innerHTML));
  document
    .querySelectorAll('[data-i18n-aria]')
    .forEach((el) => keep(el.dataset.i18nAria, el.getAttribute('aria-label')));
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => keep(el.dataset.i18nAlt, el.getAttribute('alt')));
  Object.assign(EN, EN_EXTRA);
}

/* a saved choice wins; otherwise follow the browser's main language (Portuguese gets PT-BR, anything else EN) */
function preferredLang() {
  const saved = storage.get('cpv-lang');
  if (saved === 'en' || saved === 'pt') return saved;
  const browser = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
  return browser.startsWith('pt') ? 'pt' : 'en';
}

function apply() {
  root.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => el.setAttribute('alt', t(el.dataset.i18nAlt)));

  /* the language button names the other language, in that language */
  document.querySelectorAll('[data-lang-toggle]').forEach((button) => {
    button.querySelector('.lang-label').textContent = lang === 'pt' ? 'EN-US' : 'PT-BR';
    button.querySelector('.flag-br').hidden = lang === 'pt';
    button.querySelector('.flag-us').hidden = lang !== 'pt';
    button.setAttribute('aria-label', t('toOther'));
    button.setAttribute('lang', lang === 'pt' ? 'en' : 'pt-BR');
  });
  emit('cpv:langchange', { lang });
}

export function initI18n() {
  readEnglish();
  lang = preferredLang();
  apply();
  /* the inline script in <head> hid the page for Portuguese visitors; the copy is ready now */
  root.classList.remove('i18n-wait');

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-lang-toggle]')) return;
    lang = lang === 'pt' ? 'en' : 'pt';
    storage.set('cpv-lang', lang);
    apply();
  });
}
