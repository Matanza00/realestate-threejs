import { gsap } from 'gsap';
import { miniSail } from './mini-sail.js';

miniSail(document.getElementById('hero'), { hour: 20.6, night: 1, distance: 560 });

const form = document.getElementById('contact-form');
const q = new URLSearchParams(location.search);
const topic = q.get('topic');
if (topic) form.topic.value = topic;
const ref = q.get('unit') || q.get('hall');
if (ref) form.message.value = `I'm interested in ${ref}.`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('sent').textContent = 'Thank you. This is a demo, so nothing was sent.';
  form.reset();
});
gsap.from('.panel', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
