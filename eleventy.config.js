/* Eleventy assembles the pages in src/ from shared layouts and partials, and copies the static files as they are.
   The result in _site/ is plain HTML, CSS and JavaScript: no framework code reaches the browser. */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/js');
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/favicon.ico');

  return {
    dir: { input: 'src', output: '_site' },
    templateFormats: ['njk'],
  };
}
