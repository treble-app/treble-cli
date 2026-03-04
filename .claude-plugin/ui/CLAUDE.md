# Treble Plugin v0.2.0

Figma-to-code build assistant. Syncs Figma designs to disk, Claude analyzes them and builds components.

## Commands

| Command | What it does |
|---------|-------------|
| `/treble:plan` | Analyze Figma frames → write analysis.json + build-state.json |
| `/treble:dev` | Build loop: code → visual review → architectural review → iterate |
| `/treble:tree` | Show the Figma layer outline for a frame |
| `/treble:show` | Render a specific Figma node as a screenshot |
| `/treble:compare` | Compare implementation against Figma reference |

## CLI Tool

The `treble` CLI is a Figma data tool. It syncs designs to disk so you can read them.

```bash
treble login --pat                       # Store Figma token
treble init --figma "URL_OR_KEY"         # Scaffold .treble/ in project
treble sync                              # Pull Figma → .treble/figma/
treble sync --frame "Contact"            # Sync one frame
treble tree "Contact" --depth 2          # Layer outline
treble tree "Contact" --verbose          # With visual properties
treble show "NavBar" --frame "Contact"   # Render a specific node
```

## Disk Structure

```
.treble/
├── config.toml              # Figma file key + flavor
├── analysis.json            # YOUR analysis output (components, design system, build order)
├── build-state.json         # YOUR build progress (status per component)
└── figma/                   # Synced Figma data (from `treble sync`)
    ├── manifest.json        # Frame inventory (names, IDs, slugs)
    └── {frame-slug}/        # One dir per frame
        ├── reference.png    # Full frame screenshot
        ├── nodes.json       # Complete node tree with all visual properties
        ├── sections/        # Section-level screenshots
        └── snapshots/       # On-demand screenshots (from `treble show`)
```

## Workflow

1. `treble sync` — Pull Figma data to disk
2. `/treble:plan` — You analyze the screenshots + node trees, write analysis.json
3. `/treble:dev` — You implement components in build order, reviewing each one

## How to explore a design

1. **See what frames exist:** `cat .treble/figma/manifest.json`
2. **See the layer outline:** `treble tree "Contact" --depth 2`
3. **Look at a section:** Read `.treble/figma/contact/sections/navbar.png`
4. **See a specific node:** `treble show "NavBar" --frame "Contact"`
5. **Get exact measurements:** `treble tree "Contact" --verbose`
6. **Read raw node data:** Read `.treble/figma/contact/nodes.json`

## Two Files, Two Concerns

**analysis.json** — What to build. Written by `/treble:plan`. Components, design system, build order, Figma node references.

**build-state.json** — Build progress. Written by `/treble:dev`. Status, file paths, review results per component.

## Version Control

All `.treble/` changes should be committed to git:
- `git diff .treble/analysis.json` — see what changed in the analysis
- `git log .treble/build-state.json` — track build progress over time
