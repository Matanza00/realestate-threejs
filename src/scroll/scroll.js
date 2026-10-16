import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  const lenis = new Lenis({ lerp: state.reducedMotion ? 1 : 0.08, smoothWheel: !state.reducedMotion });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({
    trigger: '#story',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      state.target = self.progress;
    },
  });

  // Copy fades in and out as each chapter passes the middle of the screen.
  document.querySelectorAll('.chapter').forEach((el) => {
    gsap.fromTo(
      el.children,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 70%', end: 'top 30%', scrub: true },
      },
    );
  });

  return lenis;
}
