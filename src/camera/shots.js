import * as THREE from 'three';
import { EYE_HEIGHT as E, SAIL, ISLAND } from '../config.js';
import { SUITE_ORIGIN } from '../interior/suite.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Shots a person could film: on the beach, on the causeway, inside, on the deck.
// `cut` marks a hard cut (elevator, crossing the bay), never a fly-through.
export function buildShots({ tower, causeway }) {
  const beach = 0.4 + E;
  const road = (t, dy = E) => causeway.curve.getPointAt(t).add(v(0, dy, 0));
  const deck = SAIL.deck + E;
  const S = (x, y, z) => SUITE_ORIGIN.clone().add(v(x, y, z));
  // Inside the glass sky-deck capsule, near its seaward end.
  const sky = tower.skyDeck.clone().addScaledVector(tower.skyDeckNormal, 9).add(v(0, -1.2, 0));
  const out = tower.skyDeck.clone().addScaledVector(tower.skyDeckNormal, 600).setY(150);
  const tc = ISLAND.centerZ;

  return [
    { p: 0.0, pos: v(-150, beach, 470), look: v(0, 30, -10) },
    { p: 0.07, pos: v(-90, beach, 462), look: v(0, 60, -10) },
    { p: 0.17, pos: v(-20, beach, 455), look: v(0, 120, -10) },
    { p: 0.3, pos: v(90, beach, 450), look: v(0, 150, -10) },
    { p: 0.38, pos: v(130, beach, 440), look: v(0, 120, 0) },
    { p: 0.39, pos: road(0.97), look: road(0.85, 4), cut: true },
    { p: 0.44, pos: road(0.55), look: road(0.3, 20) },
    { p: 0.48, pos: v(6, deck, 82), look: v(0, 60, 10) },
    { p: 0.49, pos: v(0, deck, 30), look: v(0, 14, -20), cut: true },
    { p: 0.53, pos: v(0, deck, 22), look: v(0, 60, -32) },
    { p: 0.57, pos: v(-3, deck, 16), look: v(0, 200, -42) },
    { p: 0.58, pos: S(7, E, 3), look: S(-10, 1.4, -1), cut: true },
    { p: 0.63, pos: S(-1.5, E, 1.5), look: S(-20, 1.2, 0) },
    { p: 0.67, pos: S(-6.5, E, -1), look: S(-40, -8, -5) },
    { p: 0.68, pos: S(6.6, 3.6 + E, 4), look: S(-15, 2.5, -2), cut: true },
    { p: 0.7, pos: S(5.6, 3.6 + E, 3.5), look: S(-15, 1.5, 0) },
    { p: 0.71, pos: sky, look: out, cut: true },
    { p: 0.75, pos: sky.clone().add(v(0, 0, 0.6)), look: out.clone().setY(90) },
    { p: 0.78, pos: sky.clone().add(v(0, 0, 1.2)), look: tower.helipad },
    { p: 0.79, pos: v(-150, deck, tc + 8), look: v(-120, 2, tc + 4), cut: true },
    { p: 0.84, pos: v(-120, deck, tc + 18), look: v(-100, 20, tc) },
    { p: 0.88, pos: v(-104, deck, tc + 26), look: v(0, 160, -40) },
    { p: 0.89, pos: v(-80, beach, 470), look: v(0, 120, -10), cut: true },
    { p: 1.0, pos: v(-25, beach, 458), look: v(0, 140, -10) },
  ];
}
