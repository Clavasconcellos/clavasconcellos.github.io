/* Things that move and their pause/play buttons.
   The home hero button pauses the hero video and the page background, and the choice is remembered;
   each Foca strip button pauses only its own strip. Labels and tooltips follow the state and the language. */
import { root, reducedMotion, storage, emit, on } from './utils.js';
import { t } from './i18n.js';
import { currentRoute } from './router.js';

let videos = [];
let paused = false;

/* the hero video only plays on the home page, when it's visible and motion is allowed */
function syncVideo() {
  videos.forEach((video) => {
    const visible = getComputedStyle(video).display !== 'none';
    if (visible && currentRoute() === 'home' && !reducedMotion.matches && !paused) {
      if (video.preload === 'none') {
        video.preload = 'auto';
        video.load();
      }
      video.play().catch(() => {
        /* autoplay blocked: the poster stays */
      });
    } else {
      video.pause();
    }
  });
}

function setButton(button, isPaused) {
  const label = isPaused ? t('playAnim') : t('pauseAnim');
  button.dataset.paused = String(isPaused);
  button.setAttribute('aria-label', label);
  button.dataset.tip = label;
}

function syncButtons() {
  document.querySelectorAll('[data-motion-toggle]').forEach((button) => setButton(button, paused));
  document
    .querySelectorAll('[data-strip-toggle]')
    .forEach((button) => setButton(button, button.closest('.strip').classList.contains('paused')));
}

/* transparent WebM (VP9 with alpha) everywhere except Safari, which plays the blended MP4s */
function pickVideoFormat() {
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
  const alpha = document.querySelector('.hero-video.alpha');
  if (isSafari || !alpha || !alpha.canPlayType('video/webm; codecs="vp9"')) return;
  root.classList.add('alpha-ok');
  document.querySelectorAll('.hero-video.lt, .hero-video.dk').forEach((video) => {
    video.preload = 'none';
    video.removeAttribute('poster');
  });
}

export function initMotion() {
  pickVideoFormat();
  videos = [...document.querySelectorAll('.hero-video')];
  paused = storage.get('cpv-motion') === 'paused';
  root.toggleAttribute('data-motion-paused', paused);

  document.querySelectorAll('[data-motion-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      paused = !paused;
      storage.set('cpv-motion', paused ? 'paused' : 'play');
      root.toggleAttribute('data-motion-paused', paused);
      syncButtons();
      syncVideo();
      emit('cpv:motionchange', { paused });
    }),
  );
  document.querySelectorAll('[data-strip-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      button.closest('.strip').classList.toggle('paused');
      syncButtons();
    }),
  );

  /* tooltip: Esc hides it without moving focus; it comes back on the next hover or focus */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape')
      document.querySelectorAll('.motion-btn').forEach((button) => button.classList.add('tip-off'));
  });
  document.querySelectorAll('.motion-btn').forEach((button) => {
    const restore = () => button.classList.remove('tip-off');
    button.addEventListener('mouseleave', restore);
    button.addEventListener('blur', restore);
  });

  on('cpv:langchange', syncButtons);
  on('cpv:themechange', syncVideo);
  on('cpv:routechange', syncVideo);
  reducedMotion.addEventListener('change', syncVideo);
  syncButtons();
}
