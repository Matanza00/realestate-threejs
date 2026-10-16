// Chapter ranges in scroll progress (0..1). `hour` drives the sun, `exposure`
// is the eye adapting indoors (1 = outdoor).
export const CHAPTERS = [
  { id: 'dawn', start: 0.0, end: 0.07, hour: 6.0, label: 'Dawn' },
  { id: 'sketch', start: 0.07, end: 0.17, hour: 6.8, label: 'The sketch' },
  { id: 'build', start: 0.17, end: 0.3, hour: 8.5, label: 'Rising' },
  { id: 'sail', start: 0.3, end: 0.38, hour: 10.0, label: 'The sail' },
  { id: 'arrive', start: 0.38, end: 0.48, hour: 11.5, label: 'Arrival' },
  { id: 'atrium', start: 0.48, end: 0.57, hour: 12.5, label: 'Atrium', exposure: 1.9 },
  { id: 'suite', start: 0.57, end: 0.7, hour: 15.0, label: 'Royal suite', exposure: 1.5 },
  { id: 'sky', start: 0.7, end: 0.78, hour: 16.5, label: 'Sky deck' },
  { id: 'terrace', start: 0.78, end: 0.88, hour: 17.8, label: 'Terrace' },
  { id: 'night', start: 0.88, end: 1.0, hour: 20.5, label: 'Night' },
];

// "The Sail": a concept study inspired by Burj Al Arab. Metres.
export const SAIL = {
  height: 270,
  topS: 0.93,
  spineZ: -45,
  depth: 85,
  halfWidth: 34,
  floors: 56,
  deck: 2,
};

export const ISLAND = { radius: 105, centerZ: -5 };
export const SHORE_Z = 380;

// Dubai, for sun direction and day length.
export const LOCATION = { lat: 25.14, maxElevation: 78 };

export const EYE_HEIGHT = 1.6;
