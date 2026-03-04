---
description: Compare implementation screenshot against Figma reference
arguments:
  - name: component
    description: Component name to compare
    required: true
---

# /compare — Visual Comparison

Compare a built component's rendered output against the Figma reference image.

## Steps

1. **Find the reference image** for the component:
   - Look up the component in `.treble/analysis.json`
   - Find which frame it belongs to (from `figmaNodes[].frameName`)
   - Reference image is at `.treble/figma/{frame-slug}/reference.png`
   - Section screenshots may be in `.treble/figma/{frame-slug}/sections/`

2. **Take a screenshot** of the running dev server:
   - The component should be running locally (e.g., `npm run dev`)
   - Use the browser automation tools to capture a screenshot

3. **Compare visually**:
   - Look at both images side by side
   - Check: layout, spacing, colors, typography, alignment, responsive behavior
   - Note any discrepancies

4. **Report findings**:
   - List what matches
   - List what differs
   - Suggest specific fixes for discrepancies

## Comparison Criteria

- **Layout**: Element positions, flex direction, grid structure
- **Spacing**: Margins, padding, gaps between elements
- **Colors**: Background, text, border colors match design tokens
- **Typography**: Font size, weight, line height, family
- **Border Radius**: Matches design token values
- **Shadows**: Correct shadow values applied
- **Content**: Placeholder content appropriate for the component type

## After comparison

If discrepancies found:
1. Fix the implementation
2. Re-compare
3. Maximum 2 fix attempts before moving on

If the component looks good:
1. Update `.treble/build-state.json` — mark as `"implemented"`
2. Move to the next component in build order
