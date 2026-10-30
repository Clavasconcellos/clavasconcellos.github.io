/* About stats: numbers count up once when they scroll into view ("5 yrs", "5+"), and "Gold medal" rolls up
   through bronze and silver like a slot machine (Figma: Portfolio Redesign 1157:94748).
   Only the moving part changes, so the text and its translation stay as they are; the roll is aria-hidden
   while a hidden copy of the final text is read out. Nothing moves with reduced motion. */
import { reducedMotion, on } from './utils.js';
import { getLang } from './i18n.js';

/* last item is the final text */
const ROLLS = {
  medal: {
    en: ['Bronze medal', 'Silver medal', 'Gold medal'],
    pt: ['Medalha de bronze', 'Medalha de prata', 'Medalha de ouro'],
  },
};
const ROLL_STEP = 420;

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

/* the column lists the final text first, so it ends at translateY(0) */
function buildRoll(el) {
  const items = ROLLS[el.dataset.roll]?.[getLang()];
  if (!items) return null;
  const col = [...items].reverse();
  el.innerHTML =
    '<span class="roll" aria-hidden="true"><span class="roll-col">' +
    col.map((text) => `<span>${text}</span>`).join('') +
    `</span></span><span class="visually-hidden">${items[items.length - 1]}</span>`;
  const column = el.querySelector('.roll-col');
  column.style.transform = `translateY(-${((col.length - 1) / col.length) * 100}%)`;
  return { column, steps: col.length - 1, final: items[items.length - 1] };
}

function roll(el) {
  const built = el.querySelector('.roll-col') ? null : buildRoll(el);
  const column = built ? built.column : el.querySelector('.roll-col');
  if (!column) return;
  const steps = column.children.length - 1;
  const final = column.children[0].textContent;
  const id = runId;
  let left = steps;
  const next = () => {
    if (id !== runId) return;
    left -= 1;
    column.style.transform = `translateY(-${(left / (steps + 1)) * 100}%)`;
    if (left > 0) setTimeout(next, ROLL_STEP);
    else
      setTimeout(() => {
        if (id === runId) el.textContent = final;
      }, ROLL_STEP + 200);
  };
  requestAnimationFrame(() => requestAnimationFrame(next));
}

export function initCountUp() {
  const numbers = [...document.querySelectorAll('.stat b')].filter((el) => /^\D*\d/.test(el.textContent));
  const rolls = [...document.querySelectorAll('.stat b[data-roll]')];
  if (!(numbers.length + rolls.length) || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const id = runId;
        whenRevealed(entry.target, () => {
          if (id !== runId) return;
          if (entry.target.dataset.roll) roll(entry.target);
          else run(entry.target);
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
  rolls.forEach((el) => {
    /* below the fold, start on the first item so nothing jumps after the block appears */
    if (el.getBoundingClientRect().top > window.innerHeight) buildRoll(el);
    io.observe(el);
  });
  /* a language switch rewrites the stats with their final text, so the count is simply dropped */
  on('cpv:langchange', () => {
    runId += 1;
    io.disconnect();
    numbers.forEach((el) => delete el.dataset.final);
  });
}
