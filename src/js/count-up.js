/* About stats: numbers count up once when they scroll into view ("5 yrs", "5+").
   Only the leading number changes, so the rest of the text and its translation stay as they are.
   Nothing moves with reduced motion; the final text is in the page from the start. */
import { reducedMotion, on } from './utils.js';

let runId = 0;

const DURATION = 1100;
/* the stat fades in with the scroll reveal (0.6s plus its stagger); start counting once it is mostly visible */
const AFTER_REVEAL = 500;
const REVEAL_WAIT_MAX = 2000;
const ease = (t) => 1 - Math.pow(1 - t, 3);

/* wait for the stat's own reveal (class "in") and its stagger delay before counting */
function whenRevealed(el, callback) {
  const block = el.closest('.reveal');
  if (!block) return callback();
  const begin = performance.now();
  const check = () => {
    if (block.classList.contains('in') || performance.now() - begin > REVEAL_WAIT_MAX) {
      const stagger = parseFloat(block.style.getPropertyValue('--rd')) || 0;
      const instant = block.classList.contains('instant');
      setTimeout(callback, instant ? 0 : stagger + AFTER_REVEAL);
    } else {
      requestAnimationFrame(check);
    }
  };
  check();
}

function run(el) {
  const match = (el.dataset.final || el.textContent).match(/^(\D*)(\d+)(.*)$/s);
  if (!match) return;
  const [, before, digits, after] = match;
  const end = Number(digits);
  const start = performance.now();
  const id = runId;
  const step = (now) => {
    /* the language may change mid-count; stop and leave the translated text alone */
    if (id !== runId) return;
    const t = Math.min(1, (now - start) / DURATION);
    el.textContent = before + Math.round(end * ease(t)) + after;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initCountUp() {
  const numbers = [...document.querySelectorAll('.stat b')].filter((el) => /^\D*\d/.test(el.textContent));
  if (!numbers.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const id = runId;
        whenRevealed(entry.target, () => {
          if (id === runId) run(entry.target);
        });
      });
    },
    { threshold: 0.6, rootMargin: '0px 0px -10% 0px' },
  );
  numbers.forEach((el) => {
    /* start below the fold at zero, so the count never jumps back after the block has appeared */
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.dataset.final = el.textContent;
      el.textContent = el.textContent.replace(/\d+/, '0');
    }
    io.observe(el);
  });
  /* a language switch rewrites the stats with their final text, so the count is simply dropped */
  on('cpv:langchange', () => {
    runId += 1;
    io.disconnect();
    numbers.forEach((el) => delete el.dataset.final);
  });
}
