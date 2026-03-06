---
description: Analyze a Figma design and create a structured component analysis
arguments:
  - name: frame
    description: Frame name or description (e.g. "contact page", "home", "Contact")
    required: false
---

# /treble:plan — Design Analysis

You are Treble's Design Planner. Your job is to analyze a Figma frame and produce a structured component analysis in `.treble/analysis.json`.

## CRITICAL RULES

1. **ONLY use the `treble` CLI and local files.** Do NOT call the Figma API directly, do NOT use any Figma MCP server, do NOT use any Figma REST endpoints. All Figma data has already been synced to disk by `treble sync`. Work exclusively with `.treble/figma/` files and the `treble tree` / `treble show` commands.

2. **Every nodeId you write MUST come from the synced data.** Search `nodes.json` or use `treble tree --json` output. NEVER invent or guess a node ID. If you can't find the right node, omit the `figmaNodes` entry and note it.

3. **Work section by section.** Do NOT try to read an entire `nodes.json` file at once for large frames. Use the slicing workflow described below.

4. **Zoom into every visual group.** The full-page reference.png is too small to see details. For every group of elements that visually belong together (a nav bar, a hero section, a card row, a footer), use `treble show` to render it and `Read` the PNG before analyzing it. Identify groups from the tree structure (FRAME/GROUP children) or by clustering nearby nodes by y-position. The tree tells you WHAT is there; the render tells you HOW it looks. Do not write implementation notes from tree data alone.

5. **Every component MUST have `implementationNotes`** — detailed, specific notes on how to reproduce the visual look in CSS/Tailwind. Vague notes like "hero section with heading and button" are useless. Good notes describe exact colors, sizes, layout technique, background treatment, typography, spacing, and visual effects. These notes are the primary input the build agent uses to write code.

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

Read the manifest to resolve frame names to slugs:
```bash
cat .treble/figma/manifest.json
```

## Step 2: Get the big picture

For each target frame:

1. **Look at the full frame screenshot** — understand the overall visual layout:
   ```
   Read .treble/figma/{frame-slug}/reference.png
   ```

2. **Get the structural overview** — see all top-level sections with IDs:
   ```bash
   treble tree "{FrameName}" --depth 1
   ```
   This shows every depth-1 child with its **node ID**, type, name, size, and child count. These IDs are how you slice.

3. **Look at section screenshots** if available:
   ```bash
   ls .treble/figma/{frame-slug}/sections/
   ```
   Then read each section image for visual context.

## Step 2.5: Zoom into every visual group

The full-page reference.png shows the overall layout but NOT the details you need to write implementation notes. You must zoom into each visual group.

**For EVERY frame:**

1. `treble tree "{FrameName}" --depth 1` — identify all visual groups (sections, rows, panels)
2. **For each group** — things that visually belong together (a nav, a hero, a card grid, a footer):
   a. `treble show "<nodeId>" --frame "{FrameName}" --json` — render it as a close-up. The `--json` flag returns `{"nodeId", "nodeName", "path", "size", "scale"}` so you can capture the saved path.
   b. `Read` the saved PNG — now you can actually see button shapes, icon details, typography, spacing, gradients, shadows
   c. **If the section looks complex** (lots of small elements, dense UI, multiple card types, forms with many fields) — zoom in further. Use `treble tree --root "<groupId>" --depth 1` to find sub-groups, then `treble show` each one. Keep zooming until you can clearly see every element.
   d. `treble tree "{FrameName}" --root "<nodeId>" --verbose` — get fills, fonts, padding, radius
   e. `treble tree "{FrameName}" --root "<nodeId>" --json` — get machine-readable measurements
   f. Write your implementation notes for this group BEFORE moving to the next
   g. **Record every screenshot path** — save them in the component's `referenceImages` array (see schema below). These are how the build agent and comparison tools find the visual references later.

**How to identify groups:**
- **Structured Figma files**: depth-1 children are usually FRAME or GROUP nodes that represent visual sections. Use them directly.
- **Messy/flat Figma files**: depth-1 children are loose primitives. Group them by y-position — nodes within ~50px vertical gap belong together. Name them by what they ARE visually (hero, features, testimonials), not by their Figma layer name.

**NEVER read the full nodes.json for a 300+ node frame.** It will flood your context and degrade analysis quality. Use the slice tools above instead.

## Step 2.6: Handling messy/unstructured Figma files

If the depth-1 children are mostly loose primitives (RECTANGLE, TEXT, VECTOR, unnamed GROUPs) rather than organized FRAME groups:

1. **The reference.png screenshot is your PRIMARY source of truth.** Look at it first and identify the visual sections (hero, nav, features, footer, etc.)
2. **Group depth-1 nodes into virtual sections by y-position.** Sort by y coordinate from the tree output. Nodes within a ~50px vertical gap belong to the same visual section.
3. **Name sections by their ROLE, not their Figma layer name.** "Frame 47" → "HeroSection". "Rectangle 2388778" → irrelevant, look at what it IS visually.
4. **Use `treble show` to verify.** Render individual nodes to confirm what they look like: `treble show "55:1234" --frame "{FrameName}"`
5. Many loose nodes may be background elements, spacers, or design artifacts. If a node is a single RECTANGLE with no children and no text, it's likely a background — note it but don't create a component for it.

