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

Plain HTML, CSS and JavaScript, with no framework and no build step. The files in this repository are exactly what the browser receives, and GitHub Pages serves them as they are.

```
index.html          markup for all pages
css/
  tokens.css        design tokens (colors, spacing, type, motion) for light and dark
  base.css          reset, layout container, type scale, utilities
  layout.css        header and footer
  components.css    background, comparison slider, pause button, toast
  pages.css         home, resume and case-study styles
assets/             images, video and icons
```

Colors, spacing and components come from **Passiflora**, my design system in Figma, so the tokens in `css/tokens.css` mirror its variables.

## Run it locally

Any static server works. With Python installed:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## License

The code is free to read and learn from. The case-study content, images and logos belong to their owners and are not licensed for reuse.
