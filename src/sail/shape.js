import * as THREE from 'three';
import { SAIL } from '../config.js';

const { height: H, spineZ, depth: D0, halfWidth: W0 } = SAIL;

// Side profile: the front bellies out around a third of the way up, like a sail in wind.
export const depthAt = (s) => D0 * (1 - s ** 2.2) * (1 + 0.35 * Math.sin(Math.PI * s * 0.9));
export const halfWidthAt = (s) => W0 * (1 - s ** 2.4) * (1 + 0.15 * Math.sin(Math.PI * s));

const TIP = 0.72;

// Key points of the V-shaped plan at height fraction s.
export function plan(s) {
  const y = s * H;
  const d = depthAt(s);
  const w = halfWidthAt(s);
  const tipZ = spineZ + TIP * d;
  return {
    y,
    spine: new THREE.Vector3(0, y, spineZ),
    left: new THREE.Vector3(-w, y, tipZ),
    right: new THREE.Vector3(w, y, tipZ),
    control: new THREE.Vector3(0, y, spineZ + (2 - TIP) * d),
  };
}

export function fabricPoint(p, t, out = new THREE.Vector3()) {
  const a = (1 - t) ** 2;
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return out.set(
    a * p.left.x + b * p.control.x + c * p.right.x,
    p.y,
    a * p.left.z + b * p.control.z + c * p.right.z,
  );
}

// Outward normal (in plan) of the face running from the spine to a wing tip.
export function faceNormal(p, side) {
  const tip = side < 0 ? p.left : p.right;
  const dir = tip.clone().sub(p.spine).setY(0).normalize();
  const n = new THREE.Vector3(dir.z, 0, -dir.x);
  if (Math.sign(n.x) !== Math.sign(side)) n.negate();
  return n;
}

// Lofts rows of points (one row per height) into an indexed surface with UVs.
export function loft(rows, vRepeat, uRepeat) {
  const cols = rows[0].length;
  const pos = [];
  const uv = [];
  const idx = [];
  rows.forEach((row, j) => {
    row.forEach((p, i) => {
      pos.push(p.x, p.y, p.z);
      uv.push((i / (cols - 1)) * uRepeat, (j / (rows.length - 1)) * vRepeat);
    });
  });
  for (let j = 0; j < rows.length - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i;
      const b = a + cols;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
