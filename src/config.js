// Chapter ranges in scroll progress (0..1). Hours drive the sun.
export const CHAPTERS = [
  { id: 'plot', start: 0.0, end: 0.1, hour: 6.0 },
  { id: 'sketch', start: 0.1, end: 0.25, hour: 7.0 },
  { id: 'build', start: 0.25, end: 0.45, hour: 9.5 },
  { id: 'walk', start: 0.45, end: 0.6, hour: 12.5 },
  { id: 'apartment', start: 0.6, end: 0.85, hour: 17.5 },
  { id: 'night', start: 0.85, end: 1.0, hour: 20.5 },
];

export const BUILDING = {
  floors: 14,
  floorHeight: 3.2,
  width: 22,
  depth: 16,
  showcaseFloor: 7,
  schedule: ['Q1 2026', 'Q4 2027'],
};

// Dubai, used for sun direction and day length.
export const LOCATION = { lat: 25.2, maxElevation: 78 };

export const EYE_HEIGHT = 1.6;
