# Clarissa Pilla Vasconcellos · Portfolio

Personal portfolio of a Product Designer based in Porto Alegre, Brazil.
Live at **[clavasconcellos.github.io](https://clavasconcellos.github.io/)**.

## What's inside

- Six pages in one document: home, resume and four case studies (3tentos, Best Egg, TentosCap, Foca no Concurso), switched with hash routes (`#home`, `#resume`, …) so the browser's Back button works.
- English and Brazilian Portuguese, picked from the visitor's browser language and switchable at any time.
- Light and dark themes that follow the system setting, with a manual toggle.
- A background of soft leaf shadows drawn live with WebGL, so it stays sharp at any screen size. A static image is used when WebGL isn't available.
- Before/after comparison sliders, animated project logos and scroll reveals.

## Accessibility

Designed and checked against WCAG 2.2 AA (the WAVE checker reports no errors):

- Semantic landmarks, a skip link, and visible focus styles on every control.
- Anything that moves can be paused, and all motion stops when the system asks for reduced motion.
- The sliders work with the keyboard (arrow keys, Home, End) and announce their position to screen readers.
- Alt text is written for every meaningful image and translated with the page.

## Tech

Plain HTML, CSS and JavaScript, with no framework. [Eleventy](https://www.11ty.dev) assembles the page from shared layouts and partials (so the header and footer are written once) and copies everything else as it is. What the browser receives is still plain HTML, CSS and JavaScript.

```
src/
  _includes/
    layouts/base.njk  the document shell: head, header, main, footer
    partials/         header, footer, icon sprite and toast, shared by every page
  index.njk           the page content
  css/
    tokens.css        design tokens (colors, spacing, type, motion) for light and dark
    base.css          reset, layout container, type scale, utilities
    layout.css        header and footer
    components.css    background, comparison slider, pause button, toast
    pages.css         home, resume and case-study styles
  js/                 ES modules, loaded from js/main.js
    main.js           entry point: starts the modules in order
    i18n.js           English/Portuguese switching (i18n/pt.js holds the Portuguese copy)
    router.js         pages, browser history and titles
    header.js         Projects dropdown and mobile menu
    theme.js          light/dark mode
    motion.js         hero video and pause/play buttons
    background.js     WebGL leaf-shadow background
    compare.js        before/after sliders
    reveal.js         scroll reveal
    projects-list.js  home projects list hover
    toast.js          copy-email button and its confirmation
    utils.js          shared helpers
  assets/logos.svg    animated project logos (SVG sprite)
  assets/             images, video and icons
eleventy.config.js    build settings
.github/workflows/    builds every pull request; builds and publishes every merge to main
```

The modules don't call each other directly. They announce changes with a few document events (`cpv:langchange`, `cpv:themechange`, `cpv:routechange`, `cpv:motionchange`) and listen for the ones they care about.

Colors, spacing and components come from **Passiflora**, my design system in Figma, so the tokens in `src/css/tokens.css` mirror its variables.

## Run it locally

Needs [Node.js](https://nodejs.org) 20 or newer. Once, after cloning:

```sh
npm install
```

Then, each time:

```sh
npm start
```

This builds the site into `_site/`, opens a local server at http://localhost:8080 and rebuilds whenever a file changes. `npm run build` only builds.

## Publishing

Every merge to `main` runs the workflow in `.github/workflows/deploy.yml`, which builds the site and publishes `_site/` to GitHub Pages. Pull requests are built too, so a change that breaks the build shows a failed check before it is merged.

## Code style

Formatting follows [Prettier](https://prettier.io) with the settings in `.prettierrc.json`, and `.editorconfig` keeps editors consistent. Prettier is only a formatter, so the site doesn't depend on it. To format everything:

```sh
npm run format
```

## License

The code is free to read and learn from. The case-study content, images and logos belong to their owners and are not licensed for reuse.
