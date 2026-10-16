import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Headlines rise word by word, scrubbed to scroll; numbers count up; the
// amenities strip scrolls sideways while pinned.
export function initText() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="w"><span>${w}</span></span>`)
      .join(' ');
    gsap.fromTo(
      el.querySelectorAll('.w > span'),
      { yPercent: 110, rotate: 4 },
      { yPercent: 0, rotate: 0, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: 0.6 } },
    );
  });

  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString()),
    });
  });

  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.to(el, { yPercent: -Number(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: el, scrub: true } });
  });

  const strip = document.querySelector('.strip');
  if (strip) {
    gsap.to(strip, {
      x: () => -(strip.scrollWidth - window.innerWidth + 64),
      ease: 'none',
      scrollTrigger: { trigger: '#amenities', start: 'top top', end: () => `+=${strip.scrollWidth}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
    });
  }
}
