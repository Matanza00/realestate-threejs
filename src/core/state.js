// Shared, mutable app state. Scroll writes `target`; the loop damps `progress` toward it.
export const state = {
  target: 0,
  progress: 0,
  velocity: 0,
  hour: 6,
  pointer: { x: 0, y: 0 },
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

export function chapterAt(chapters, p) {
  return chapters.find((c) => p >= c.start && p < c.end) ?? chapters[chapters.length - 1];
}

// Progress inside a chapter, 0..1.
export function local(chapter, p) {
  return Math.min(1, Math.max(0, (p - chapter.start) / (chapter.end - chapter.start)));
}
