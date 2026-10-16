import { CHAPTERS } from '../config.js';
import { state, chapterAt } from '../core/state.js';

// Chapter dots on the right edge: shows where you are, click to walk there.
export function initRail(lenis) {
  const rail = document.getElementById('rail');
  if (!rail) return;
  const story = document.getElementById('story');
  const dots = CHAPTERS.map((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = c.label;
    b.setAttribute('aria-label', `Go to ${c.label}`);
    b.innerHTML = `<span>${c.label}</span>`;
    b.addEventListener('click', () => {
      const range = story.offsetHeight - window.innerHeight;
      lenis.scrollTo(story.offsetTop + (c.start + 0.002) * range, { duration: 2.2 });
    });
    rail.appendChild(b);
    return b;
  });
  let current = null;
  (function tick() {
    const c = chapterAt(CHAPTERS, state.progress);
    if (c !== current) {
      current = c;
      dots.forEach((d, i) => d.classList.toggle('on', CHAPTERS[i] === c));
    }
    rail.classList.toggle('hidden', state.target >= 0.999);
    requestAnimationFrame(tick);
  })();
}
