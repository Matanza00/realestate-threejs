// Demo data. Every unit, price and hall here is fictional.
const room = (name, x, y, w, h) => ({ name, x, y, w, h });

export const PLANS = {
  oneBed: { w: 14, h: 9, rooms: [room('Living', 0, 0, 8, 6), room('Bedroom', 8, 0, 6, 6), room('Kitchen', 0, 6, 4, 3), room('Bath', 4, 6, 3, 3), room('Dressing', 7, 6, 3, 3), room('Entry', 10, 6, 4, 3)] },
  twoBed: { w: 18, h: 11, rooms: [room('Living + dining', 0, 0, 10, 7), room('Master', 10, 0, 8, 6), room('Bedroom 2', 10, 6, 8, 5), room('Kitchen', 0, 7, 5, 4), room('Bath', 5, 7, 2.5, 4), room('Entry', 7.5, 7, 2.5, 4)] },
  duplex: { w: 18, h: 14, rooms: [room('Double-height living', 0, 0, 11, 8), room('Dining', 11, 0, 7, 5), room('Spiral stair', 11, 5, 3, 3), room('Kitchen', 14, 5, 4, 4), room('Guest suite', 0, 8, 7, 6), room('Study', 7, 8, 4, 6), room('Bath', 11, 9, 3, 5), room('Entry', 14, 9, 4, 5)] },
  penthouse: { w: 26, h: 16, rooms: [room('Grand salon', 0, 0, 13, 9), room('Dining', 13, 0, 7, 6), room('Terrace', 20, 0, 6, 9), room('Master suite', 0, 9, 9, 7), room('Bedroom 2', 9, 9, 6, 7), room('Bedroom 3', 15, 9, 5, 7), room('Kitchen', 13, 6, 7, 3), room('Staff + service', 20, 9, 6, 7)] },
};

export const SALE = [
  { id: 'S-1201', name: 'Gulf View One', plan: 'oneBed', beds: 1, baths: 1, area: 126, level: '12–20', price: 4_850_000, left: 9, view: 'Gulf' },
  { id: 'S-2105', name: 'Twin Sail Residence', plan: 'twoBed', beds: 2, baths: 2.5, area: 198, level: '21–34', price: 8_900_000, left: 4, view: 'Gulf + city' },
  { id: 'S-2500', name: 'Royal Duplex', plan: 'duplex', beds: 3, baths: 3.5, area: 252, level: '25 + 26', price: 16_500_000, left: 2, view: 'Sunset (west)' },
  { id: 'S-5300', name: 'Sky Penthouse', plan: 'penthouse', beds: 4, baths: 5, area: 416, level: '53–55', price: 39_000_000, left: 1, view: '360°' },
];

export const RENT = [
  { id: 'R-1408', name: 'Gulf View One', plan: 'oneBed', beds: 1, area: 126, level: '14', month: 38_000, night: 4_200, view: 'Gulf' },
  { id: 'R-2911', name: 'Twin Sail Residence', plan: 'twoBed', beds: 2, area: 198, level: '29', month: 62_000, night: 6_900, view: 'Gulf + city' },
  { id: 'R-2600', name: 'Royal Duplex', plan: 'duplex', beds: 3, area: 252, level: '26', month: 115_000, night: 12_500, view: 'Sunset (west)' },
];

export const HALLS = [
  { name: 'Al Bahr Ballroom', level: 'Ground', seated: 800, standing: 1400, day: 180_000, features: ['Atrium entrance', 'Stage and LED wall', 'Bridal suite'] },
  { name: 'Majlis Conference Hall', level: 'Level 3', seated: 260, standing: 400, day: 48_000, features: ['Simultaneous translation', 'Breakout rooms ×4', 'Broadcast studio'] },
  { name: 'Sky Lounge', level: 'Level 55', seated: 90, standing: 160, day: 95_000, features: ['229 m Gulf views', 'Private lift', 'Chef’s table'] },
  { name: 'Sunset Terrace', level: 'Terrace', seated: 300, standing: 600, day: 120_000, features: ['Two pools', 'Beach access', 'Fireworks permit support'] },
  { name: 'Boardroom Pearl', level: 'Level 18', seated: 24, standing: 30, day: 9_500, features: ['Video conferencing', 'Butler service'] },
  { name: 'Cinema Room', level: 'Level 2', seated: 48, standing: 0, day: 14_000, features: ['4K laser projection', 'Dolby Atmos'] },
  { name: 'Garden Pavilion', level: 'Island garden', seated: 150, standing: 250, day: 42_000, features: ['Palm garden', 'Fountain view'] },
];

// Availability per level for the interactive stack (deterministic pseudo-random).
export const LEVELS = Array.from({ length: 56 }, (_, i) => {
  const n = i + 1;
  const use =
    n <= 2 ? 'Lobby + atrium' : n <= 4 ? 'Halls + dining' : n === 18 ? 'Spa' : n >= 55 ? 'Sky lounge' : n >= 53 ? 'Penthouses' : n >= 25 && n <= 26 ? 'Royal duplexes' : n >= 21 ? 'Two-bedroom' : 'One-bedroom';
  const total = use.includes('Penthouse') ? 1 : use.includes('duplex') ? 2 : use.includes('bedroom') ? 4 : 0;
  const avail = total ? Math.abs(Math.round(Math.sin(n * 12.9898) * 43758.5453) % (total + 1)) : 0;
  return { n, use, total, avail };
});

export const AED = (v) => `AED ${v.toLocaleString('en-US')}`;
