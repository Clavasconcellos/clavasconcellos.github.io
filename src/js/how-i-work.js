/* Home "How I work" section: scroll-linked progress.
   Each step's bar fills while that step passes a reading line in the middle of the screen, and the green line
   beside the step index grows from nothing to the full list as the four steps are read. The step being read is
   marked with aria-current. The fills follow the scroll position directly (no animation), so they stay on with
   reduced motion; only smooth scrolling for the index links is turned off. */
import { reducedMotion } from './utils.js';

const READ_LINE = 0.5; /* share of the viewport height */

export function initHowIWork() {
  const section = document.querySelector('.ai');
  if (!section) return;
  const steps = [...section.querySelectorAll('.ai-step')];
  const bars = steps.map((step) => step.querySelector('.ai-bar span'));
  const rail = section.querySelector('.ai-rail-fill');
  const links = [...section.querySelectorAll('.ai-rail a')];
  let ticking = false;
  let current = -1;

  const update = () => {
    ticking = false;
    const line = window.innerHeight * READ_LINE;
    let total = 0;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      total += p;
      if (bars[i]) bars[i].style.setProperty('--p', p.toFixed(4));
    });
    if (rail) rail.style.setProperty('--p', (total / steps.length).toFixed(4));
    const active = Math.min(steps.length - 1, Math.floor(total));
    if (active !== current) {
      current = active;
      links.forEach((link, i) => {
        if (i === active) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    }
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  /* only listen while the section is near the screen */
  let listening = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        request();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener('scroll', request);
        window.removeEventListener('resize', request);
        request();
      }
    },
    { rootMargin: '200px 0px' },
  );
  io.observe(section);
  update();

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });
}
