/* Scroll reveal: blocks fade and rise slightly the first time they enter the screen.
   The classes are added here, so without JavaScript (or with reduced motion) everything is simply visible. */
import { reducedMotion } from './utils.js';

const SINGLE = [
  '.about-head',
  '.about-bio',
  '.work .t-h4',
  '.contact .wrap',
  '.chapter > h2',
  '.chapter-body',
  '.rd-sub',
  '.strip',
  '.strip-copy',
  '.quote.qr',
  '.rv-head',
];
/* these also scale down slightly as they settle */
const MEDIA = ['.feature'];
/* children reveal one after another */
const GROUPS = ['.stats', '.work-list', '.summary', '.insights', '.tests', '.rv-items'];
const STAGGER_MS = 70;
const IMAGE_WAIT_MS = 1500;

let io;
let warm;

/* Lazy images inside a block only start downloading when the block nears the screen, so the fade could
   finish before the picture arrived. Start loading well ahead, and hold the fade until the image is ready. */
function showWhenReady(el) {
  const visible = [...el.querySelectorAll('img')].filter(
    (img) => img.offsetParent !== null || img.getClientRects().length,
  );
  const pending = visible.filter((img) => !img.complete);
  if (!pending.length) {
    el.classList.add('in');
    return;
  }
  let done = false;
  const show = () => {
    if (!done) {
      done = true;
      el.classList.add('in');
    }
  };
  const loaded = (img) =>
    new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  Promise.all(pending.map(loaded)).then(() => requestAnimationFrame(show));
  setTimeout(show, IMAGE_WAIT_MS);
}

function mark(el, delay = 0, media = false) {
  if (el.classList.contains('reveal')) return;
  el.classList.add('reveal');
  if (media) el.classList.add('reveal-media');
  if (delay) el.style.setProperty('--rd', delay + 'ms');
  io.observe(el);
  if (el.querySelector('img')) warm.observe(el);
}

/* anything already on screen when a page appears shows at once, without animating */
function settle(view) {
  requestAnimationFrame(() => {
    const height = window.innerHeight;
    view.querySelectorAll('.reveal:not(.in)').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < height && rect.bottom > 0) {
        el.classList.add('in', 'instant');
        io.unobserve(el);
      }
    });
  });
}

export function initReveal() {
  if (!('IntersectionObserver' in window) || reducedMotion.matches) return;

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        showWhenReady(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  warm = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        warm.unobserve(entry.target);
        entry.target.querySelectorAll('img[loading="lazy"]').forEach((img) => {
          img.loading = 'eager';
        });
      });
    },
    { rootMargin: '1200px 0px 1200px 0px' },
  );

  document.querySelectorAll('.view').forEach((view) => {
    SINGLE.forEach((sel) => view.querySelectorAll(sel).forEach((el) => mark(el)));
    MEDIA.forEach((sel) => view.querySelectorAll(sel).forEach((el) => mark(el, 0, true)));
    GROUPS.forEach((sel) =>
      view
        .querySelectorAll(sel)
        .forEach((group) => [...group.children].forEach((el, i) => mark(el, Math.min(i, 5) * STAGGER_MS))),
    );

    if (!view.hidden) settle(view);
    new MutationObserver(() => {
      if (!view.hidden) {
        settle(view);
        return;
      }
      /* page left: reset its blocks so they reveal again on the next visit */
      view.querySelectorAll('.reveal').forEach((el) => {
        el.classList.remove('in', 'instant');
        io.observe(el);
      });
    }).observe(view, { attributes: true, attributeFilter: ['hidden'] });
  });
}
