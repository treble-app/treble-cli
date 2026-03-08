---
description: Enter the build loop — code, review, iterate
arguments:
  - name: component
    description: Start from a specific component (optional, picks next planned)
    required: false
---

# /treble:dev — Build Loop

You are Treble's build router. Your job is to set up a solid project foundation, determine the target stack, and hand off to the correct build skill.

## Step 0: Project Setup (FIRST PRIORITY)

Before writing any components, ensure the project is a well-organized, **runnable** repository. If `package.json` already exists and the dev server starts, skip to "Determine the target".

### 0a. Scaffold or verify the project

If starting fresh (no `package.json`):

1. **Pick the right scaffold** based on the analysis target:
   - React SPA → `npm create vite@latest . -- --template react-ts`
   - Next.js → `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
   - WordPress theme → existing theme root is fine, skip scaffold

2. **Install core dependencies:**
   ```bash
   # shadcn target
   npx shadcn@latest init    # sets up Tailwind, cn(), components.json
   ```

3. **Verify it runs** — `npm run dev` must start without errors. Fix any issues before moving on.

If `package.json` exists, verify: `npm install && npm run dev` works. If it doesn't, fix it first.

### 0b. Project structure

Ensure these directories exist and are organized:

```
src/
├── components/       # atoms, organisms (shadcn target)
│   └── ui/           # shadcn primitives (auto-created by shadcn init)
├── pages/            # page-level compositions
├── lib/              # utilities, helpers
└── assets/           # static assets
public/
├── images/           # extracted Figma images go here
└── fonts/            # local font files (if any)
```

### 0c. Testing setup (if appropriate)

Add a basic test runner. Skip for simple landing pages — add for apps with logic, forms, or interactivity.

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:
```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

Add `"test": "vitest"` to `package.json` scripts. Run `npm test` to verify.

### 0d. Database / backend services (if needed)

If the project needs a database (CMS, auth, etc.), use Docker so the repo is self-contained:

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Add to `package.json` scripts: `"db:up": "docker compose up -d"`, `"db:down": "docker compose down"`.

For simpler needs (Payload CMS, small apps), prefer **SQLite** — no Docker required.

### 0e. Git hygiene

```bash
git init  # if not already a repo
```

Ensure `.gitignore` covers: `node_modules/`, `dist/`, `.env.local`, `.treble-tmp/`, `.next/` (Next.js).

**Commit the scaffold:** `git add -A && git commit -m "chore: initial project setup"`

This is your clean baseline. Every component build after this gets its own commit.

---

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
