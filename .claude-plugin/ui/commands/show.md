---
description: Render a specific Figma node as a screenshot
arguments:
  - name: node
    description: Node name or Figma ID (e.g. "NavBar", "55:1234")
    required: true
  - name: frame
    description: Frame to search in (optional if using node ID)
    required: false
---

# /show — Render a Figma Node

Fetch a rendered screenshot of any Figma node and save it to disk. Use this to "look at" a specific layer, section, or component.

## Usage

```bash
# By name (searches synced nodes.json files)
treble show "NavBar" --frame "Contact"

# By Figma node ID (no frame needed)
treble show "55:1234"

# Higher resolution
treble show "HeroSection" --frame "Home" --scale 3
```

## Where screenshots are saved

- With `--frame`: `.treble/figma/{frame-slug}/snapshots/{node-slug}.png`
- Without frame: `.treble/figma/snapshots/{node-slug}.png`

## When to use

- **During build**: look at a specific section or component before implementing it
- **Visual comparison**: see exactly what a node looks like in Figma
- **Asset extraction**: render icons, logos, or illustrations that need to be exported

## Name resolution

The tool searches `nodes.json` files to find matching node names:
1. Exact name match (case sensitive)
2. Case-insensitive substring match
3. If no match found, lists available top-level layer names

For precise targeting, use the Figma node ID (visible in `treble tree` output or `nodes.json`).

## Note

This calls the Figma images API live — it requires network access and a valid Figma token. The synced `reference.png` and `sections/*.png` are available offline.
