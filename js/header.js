/* Site header: the Projects dropdown and the mobile menu panel. */
import { root } from './utils.js';

let projectsButton, projectsMenu, menuButton, panel;

const menuOpen = () => projectsMenu.classList.contains('open');

function openMenu() {
  projectsMenu.classList.add('open');
  projectsButton.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  projectsMenu.classList.remove('open');
  projectsButton.setAttribute('aria-expanded', 'false');
}

function openPanel() {
  panel.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  root.classList.add('menu-open');
  panel.querySelector('.panel-close')?.focus();
}

function closePanel() {
  if (panel.hidden) return;
  panel.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  root.classList.remove('menu-open');
}

export function closeMenus() {
  closeMenu();
  closePanel();
}

/* keep Tab inside the open mobile panel */
function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const focusable = [...panel.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function initHeader() {
  projectsButton = document.getElementById('projects-btn');
  projectsMenu = document.getElementById('projects-menu');
  menuButton = document.getElementById('menu-btn');
  panel = document.getElementById('mobile-panel');

  /* the language and theme buttons also live in the mobile panel; the theme one gets a visible label there */
  const panelActions = document.querySelector('.panel-actions');
  document.querySelectorAll('.actions .lang-btn, .actions .theme-btn')
    .forEach((button) => panelActions.appendChild(button.cloneNode(true)));
  const panelTheme = panelActions.querySelector('.theme-btn');
  if (panelTheme) {
    const label = document.createElement('span');
    label.className = 'theme-label';
    panelTheme.appendChild(label);
  }

  projectsButton.addEventListener('click', (event) => {
    if (menuOpen()) { closeMenu(); return; }
    openMenu();
    /* opened from the keyboard or a screen reader: focus the first project so Enter opens it */
    if (event.detail === 0) {
      const first = projectsMenu.querySelector('a.option');
      if (first) requestAnimationFrame(() => first.focus());
    }
  });
  /* close the Projects list when focus or a click lands outside it */
  projectsButton.closest('.menu-wrap').addEventListener('focusout', (event) => {
    if (menuOpen() && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (menuOpen() && !event.target.closest('.menu-wrap')) closeMenu();
  });

  menuButton.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
  panel.querySelector('.panel-close').addEventListener('click', () => { closePanel(); menuButton.focus(); });
  panel.addEventListener('keydown', trapFocus);
  window.matchMedia('(min-width:900px)').addEventListener('change', (event) => { if (event.matches) closePanel(); });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (menuOpen()) { closeMenu(); projectsButton.focus(); }
    if (!panel.hidden) { closePanel(); menuButton.focus(); }
  });
}
