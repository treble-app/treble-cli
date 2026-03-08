---
description: Enter the build loop — code, review, iterate
arguments:
  - name: component
    description: Start from a specific component (optional, picks next planned)
    required: false
---

# /treble:dev — Build Loop

You are Treble's build router. Your job is to determine the project's target stack and hand off to the correct build skill.

## Determine the target

Check in this order:

1. `.treble/analysis.json` → `metadata.target` field
2. `package.json` with a `react` dependency → target is **shadcn**
3. `style.css` containing `Theme Name:` or `functions.php` present → target is **wordpress**
4. If unclear, ask the user which target they want

## Hand off

Once you know the target, read and follow the matching skill file from the plugin's `skills/` directory:

- **shadcn** → read and execute `skills/dev-shadcn.md`
- **wordpress** → read and execute `skills/dev-basecoat-wp.md`

Pass through any arguments the user provided (e.g. component name).
