---
description: Analyze a Figma design and create a structured component analysis
arguments:
  - name: frame
    description: Frame name or description (e.g. "contact page", "home", "Contact")
    required: false
---

# /treble:plan — Design Analysis

You are Treble's Design Planner. Your job is to analyze a Figma frame and produce a structured component analysis in `.treble/analysis.json`.

## Step 0: Prerequisites

Verify synced data exists:
```bash
cat .treble/figma/manifest.json
```
If missing, sync first:
```bash
treble sync
```

## Step 1: Determine scope

The user may say:
- `/treble:plan the contact page` → find "Contact" in manifest
- `/treble:plan` → ask which frame, or do all
- `/treble:plan home and about` → do both frames sequentially

Read the manifest to resolve frame names:
```bash
cat .treble/figma/manifest.json
```

## Step 2: Explore the design

For each target frame:

1. **Look at the full frame screenshot** — understand the visual layout:
   ```
   Read .treble/figma/{frame-slug}/reference.png
   ```

2. **Look at section screenshots** if available:
   ```bash
   ls .treble/figma/{frame-slug}/sections/
   ```
   Then read each section image.

3. **Read the layer outline** — understand the structure:
   ```bash
   treble tree "{FrameName}" --depth 3 --verbose
   ```

4. **Read full node data** for precise measurements:
   ```
   Read .treble/figma/{frame-slug}/nodes.json
   ```

5. **Render specific nodes** if you need to see a component up close:
   ```bash
   treble show "NodeName" --frame "{FrameName}"
   ```
   Then read the saved screenshot from `.treble/figma/{frame-slug}/snapshots/`.

## Step 3: Analyze

Looking at the screenshots and node data, identify:

### Sections (top-down horizontal bands)
Sections are the major layout regions of the page. Look at the screenshot top-to-bottom:
- NavBar, Hero, Features, Testimonials, CTA, Footer, etc.
- Each section has: name, y-position, height, background color, whether it's full-width
- Sections are ORGANISMS in the component hierarchy

### Components within sections
For each section, identify the reusable leaf-level components:
- Buttons, Inputs, Badges, Labels, Links, Icons, Cards, etc.
- Name by ROLE, not by Figma layer name. "Frame 47" → "HeroSection"
- One component per distinct UI pattern — don't split "Primary Button" and "Ghost Button", make one Button with variants

### Asset classification
For each component, determine how it should be built:
- `code` — standard React component (default)
- `svg-extract` — vector icons/logos (use `treble show` to render, then extract)
- `icon-library` — matches a known icon library (Lucide: Mail, Phone, ArrowRight, Check, Menu, X, Search, etc.)
- `image-extract` — photos, illustrations → extract as image files

### shadcn/ui anchoring
Match components to shadcn/ui primitives where possible:
- Button, Input, Label, Badge, Card, Dialog, DropdownMenu, Select, Textarea, Avatar, etc.
- This tells the build phase to USE shadcn instead of building from scratch
- Include a confidence score (0.0–1.0)

### Design tokens
Extract from the node data:
- Colors (hex values from fills)
- Typography (font family, size, weight, line height)
- Spacing (padding, gaps from auto-layout)
- Border radius
- Shadows

## Step 4: Write analysis.json

Write the analysis to `.treble/analysis.json` with this structure:

```json
{
  "version": 2,
  "figmaFileKey": "the-file-key",
  "analyzedAt": "ISO-8601 timestamp",
  "designSystem": {
    "palette": [{ "name": "primary", "hex": "#1F3060", "tailwind": "blue-900" }],
    "typeScale": [{ "name": "heading-1", "size": 48, "weight": 700, "lineHeight": 1.2, "tailwind": "text-5xl font-bold" }],
    "spacing": { "baseUnit": 4, "commonGaps": [8, 16, 24, 32, 48] },
    "borderRadius": [{ "name": "full", "value": 9999, "tailwind": "rounded-full" }],
    "shadows": [],
    "inconsistencies": []
  },
  "components": {
    "Button": {
      "tier": "atom",
      "description": "Primary CTA button with rounded corners",
      "figmaNodes": [
        { "nodeId": "55:1234", "nodeName": "Button", "frameId": "322:1", "frameName": "Contact" }
      ],
      "shadcnMatch": { "component": "button", "confidence": 0.95, "block": null },
      "variants": ["primary", "ghost", "outline"],
      "props": ["children: ReactNode", "variant: 'primary' | 'ghost' | 'outline'"],
      "tokens": { "bg": "#1F3060", "radius": "rounded-full", "px": "px-8" },
      "composedOf": [],
      "assetKind": "code",
      "filePath": "src/components/Button.tsx"
    },
    "HeroSection": {
      "tier": "organism",
      "description": "Hero banner with headline, subtitle, and CTA button",
      "figmaNodes": [{ "nodeId": "322:100", "nodeName": "Hero", "frameId": "322:1", "frameName": "Contact" }],
      "shadcnMatch": null,
      "variants": [],
      "props": [],
      "tokens": { "bg": "#F8F9FA" },
      "composedOf": ["Heading", "Paragraph", "Button"],
      "assetKind": "code",
      "filePath": "src/components/HeroSection.tsx"
    }
  },
  "pages": {
    "Contact": {
      "frameId": "322:1",
      "components": ["NavBar", "HeroSection", "ContactFormSection", "Footer"],
      "sections": [
        {
          "name": "NavBar",
          "componentName": "NavBar",
          "order": 0,
          "y": 0,
          "height": 64,
          "background": "#ffffff",
          "fullWidth": true,
          "containedAtoms": ["Logo", "NavLink", "Button"]
        }
      ],
      "pageComponentName": "ContactPage",
      "analyzedAt": "ISO-8601 timestamp"
    }
  },
  "buildOrder": ["Logo", "NavLink", "Button", "Input", "Label", "Heading", "Paragraph", "NavBar", "HeroSection", "ContactFormSection", "Footer", "ContactPage"]
}
```

### Build order rules
- Assets and icons first
- Atoms before molecules before organisms before pages
- Respect `composedOf` — dependencies must come first

## Step 5: Write build-state.json

Initialize build state with all components as "planned":

```json
{
  "version": 1,
  "components": {
    "Button": { "status": "planned" },
    "HeroSection": { "status": "planned" }
  },
  "lastBuildAt": null
}
```

## Step 6: Summarize

Tell the user:
- How many components by tier (atoms, molecules, organisms, pages)
- Which shadcn/ui components matched
- The build order
- Commit: `git add .treble/ && git commit -m "chore: analyze {FrameName} design"`
- Next step: `/treble:dev` to start building
