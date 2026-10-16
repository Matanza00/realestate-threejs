# Three.js + Graphify setup for Claude Code

## What to install (and what to skip)

Install the **5 bundles** only. Together they contain all 22 skills in the
`freshtechbro/claudedesignskills` marketplace. Installing the individual plugins
on top would load the same skills twice and waste context.

| Bundle | Skills |
|---|---|
| core-3d-animation | Three.js, GSAP ScrollTrigger, React Three Fiber, Motion, Babylon.js |
| extended-3d-scroll | A-Frame, Vanta/Zdog effects, PlayCanvas, PixiJS, Locomotive, Barba |
| animation-components | React Spring, Magic UI, AOS, Anime.js, Lottie |
| authoring-motion | Blender, Spline, Rive, Substance 3D |
| meta-skills | Web3D integration patterns, Modern web design |

Graphify is not a marketplace plugin. It is a Python CLI (`graphifyy` on PyPI)
that installs a `/graphify` skill plus hooks that make Claude query a code graph
instead of reading whole files.

## On your computer (once)

In a terminal:

```bash
claude plugin marketplace add freshtechbro/claudedesignskills
claude plugin install core-3d-animation@claude-design-skillstack
claude plugin install extended-3d-scroll@claude-design-skillstack
claude plugin install animation-components@claude-design-skillstack
claude plugin install authoring-motion@claude-design-skillstack
claude plugin install meta-skills@claude-design-skillstack

uv tool install graphifyy      # or: pipx install graphifyy
graphify install               # registers the /graphify skill for Claude Code
```

(Inside Claude Code you can type the same thing as `/plugin marketplace add ...`
and `/plugin install ...`.)

## In each Three.js project (once per project)

```bash
cd my-threejs-site
graphify claude install --project   # adds .claude/skills/graphify, CLAUDE.md rules, PreToolUse hooks
graphify hook install               # rebuilds the graph on every git commit
```

Then in Claude Code run `/graphify .` once to build `graphify-out/`.

To make cloud sessions and teammates get the design plugins automatically, add
this to the project's `.claude/settings.json` (merge with what
`graphify claude install --project` wrote there) and commit it:

```json
{
  "extraKnownMarketplaces": {
    "claude-design-skillstack": {
      "source": { "source": "github", "repo": "freshtechbro/claudedesignskills" }
    }
  },
  "enabledPlugins": {
    "core-3d-animation@claude-design-skillstack": true,
    "extended-3d-scroll@claude-design-skillstack": true,
    "animation-components@claude-design-skillstack": true,
    "authoring-motion@claude-design-skillstack": true,
    "meta-skills@claude-design-skillstack": true
  }
}
```

Add a `.graphifyignore` so heavy assets stay out of the graph:

```
node_modules/
dist/
build/
.next/
*.min.js
*.glb
*.gltf
*.hdr
*.exr
*.ktx2
```

## Token-saving rules worth adding to the project's CLAUDE.md

```markdown
## Token budget
- Use the installed design skills (threejs-webgl, react-three-fiber, gsap-scrolltrigger,
  web3d-integration-patterns, modern-web-design); load only the one the task needs.
- Never read node_modules/, dist/, minified files, or binary assets (.glb, .hdr, .ktx2, textures).
- Keep scenes split into small modules (scene, camera, lights, materials, objects, animation)
  so edits touch one file.
- Answer with diffs or the changed function, not whole files.
```

## Cloud sessions

Cloud containers start clean, so `graphify` must be installed in each session
(`python3 -m pip install graphifyy`). The cleanest way is the environment's
setup script in the claude.ai environment settings: add
`python3 -m pip install graphifyy`. If the CLI is missing, the Graphify hooks
fail open (no harm, just no savings).
