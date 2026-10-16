// Patches a standard material so fragments above a rising height are discarded,
// with a thin warm edge where the "pour" is happening.
export function applyPour(material, heightUniform, edgeColor = '0.9, 0.55, 0.25') {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHeight = heightUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPourWorld;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvPourWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uHeight;
        varying vec3 vPourWorld;
        float pourNoise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        float edge = uHeight + (pourNoise(floor(vPourWorld.xz * 2.0)) - 0.5) * 0.35;
        if (vPourWorld.y > edge) discard;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float rim = 1.0 - smoothstep(0.0, 0.25, edge - vPourWorld.y);
        totalEmissiveRadiance += vec3(${edgeColor}) * rim;`,
      );
  };
  return material;
}
