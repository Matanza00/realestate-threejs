import * as THREE from 'three';
import { SAIL } from '../config.js';
import { applyPour } from '../shaders/pour.js';
import { plan, fabricPoint, faceNormal, loft } from './shape.js';
import * as tex from './textures.js';

const ROWS = 90;
const WING_COLS = 8;
const FABRIC_COLS = 32;
const { topS, floors, deck, height: H } = SAIL;

export const TOWER_TOP = topS * H + deck;

export function createTower(scene) {
  const group = new THREE.Group();
  group.position.y = deck;
  scene.add(group);

  const uBuild = { value: -1 };
  const uFabric = { value: -1 };
  const pour = (m, u = uBuild) => applyPour(m, u);

  const rows = Array.from({ length: ROWS + 1 }, (_, j) => plan((j / ROWS) * topS));

  // Wings: outer face white + glass, inner (atrium) face gold + blue.
  const wingRows = (side) =>
    rows.map((p) => {
      const tip = side < 0 ? p.left : p.right;
      return Array.from({ length: WING_COLS + 1 }, (_, i) => {
        const t = i / WING_COLS;
        return side < 0 ? p.spine.clone().lerp(tip, t) : tip.clone().lerp(p.spine, t);
      });
    });
  const outerTex = tex.wingOuter();
  const innerTex = tex.wingInner();
  const outer = pour(new THREE.MeshStandardMaterial({ map: outerTex, roughness: 0.35, metalness: 0.2, side: THREE.FrontSide }));
  const inner = pour(new THREE.MeshStandardMaterial({ map: innerTex, roughness: 0.4, metalness: 0.5, side: THREE.BackSide, emissive: 0x3a2a10, emissiveIntensity: 0.4 }));
  for (const side of [-1, 1]) {
    const geo = loft(wingRows(side), floors * topS, 10);
    const o = new THREE.Mesh(geo, outer);
    const i = new THREE.Mesh(geo, inner);
    o.castShadow = o.receiveShadow = true;
    i.receiveShadow = true;
    group.add(o, i);
  }

  // Fabric wall between the wing tips; spreads open from the centre ("unfurls").
  const fabricPivot = new THREE.Group();
  fabricPivot.position.set(0, 0, 0);
  group.add(fabricPivot);
  const fabricRows = rows.map((p) => Array.from({ length: FABRIC_COLS + 1 }, (_, i) => fabricPoint(p, i / FABRIC_COLS)));
  const fabricGeo = loft(fabricRows, 14, 1);
  const fabricMat = pour(
    new THREE.MeshStandardMaterial({ map: tex.fabric(), roughness: 0.75, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0 }),
    uFabric,
  );
  const fabric = new THREE.Mesh(fabricGeo, fabricMat);
  fabric.castShadow = true;
  fabricPivot.add(fabric);

  // Roof cap over the top ring.
  const top = rows[rows.length - 1];
  const capPts = [top.spine, top.left, ...Array.from({ length: 16 }, (_, i) => fabricPoint(top, (i + 1) / 17)), top.right];
  const capGeo = new THREE.BufferGeometry().setFromPoints(capPts);
  capGeo.setIndex(capPts.slice(1, -1).flatMap((_, i) => [0, i + 2, i + 1]));
  capGeo.computeVertexNormals();
  const white = pour(new THREE.MeshStandardMaterial({ color: 0xf2f1ed, roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide }));
  group.add(new THREE.Mesh(capGeo, white));

  // Exoskeleton: tubes along the wing tips and big X braces on each side.
  const exo = new THREE.Group();
  group.add(exo);
  const tube = (pts, r) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 2), r, 10), white);
    m.castShadow = true;
    exo.add(m);
  };
  for (const side of [-1, 1]) {
    tube(rows.filter((_, j) => j % 6 === 0 || j === ROWS).map((p) => (side < 0 ? p.left : p.right).clone()), 1.6);
    const face = (s, t) => {
      const p = plan(s);
      const tip = side < 0 ? p.left : p.right;
      return p.spine.clone().lerp(tip, t).addScaledVector(faceNormal(p, side), 3.2);
    };
    for (const [a, b] of [[0.02, 0.3], [0.3, 0.56], [0.56, 0.8]]) {
      tube([face(a, 0.95), face((a + b) / 2, 0.55), face(b, 0.12)], 1.3);
      tube([face(a, 0.12), face((a + b) / 2, 0.55), face(b, 0.95)], 1.3);
      tube([face(b, 0.1), face(b, 0.97)], 0.9);
    }
  }

  // Mast above the spine.
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 3.4, 125, 16), white);
  mast.position.set(0, 258, SAIL.spineZ - 2);
  mast.castShadow = true;
  group.add(mast);

  // Helipad cantilevered off the left wing, sky deck capsule off the right.
  const hp = plan(0.78);
  const hn = faceNormal(hp, -1);
  const padMat = pour(new THREE.MeshStandardMaterial({ map: tex.helipad(), roughness: 0.8 }));
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 1.2, 48), [white, padMat, white]);
  pad.position.copy(hp.left).addScaledVector(hn, 16).add(new THREE.Vector3(0, 0, -6));
  pad.castShadow = true;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 22), white);
  beam.position.copy(pad.position).lerp(hp.left, 0.55).add(new THREE.Vector3(0, -2.2, 0));
  beam.lookAt(hp.left.clone().add(new THREE.Vector3(0, -2.2, 0)));
  group.add(pad, beam);

  const sp = plan(0.84);
  const sn = faceNormal(sp, 1);
  const deckMat = pour(new THREE.MeshStandardMaterial({ color: 0x9ab3c4, roughness: 0.08, metalness: 0.8, emissive: 0xffc27a, emissiveIntensity: 0 }));
  const skyDeck = new THREE.Mesh(new THREE.CapsuleGeometry(5.5, 26, 8, 24), deckMat);
  const mid = sp.spine.clone().lerp(sp.right, 0.55);
  skyDeck.position.copy(mid).addScaledVector(sn, 12);
  skyDeck.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sn);
  skyDeck.castShadow = true;
  group.add(skyDeck);

  const sketch = createSketch(group, rows);

  return {
    group,
    helipad: pad.position.clone().add(group.position),
    skyDeck: skyDeck.position.clone().add(group.position),
    skyDeckNormal: sn,
    setBuild(worldHeight) {
      uBuild.value = worldHeight;
    },
    // 0 = folded at the centre line, 1 = stretched between the wings.
    setFabric(t, worldHeight) {
      uFabric.value = worldHeight;
      fabric.scale.x = Math.max(0.001, t);
    },
    setSketch(draw, opacity) {
      sketch.geometry.setDrawRange(0, Math.floor(draw * sketch.userData.count));
      sketch.material.opacity = opacity;
      sketch.visible = opacity > 0.001;
    },
    // The fabric becomes a slow colour-shifting light show at night.
    setNight(t, time) {
      const c = new THREE.Color().setHSL((time * 0.02) % 1, 0.65, 0.55);
      fabricMat.emissive.copy(c);
      fabricMat.emissiveIntensity = t * 0.9;
      deckMat.emissiveIntensity = 0.2 + t * 1.5;
      inner.emissiveIntensity = 0.4 + t * 0.8;
    },
  };
}

// The architect's lines: floor outlines and the sail curve, drawn on in order.
function createSketch(group, rows) {
  const pts = [];
  const seg = (a, b) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const curve = (arr) => arr.slice(1).forEach((p, i) => seg(arr[i], p));
  curve(rows.map((p) => p.spine));
  curve(rows.map((p) => p.left));
  curve(rows.map((p) => p.right));
  curve(rows.map((p) => fabricPoint(p, 0.5)));
  rows.forEach((p, j) => {
    if (j % 6) return;
    seg(p.spine, p.left);
    seg(p.spine, p.right);
    const arc = Array.from({ length: 13 }, (_, i) => fabricPoint(p, i / 12));
    curve(arc);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x24406e, transparent: true, opacity: 0 }));
  lines.userData.count = pts.length / 3;
  group.add(lines);
  return lines;
}
