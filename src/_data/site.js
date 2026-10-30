/* Site-wide data, available in every template. */
export default {
  url: 'https://clavasconcellos.github.io',
  /* defaults for the description and link preview; a page can set its own in its front matter */
  description: 'Portfólio de Clarissa Pilla Vasconcellos, Product Designer em Porto Alegre, Brasil.',
  ogImage: 'og-image.jpg',
  ogAlt: 'Clarissa Pilla Vasconcellos, Product Designer',
  /* pages that count as "Projects" in the header */
  projects: ['3tentos', 'bestegg', 'tentoscap', 'foca'],
  /* every page except home, by its address: used to redirect the old /#3tentos style links */
  routes: ['resume', '3tentos', 'bestegg', 'tentoscap', 'foca'],
};
