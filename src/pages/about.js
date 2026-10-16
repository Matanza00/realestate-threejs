import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { miniSail } from './mini-sail.js';

gsap.registerPlugin(ScrollTrigger);
miniSail(document.getElementById('hero'), { hour: 17.6, distance: 480 });
gsap.utils.toArray('.reveal').forEach((el) => gsap.from(el, { y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
gsap.utils.toArray('.timeline li').forEach((el, i) =>
  gsap.from(el, { x: -40, autoAlpha: 0, duration: 0.7, delay: i * 0.05, scrollTrigger: { trigger: el, start: 'top 88%' } }),
);
