/* Entry point. The modules start in this order because each step relies on the ones before it:
   the header copies its buttons before translation, the copy is translated before pages show,
   and the scroll reveal marks blocks before the sliders wait on it. */
import { initHeader } from './header.js';
import { initI18n } from './i18n.js';
import { initTheme } from './theme.js';
import { initMotion } from './motion.js';
import { initRouter } from './router.js';
import { initBackground } from './background.js';
import { initProjectsList } from './projects-list.js';
import { initToast } from './toast.js';
import { initReveal } from './reveal.js';
import { initCompare } from './compare.js';

initHeader();
initI18n();
initTheme();
initMotion();
initRouter();
initBackground();
initProjectsList();
initToast();
initReveal();
initCompare();