## Step 3: Analyze section by section

For each visual section you identified, gather context using the slice tools.

### How to see a specific node

This is a 3-step process. Here's a complete walkthrough with real output.

**1. Get the node ID from the tree overview:**

```bash
treble tree "Homepage" --depth 1
```

Example output:
```
Frame: "Homepage" (254:2234) — 370 nodes
  Size: 1440x826

FRAME Homepage [1440x7228] 254:1863 (159 children)
  RECT Rectangle 2386630 [1440x800] 250:1019
  RECT Rectangle 2388772 [853x800] 254:2232
  GRP Group 1171277834 [115x40] 254:1876 (2 children)
  TEXT About [52x26] 254:1871 "About"
  TEXT Careers [65x26] 254:1872 "Careers"
  ...
```

Each line shows: `TYPE Name [WIDTHxHEIGHT] NODE_ID`. The node ID (e.g. `254:1876`) is what you use for slicing.

**2. Render the node as a screenshot** (calls Figma API, saves PNG to disk):

```bash
treble show "254:1876" --frame "Homepage" --json
```

Output:
```json
{"nodeId":"254:1876","nodeName":"Group 1171277834","path":".treble/figma/homepage/snapshots/group-1171277834.png","size":4832,"scale":2}
```

The `path` field is relative to the project root. Save this path in the component's `referenceImages` array.

**3. Read the saved screenshot** (now you can see it):

```
Read .treble/figma/homepage/snapshots/group-1171277834.png
```

The file is at `.treble/figma/{frame-slug}/snapshots/{slugified-node-name}.png`. The exact path is printed by `treble show`.

**4. Get the structural details** (colors, fonts, sizes):

```bash
treble tree "Homepage" --root "254:1876" --verbose
```

Example output:
```
Frame: "Homepage" (254:2234) — 3 nodes
  Root: "254:1876"

GRP Group 1171277834 [115x40] 254:1876 (2 children)
  radius: 8
  RECT Rectangle 71 [115x40] 254:1877
    fill: #cdb07a
    radius: 8
  TEXT Solutions [93x21] 254:1878 "Solutions"
    font: Aeonik TRIAL 15.37px w400
    fill: #25282a
```

Or for machine-readable JSON:

```bash
treble tree "Homepage" --root "254:1876" --json
```

```json
{
  "frame": "Homepage",
  "frameId": "254:2234",
  "nodeCount": 3,
  "nodes": [
    {
      "id": "254:1876", "name": "Group 1171277834", "type": "GROUP",
      "depth": 0, "width": 115, "height": 40, "x": -3308, "y": 784,
      "children": 2, "radius": 8
    },
    {
      "id": "254:1877", "name": "Rectangle 71", "type": "RECTANGLE",
      "depth": 1, "width": 115, "height": 40, "fills": ["#cdb07a"], "radius": 8
    },
    {
      "id": "254:1878", "name": "Solutions", "type": "TEXT",
      "depth": 1, "width": 93, "height": 21, "text": "Solutions",
      "fills": ["#25282a"], "font": { "family": "Aeonik TRIAL", "size": 15.37, "weight": 400 }
    }
  ]
}
```

### Full section-by-section workflow

```bash
# 1. Get all section IDs
treble tree "Homepage" --depth 1

# 2. Pick a section by its node ID and render it
treble show "254:1876" --frame "Homepage" --json
# → {"nodeId":"254:1876","nodeName":"Group 1171277834","path":".treble/figma/homepage/snapshots/group-1171277834.png","size":4832,"scale":2}

# 3. Look at the rendered screenshot (path from step 2 output)
Read .treble/figma/homepage/snapshots/group-1171277834.png

# 4. If it looks complex, zoom into sub-groups
treble tree "Homepage" --root "254:1876" --depth 1
# → find child group IDs, then treble show each one

# 5. Get the structural details as JSON
treble tree "Homepage" --root "254:1876" --json
```

Repeat for each section. You now have both the visual (screenshot) and structural (JSON) data for one piece of the page without loading the entire node tree.

For each section you zoomed into, do TWO things: identify components, and write visual reproduction notes.

### 3a. Identify components (reusable UI patterns)
- Buttons, Inputs, Badges, Labels, Links, Icons, Cards, etc.
- Name by ROLE, not by Figma layer name
- One component per distinct UI pattern — "Primary Button" and "Ghost Button" = one Button with variants
- Note which Figma node ID corresponds to each component

**Asset classification** — how each component should be built:
- `code` — standard React component (default)
- `svg-extract` — vector icons/logos (use `treble show` to render, then extract)
- `icon-library` — matches a known icon library (Lucide: Mail, Phone, ArrowRight, Check, Menu, X, Search, etc.)
- `image-extract` — photos, illustrations → extract as image files

