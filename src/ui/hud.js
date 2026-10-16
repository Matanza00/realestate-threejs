import { BUILDING } from '../config.js';

const floorEl = document.getElementById('hud-floor');
const timeEl = document.getElementById('hud-time');

// Quarters between the schedule start and end, e.g. Q1 2026 → Q4 2027.
function quarter(t) {
  const [q0, y0] = BUILDING.schedule[0].slice(1).split(' ').map(Number);
  const [q1, y1] = BUILDING.schedule[1].slice(1).split(' ').map(Number);
  const start = y0 * 4 + (q0 - 1);
  const n = Math.round(start + t * (y1 * 4 + (q1 - 1) - start));
  return `Q${(n % 4) + 1} ${Math.floor(n / 4)}`;
}

export function updateHud(chapterId, buildT, hour) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (chapterId === 'build') {
    const floor = Math.min(BUILDING.floors, Math.max(1, Math.ceil(buildT * BUILDING.floors)));
    floorEl.textContent = `Floor ${floor} of ${BUILDING.floors} · ${quarter(buildT)}`;
    floorEl.style.opacity = 1;
  } else if (chapterId === 'apartment') {
    floorEl.textContent = `Floor ${BUILDING.showcaseFloor} · West-facing`;
    floorEl.style.opacity = 1;
  } else {
    floorEl.style.opacity = 0;
  }
}
