/* Home projects list: hovering or focusing a row highlights it and swaps the image column (the last image stays).
   The outgoing image leaves fast, then the incoming one glides in from a set start position. */

export function initProjectsList() {
  const visual = document.querySelector('.work-visual');
  const rows = [...document.querySelectorAll('.work-list .project')];
  let shownKey = null;

  const showImage = (key) => {
    if (!visual || key === shownKey) return;
    shownKey = key;
    visual.querySelectorAll('img').forEach((img) => {
      if (img.dataset.key !== key) {
        img.classList.remove('on');
        return;
      }
      img.classList.add('prep');
      img.classList.remove('on');
      void img.offsetWidth; /* commit the start position before animating */
      img.classList.remove('prep');
      img.classList.add('on');
    });
  };

  rows.forEach((row) => {
    const enter = () => {
      rows.forEach((other) => other.classList.toggle('is-hover', other === row));
      showImage(row.dataset.key);
    };
    const leave = () => row.classList.remove('is-hover');
    row.addEventListener('mouseenter', enter);
    row.addEventListener('mouseleave', leave);
    row.addEventListener('focusin', enter);
    row.addEventListener('focusout', leave);
  });
}
