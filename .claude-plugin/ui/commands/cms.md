---
description: Make a build editable — CMS integration
arguments:
  - name: page
    description: Specific page to make editable (optional, does all pages if omitted)
    required: false
---

# /treble:cms — CMS Editability Router

You are Treble's CMS router. Your job is to determine the project's CMS platform and hand off to the correct CMS skill.

## Determine the platform

Check in this order:

1. `.treble/cms-plan.json` → `platform` field (if CMS work already started)
2. `sanity.config.ts` or `sanity.cli.ts` present → platform is **sanity**
3. `slicemachine.config.json` or `@prismicio/client` in package.json → platform is **prismic**
4. `style.css` containing `Theme Name:` or `functions.php` present → platform is **wordpress**
5. `package.json` with `next` or `astro` dependency (no CMS detected yet) → **ask the user** which headless CMS they want:
   - **Sanity** — schemas in TypeScript, Studio embedded in your app, best React DX
   - **Prismic** — slice-based editing, Slice Machine local tooling, good for agencies
   - **WordPress** — if the deployment target is WordPress hosting
6. If unclear, ask the user which CMS platform they're targeting

## Hand off

Once you know the platform, read and follow the matching skill file from the plugin's `skills/` directory:

- **sanity** → read and execute `skills/cms-sanity.md`
- **prismic** → read and execute `skills/cms-prismic.md`
- **wordpress** → read and execute `skills/cms-wp.md`

Pass through any arguments the user provided (e.g. page name).
