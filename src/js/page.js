/* The current page: which one it is (set on <body> at build time), its title in the visitor's language,
   and the skip link, which moves focus as well as scroll so keyboard users land in the content. */
import { on } from './utils.js';
import { t, getLang } from './i18n.js';

export const currentPage = () => document.body.dataset.page;

export function initPage() {
  /* the English title is written into the page at build time; the Portuguese one comes from i18n/pt.js */
  const english = document.title;
  const titleKey = document.body.dataset.title;
  const setTitle = () => {
    document.title = (getLang() === 'pt' && t(titleKey)) || english;
  };
  on('cpv:langchange', setTitle);
  setTitle();

  document.getElementById('skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.getElementById('main');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  });
}
