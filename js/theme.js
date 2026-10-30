/* Light and dark mode: follows the system until the visitor picks one, then remembers it. */
import { root, darkScheme, storage, emit, on } from './utils.js';
import { t } from './i18n.js';

export function isDark() {
  const chosen = root.getAttribute('data-theme');
  return chosen ? chosen === 'dark' : darkScheme.matches;
}

function syncButtons() {
  const dark = isDark();
  root.classList.toggle('is-dark', dark);
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', dark ? t('toLight') : t('toDark'));
    button.setAttribute('aria-pressed', String(dark));
    const label = button.querySelector('.theme-label');
    if (label) label.textContent = dark ? t('lightMode') : t('darkMode');
  });
}

function changed() {
  syncButtons();
  emit('cpv:themechange', { dark: isDark() });
}

function setTheme(value) {
  root.setAttribute('data-theme', value);
  storage.set('cpv-theme', value);
  changed();
}

export function initTheme() {
  const saved = storage.get('cpv-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  syncButtons();

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-theme-toggle]')) setTheme(isDark() ? 'light' : 'dark');
  });
  darkScheme.addEventListener('change', changed);
  on('cpv:langchange', syncButtons);
}
