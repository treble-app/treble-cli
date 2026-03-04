---
description: Show the Figma layer tree for a frame
arguments:
  - name: frame
    description: Frame name (e.g. "Contact", "Home")
    required: true
---

# /tree — Figma Layer Outline

Show the layer hierarchy for a synced Figma frame. Use this to understand what's in a frame before planning or building.

## Usage

```bash
# Show full tree
treble tree "Contact"

# Limit depth (show only top 2 levels)
treble tree "Contact" --depth 2

# Show with visual properties (fills, fonts, layout, radius)
treble tree "Contact" --verbose

# Both
treble tree "Contact" --depth 3 --verbose
```

## What it shows

For each layer:
- **Type badge**: FRAME, TEXT, RECT, VEC, COMP (component), INST (instance), GRP (group)
- **Name**: the Figma layer name
- **Size**: width x height in pixels
- **Auto-layout**: direction (HORIZONTAL/VERTICAL) if present
- **Text content**: actual text strings for TEXT nodes
- **Child count**: how many children the node has

With `--verbose`:
- Fill colors (hex)
- Font family, size, weight
- Layout padding and gap
- Corner radius

## When to use

- **Before `/plan`**: see what layers exist so you know what frame to analyze
- **Before `/build`**: understand the structure of a section you're about to implement
- **Debugging**: check if the synced data matches what you expect from Figma

## Resolving frame names

If you're unsure of the exact frame name, read the manifest:
```bash
cat .treble/figma/manifest.json
```
This lists all synced frames with their names and slugs.
