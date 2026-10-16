import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { miniSail } from './mini-sail.js';
import { PLANS, SALE, RENT, HALLS, LEVELS, AED } from './data.js';

gsap.registerPlugin(ScrollTrigger);
miniSail(document.getElementById('hero'), { hour: 9.5, distance: 600 });

// Floor plan as SVG; the sea-facing wall (top edge) is drawn in gold.
function planSvg(key) {
  const p = PLANS[key];
  const s = 20;
  const rooms = p.rooms
    .map(
      (r) => `<rect x="${r.x * s}" y="${r.y * s}" width="${r.w * s}" height="${r.h * s}" fill="rgba(232,194,122,0.06)" stroke="rgba(246,242,234,0.55)" stroke-width="1.5"/>
      <text x="${(r.x + r.w / 2) * s}" y="${(r.y + r.h / 2) * s}" fill="rgba(246,242,234,0.8)" font-size="11" text-anchor="middle" dominant-baseline="middle">${r.name}</text>
      <text x="${(r.x + r.w / 2) * s}" y="${(r.y + r.h / 2) * s + 14}" fill="rgba(246,242,234,0.45)" font-size="9" text-anchor="middle">${(r.w * r.h).toFixed(0)} m²</text>`,
    )
    .join('');
  return `<svg viewBox="-10 -16 ${p.w * s + 20} ${p.h * s + 26}" role="img" aria-label="Floor plan">
    <text x="${(p.w * s) / 2}" y="-5" fill="#e8c27a" font-size="10" text-anchor="middle" letter-spacing="2">SEA VIEW</text>
    ${rooms}<line x1="0" y1="0" x2="${p.w * s}" y2="0" stroke="#e8c27a" stroke-width="4"/></svg>`;
}

const tag = (left) => `<span class="tag ${left > 2 ? 'ok' : 'low'}">${left} left</span>`;

const views = {
  buy: () =>
    SALE.map(
      (u) => `<article class="panel unit">
        <p class="eyebrow">${u.id} · Levels ${u.level}</p><h3>${u.name}</h3>
        <div class="meta"><span>${u.beds} bed</span><span>${u.baths} bath</span><span>${u.area} m²</span><span>${u.view}</span>${tag(u.left)}</div>
        ${planSvg(u.plan)}
        <p class="price">${AED(u.price)}</p>
        <p class="meta"><span>${AED(Math.round(u.price / u.area))} per m²</span><span>Handover Q4 2028</span></p>
        <a class="cta" href="/contact.html?topic=buy&unit=${u.id}">Request details</a>
      </article>`,
    ).join(''),
  rent: () =>
    RENT.map(
      (u) => `<article class="panel unit">
        <p class="eyebrow">${u.id} · Level ${u.level}</p><h3>${u.name}</h3>
        <div class="meta"><span>${u.beds} bed</span><span>${u.area} m²</span><span>${u.view}</span><span>Fully furnished</span></div>
        ${planSvg(u.plan)}
        <table><tr><th>Monthly</th><td>${AED(u.month)}</td></tr><tr><th>Nightly</th><td>${AED(u.night)}</td></tr><tr><th>Yearly (2 cheques)</th><td>${AED(u.month * 11)}</td></tr></table>
        <a class="cta" href="/contact.html?topic=rent&unit=${u.id}">Book a viewing</a>
      </article>`,
    ).join(''),
  halls: () =>
    HALLS.map(
      (h) => `<article class="panel unit">
        <p class="eyebrow">${h.level}</p><h3>${h.name}</h3>
        <div class="meta"><span>${h.seated} seated</span>${h.standing ? `<span>${h.standing} standing</span>` : ''}</div>
        <ul>${h.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <p class="price" style="margin-top:14px">${AED(h.day)} <small style="font-size:0.9rem;color:var(--muted)">per day</small></p>
        <a class="cta" href="/contact.html?topic=hall&hall=${encodeURIComponent(h.name)}">Check dates</a>
      </article>`,
    ).join(''),
};

const list = document.getElementById('units');
const tabs = [...document.querySelectorAll('.tabs button')];
function show(key) {
  tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === key)));
  list.innerHTML = views[key]();
  gsap.from(list.children, { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' });
}
tabs.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
show(new URLSearchParams(location.search).get('tab') ?? 'buy');

// Level stack: the sail silhouette sliced into 56 bands; hover or tap a level.
const stack = document.getElementById('stack');
const info = document.getElementById('floor-info');
const H = 560;
const bands = LEVELS.map((l) => {
  const s = (l.n - 1) / 56;
  const y = H - (l.n / 56) * H * 0.93;
  const w = 220 * (1 - s ** 2.2) * (1 + 0.35 * Math.sin(Math.PI * s * 0.9)) * 0.6 + 14;
  const fill = !l.total ? 'rgba(246,242,234,0.12)' : l.avail ? 'rgba(232,194,122,0.55)' : 'rgba(246,242,234,0.25)';
  return `<rect class="band" data-n="${l.n}" x="20" y="${y}" width="${w}" height="${(H * 0.93) / 56 - 1.5}" rx="1.5" fill="${fill}"/>`;
}).join('');
stack.innerHTML = `<svg viewBox="0 0 300 ${H + 10}" role="img" aria-label="Levels of the tower">${bands}
  <line x1="20" y1="0" x2="20" y2="${H}" stroke="rgba(246,242,234,0.6)" stroke-width="3"/></svg>`;
function pick(n) {
  const l = LEVELS[n - 1];
  stack.querySelectorAll('.band').forEach((b) => (b.style.stroke = b.dataset.n == n ? '#fff' : 'none'));
  info.innerHTML = `<h3>Level ${l.n}</h3><p>${l.use}</p>${l.total ? `<p>${l.avail} of ${l.total} residences available</p>` : '<p>Shared amenities</p>'}`;
}
stack.addEventListener('pointerover', (e) => e.target.dataset?.n && pick(Number(e.target.dataset.n)));
stack.addEventListener('click', (e) => e.target.dataset?.n && pick(Number(e.target.dataset.n)));
pick(25);

// Payment estimate.
const price = document.getElementById('calc-price');
const down = document.getElementById('calc-down');
const years = document.getElementById('calc-years');
const out = document.getElementById('calc-out');
function calc() {
  const P = Number(price.value) * (1 - Number(down.value) / 100);
  const r = 0.045 / 12;
  const n = Number(years.value) * 12;
  const m = (P * r) / (1 - (1 + r) ** -n);
  out.innerHTML = `Down payment ${down.value}% · ${years.value} years at 4.5% → <b style="color:var(--accent)">${AED(Math.round(m))} per month</b>`;
}
[price, down, years].forEach((el) => el.addEventListener('input', calc));
calc();

gsap.utils.toArray('.reveal').forEach((el) => gsap.from(el, { y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
