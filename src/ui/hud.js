import { SAIL } from '../config.js';

const floorEl = document.getElementById('hud-floor');
const timeEl = document.getElementById('hud-time');

// Construction quarters from Q1 2026 to Q4 2028 while the tower rises.
function quarter(t) {
  const n = Math.round(2026 * 4 + t * 11);
  return `Q${(n % 4) + 1} ${Math.floor(n / 4)}`;
}

const LABELS = {
  suite: 'Royal Duplex · Level 25 · Gulf view',
  sky: 'Sky deck · 229 m',
  atrium: 'Atrium · 180 m to the ceiling',
  terrace: 'Terrace · two pools, 30 cabanas',
};

export function updateHud(chapter, buildT, hour) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  let text = LABELS[chapter.id];
  if (chapter.id === 'build') {
    const level = Math.min(SAIL.floors, Math.max(1, Math.ceil(buildT * SAIL.floors)));
    text = `Level ${level} of ${SAIL.floors} · ${quarter(buildT)}`;
  }
  floorEl.textContent = text ?? '';
  floorEl.style.opacity = text ? 1 : 0;
}
