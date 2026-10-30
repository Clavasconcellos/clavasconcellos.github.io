/* Pages: every page is a .view in index.html; the URL hash picks which one is shown (home has no hash).
   Each visit gets its own history entry, so the browser's Back button returns to the previous page. */
import { reducedMotion, emit, on } from './utils.js';
import { t } from './i18n.js';
import { closeMenus } from './header.js';

const TITLES = {
  home: 'titleHome',
  resume: 'titleResume',
  '3tentos': 'title3',
  bestegg: 'titleBestegg',
  tentoscap: 'titleTentoscap',
  foca: 'titleFoca',
};
const PROJECTS = ['3tentos', 'bestegg', 'tentoscap', 'foca'];
const LEAVE_MS = 170; /* matches the .view.leave animation in base.css */

const views = {};
let current = null;

export const currentRoute = () => current;

function markCurrent(route) {
  const links = '.nav a.pill[data-route], .option[data-route], .mpill[data-route], .foot-list a[data-route]';
  document.querySelectorAll(links).forEach((link) => {
    if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const projectsButton = document.getElementById('projects-btn');
  if (PROJECTS.includes(route)) projectsButton.setAttribute('aria-current', 'true');
  else projectsButton.removeAttribute('aria-current');
}

function show(route, { focus = false } = {}) {
  if (!views[route]) route = 'home';
  closeMenus();
  if (route === current) {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    return;
  }
  const prev = current ? views[current] : null;
  const next = views[route];

  const swap = () => {
    if (prev) {
      prev.hidden = true;
      prev.classList.remove('leave');
    } else {
      /* first load: hide every page but the one being shown */
      Object.values(views).forEach((view) => {
        if (view !== next) view.hidden = true;
      });
    }
    next.hidden = false;
    next.classList.remove('enter');
    void next.offsetWidth; /* restart the enter animation */
    next.classList.add('enter');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (focus) document.getElementById('main').focus({ preventScroll: true });
    emit('cpv:routechange', { route });
  };

  current = route;
  document.title = t(TITLES[route]);
  markCurrent(route);
  if (prev && !reducedMotion.matches) {
    prev.classList.add('leave');
    setTimeout(swap, LEAVE_MS);
  } else {
    swap();
  }
}

const routeFromUrl = () => location.hash.replace('#', '');

/* the home page lives at the bare address (no #home), so the link people share most stays clean */
const urlFor = (route) => (route === 'home' ? location.pathname + location.search : '#' + route);

export function initRouter() {
  document.querySelectorAll('.view').forEach((view) => {
    views[view.dataset.view] = view;
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-route]');
    if (!link) return;
    event.preventDefault();
    const route = link.dataset.route;
    if (route !== current) {
      try {
        history.pushState(null, '', urlFor(route));
      } catch {
        /* file:// or sandboxed frames */
      }
    }
    show(route, { focus: true });
  });

  const fromUrl = () => {
    /* old links to #home still work, but show the clean address */
    if (location.hash === '#home') {
      try {
        history.replaceState(null, '', urlFor('home'));
      } catch {
        /* not supported */
      }
    }
    show(routeFromUrl());
  };
  window.addEventListener('popstate', fromUrl);
  window.addEventListener('hashchange', fromUrl);
  try {
    history.scrollRestoration = 'manual';
  } catch {
    /* not supported */
  }

  document.getElementById('skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.getElementById('main');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  });

  on('cpv:langchange', () => {
    if (current) document.title = t(TITLES[current]);
  });

  fromUrl();
}