**shadcn/ui anchoring** — match to primitives where possible:
- Button, Input, Label, Badge, Card, Dialog, DropdownMenu, Select, Textarea, Avatar, etc.
- This tells the build phase to USE shadcn instead of building from scratch
- Include a confidence score (0.0–1.0)

**Design tokens** — extract from `--verbose` or `--json`:
- Colors (hex values from fills — focus on repeated colors, not one-offs)
- Typography (font family, size, weight, line height)
- Spacing (padding, gaps from auto-layout)
- Border radius, shadows

### 3b. Visual reproduction notes (CRITICAL)

This is the most important part of the analysis. For every component and every section, you must write **implementation notes** that describe HOW to reproduce the visual look in code. These notes are what the build agent will use to actually write correct CSS/Tailwind.

**What to capture for each component:**

- **Layout technique**: flexbox row vs column, grid, absolute positioning, sticky, etc.
- **Background treatment**: solid color, gradient (direction + stops), image with overlay, blur/backdrop-filter
- **Typography details**: exact font, size, weight, letter-spacing, line-height, text color, truncation behavior
- **Shape and borders**: border-radius (pill vs rounded-md vs sharp), border width/color/style, outline vs border
- **Spacing**: internal padding, gap between children, margin from neighbors
- **Visual effects**: shadows (box-shadow values), opacity, hover states (if implied by design), transitions
- **Icon handling**: which icon library matches, size relative to text, stroke vs fill
- **Image handling**: aspect ratio, object-fit behavior, rounded corners, overlay treatment
- **Responsive hints**: does this look like it stacks on mobile? Full-width or max-width container?

**Example of GOOD reproduction notes:**

```
"implementationNotes": "Dark hero section. Full-width with 800px height. Background is a photo
(image-extract) with a linear-gradient overlay from rgba(0,0,0,0.7) left to transparent right.
Heading is 56px Aeonik Bold, white, max-width ~600px, left-aligned. Subtext is 18px weight 400,
white/70% opacity, 24px below heading. CTA button is pill-shaped (rounded-full), gold background
(#CDB07A), dark text (#25282A), 15px font, 40px height, with a right-arrow icon (Lucide ArrowRight).
Layout is flex-col items-start justify-center with ~80px left padding. The entire section has no
visible border or shadow."
```

**Example of BAD notes (too vague — useless to the build agent):**

```
"implementationNotes": "Hero section with heading and button"
```

The difference between a pixel-perfect build and a generic-looking build is entirely in these notes. Take the time to describe what you see.

## Step 4: Write analysis.json

Write the analysis to `.treble/analysis.json` with this structure:

```json
{
  "version": 2,
  "figmaFileKey": "from-.treble/config.toml",
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
      "filePath": "src/components/Button.tsx",
      "referenceImages": [".treble/figma/contact/snapshots/button.png"],
      "implementationNotes": "Pill-shaped button (rounded-full). Primary: bg #CDB07A, text #25282A, 15px Aeonik w400, height 40px, px-6. Ghost: transparent bg, white text, 1px white/30 border. Both have subtle hover brightness increase. Right-arrow Lucide icon when used as CTA (ArrowRight, 16px, ml-2)."
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
      "filePath": "src/components/HeroSection.tsx",
      "referenceImages": [
        ".treble/figma/contact/snapshots/hero.png",
        ".treble/figma/contact/snapshots/hero-cta-button.png"
      ],
      "implementationNotes": "Full-width section, 800px height. Background: photo (image-extract 'hero-bg.jpg') with linear-gradient overlay from rgba(0,0,0,0.7) on left to transparent on right (bg-gradient-to-r). Content is flex-col items-start justify-center, pl-20, max-w-[600px]. Heading: 56px Aeonik Bold, white, leading-tight, tracking-tight. Subtitle: 18px w400, white/70 opacity, mt-6. CTA Button (primary variant) mt-8. No border, no shadow on section itself."
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
          "containedAtoms": ["Logo", "NavLink", "Button"],
          "referenceImages": [".treble/figma/contact/snapshots/navbar.png"],
          "implementationNotes": "Sticky top nav, white bg, subtle bottom border (1px #E5E7EB). Flex row justify-between items-center, max-w-7xl mx-auto, h-16, px-6. Logo left, nav links center (flex gap-8, 15px Aeonik w400 text-gray-700 hover:text-black), CTA button right (primary variant, small size)."
        }
      ],
      "pageComponentName": "ContactPage",
      "analyzedAt": "ISO-8601 timestamp"
    }
  },
  "buildOrder": ["Logo", "NavLink", "Button", "Input", "Label", "Heading", "Paragraph", "NavBar", "HeroSection", "ContactFormSection", "Footer", "ContactPage"]
}
```

### Validating figmaNode references

Every `nodeId` in your analysis.json MUST be verified:
1. Get node IDs from `treble tree --json` or `treble tree --root` output
2. If multiple nodes share the same name, use position (x, y, width, height) to disambiguate
3. The `frameId` is the depth-0 node's ID (shown in `treble tree` header output)
4. NEVER invent a nodeId — if you can't find a match, set `figmaNodes: []` and add a note in the description

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
