/* Entry point. The modules start in this order because each step relies on the ones before it:
   the header copies its buttons before translation, the copy is translated before the title is set,
   and the scroll reveal marks blocks before the sliders wait on it. */
import { initHeader } from './header.js';
import { initI18n } from './i18n.js';
import { initTheme } from './theme.js';
import { initMotion } from './motion.js';
import { initPage } from './page.js';
import { initBackground } from './background.js';
import { initProjectsList } from './projects-list.js';
import { initHowIWork } from './how-i-work.js';
import { initCountUp } from './count-up.js';
import { initToast } from './toast.js';
import { initReveal } from './reveal.js';
import { initCompare } from './compare.js';

initHeader();
initI18n();
initTheme();
initMotion();
initPage();
initBackground();
initProjectsList();
initHowIWork();
initCountUp();
initToast();
initReveal();
initCompare();
