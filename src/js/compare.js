/* Before/after sliders: drag anywhere on the image, or use the arrow keys (Home and End jump to each side).
   A hidden native range input does the keyboard and screen-reader work.
   On first view each slider nudges once, after its scroll reveal has finished, so people see it moves. */
import { reducedMotion, on } from './utils.js';
import { getLang } from './i18n.js';

const HINT = [
  [0, 50],
  [420, 58],
  [900, 43],
  [1300, 50],
]; /* [ms, position %]: 50 > 58 > 43 > 50 */
const REVEAL_MS = 600; /* matches .reveal.in in base.css */
const PAUSE_MS = 400;
const LABEL_EDGE = 14; /* hide a side's label when that side is under 14% wide */

const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const words = () => (getLang() === 'pt' ? ['antes', 'depois'] : ['before', 'after']);

function setupSlider(box) {
  const range = box.querySelector('input[type=range]');
  let pos = 50;
  let touched = false;
  let hintFrame = 0;

  function set(value) {
    pos = Math.max(0, Math.min(100, value));
    const rounded = Math.round(pos);
    const [before, after] = words();
    box.style.setProperty('--pos', pos + '%');
    range.value = rounded;
    range.setAttribute('aria-valuetext', `${rounded}% ${before}, ${100 - rounded}% ${after}`);
    box.classList.toggle('hide-before', pos < LABEL_EDGE);
    box.classList.toggle('hide-after', pos > 100 - LABEL_EDGE);
  }

  const fromPointer = (x) => {
    const rect = box.getBoundingClientRect();
    return ((x - rect.left) / rect.width) * 100;
  };

  function stopHint() {
    touched = true;
    if (hintFrame) {
      cancelAnimationFrame(hintFrame);
      hintFrame = 0;
    }
  }

  box.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    stopHint();
    box.setPointerCapture(event.pointerId);
    box.classList.add('dragging');
    set(fromPointer(event.clientX));
  });
  box.addEventListener('pointermove', (event) => {
    if (box.hasPointerCapture(event.pointerId)) set(fromPointer(event.clientX));
  });
  const release = (event) => {
    if (box.hasPointerCapture(event.pointerId)) box.releasePointerCapture(event.pointerId);
    box.classList.remove('dragging');
  };
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', release);
  range.addEventListener('input', () => {
    stopHint();
    set(Number(range.value));
  });
  range.addEventListener('keydown', stopHint);

  function playHint() {
    if (touched || reducedMotion.matches) return;
    const start = performance.now();
    const step = (now) => {
      if (touched) return;
      const elapsed = now - start;
      let i = 1;
      while (i < HINT.length - 1 && elapsed > HINT[i][0]) i++;
      const [ta, a] = HINT[i - 1];
      const [tb, b] = HINT[i];
      const k = Math.min(1, Math.max(0, (elapsed - ta) / (tb - ta)));
      set(a + (b - a) * easeInOut(k));
      if (elapsed < HINT[HINT.length - 1][0]) hintFrame = requestAnimationFrame(step);
      else {
        hintFrame = 0;
        set(50);
      }
    };
    step(start);
  }

  /* wait for the block's reveal plus a short pause, and only while the slider is well in view */
  function armHint() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    const block = box.closest('.reveal');
    const stamp = () => (block.classList.contains('instant') ? -Infinity : performance.now());
    let revealedAt = !block ? performance.now() : block.classList.contains('in') ? stamp() : null;
    let inView = false;
    let timer = 0;

    const maybePlay = () => {
      if (!inView || revealedAt === null || touched || timer) return;
      const wait = Math.max(0, revealedAt + REVEAL_MS - performance.now()) + PAUSE_MS;
      timer = setTimeout(() => {
        timer = 0;
        if (inView) {
          visibility.disconnect();
          playHint();
        }
      }, wait);
    };

    if (block && revealedAt === null) {
      const watcher = new MutationObserver(() => {
        if (!block.classList.contains('in')) return;
        watcher.disconnect();
        revealedAt = stamp();
        maybePlay();
      });
      watcher.observe(block, { attributes: true, attributeFilter: ['class'] });
    }
    const visibility = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.intersectionRatio >= 0.6);
        if (!inView && timer) {
          clearTimeout(timer);
          timer = 0;
        }
        maybePlay();
      },
      { threshold: [0, 0.6] },
    );
    visibility.observe(box);
  }

  set(50);
  armHint();
  return () => set(pos);
}

export function initCompare() {
  const refreshers = [...document.querySelectorAll('[data-compare]')].map(setupSlider);
  /* keep the spoken value in the page language */
  on('cpv:langchange', () => refreshers.forEach((refresh) => refresh()));
}
