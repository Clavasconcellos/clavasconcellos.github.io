/* Copy-to-clipboard buttons (contact email) and the toast that confirms it. */
import { t } from './i18n.js';

let toast;

function showToast(title, body) {
  const text = toast.querySelector('.toast-text');
  text.replaceChildren(document.createElement('b'), document.createElement('span'));
  text.querySelector('b').textContent = title;
  text.querySelector('span').textContent = body;
  toast.classList.add('show');
}

function hideToast() {
  toast.classList.remove('show');
}

/* if the clipboard is unavailable, select the text so the visitor can copy it by hand */
function copy(button) {
  const text = button.dataset.copy;
  const fallback = () => {
    const range = document.createRange();
    range.selectNodeContents(button.querySelector('span') || button);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    showToast(t('copyFailT'), text);
  };
  try {
    navigator.clipboard.writeText(text).then(() => showToast(t('copiedT'), t('copiedB')), fallback);
  } catch {
    fallback();
  }
}

export function initToast() {
  toast = document.getElementById('toast');
  toast.querySelector('.toast-close').addEventListener('click', hideToast);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toast.classList.contains('show')) hideToast();
  });
  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => copy(button)));
}
