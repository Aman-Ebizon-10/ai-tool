# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # run ESLint
```

No test framework is configured yet.

## Architecture

Next.js 16.2.6 app using the **App Router** (not Pages Router). All routes live under `app/`.

**Key conventions:**
- `app/layout.tsx` — root layout; wraps every page with fonts and global styles
- `app/page.tsx` — home route (`/`)
- `app/globals.css` — global styles; uses `@import "tailwindcss"` (Tailwind v4 syntax, not the old `@tailwind` directives)
- API routes go in `app/.../route.ts` files, not a `pages/api/` directory

**Path alias:** `@/*` resolves to the project root (e.g. `@/app/components/Foo`).

**Tailwind v4:** configured via `postcss.config.mjs` using the `@tailwindcss/postcss` plugin. There is no `tailwind.config.ts` — theme customization is done with CSS variables in `globals.css`.

**Important:** This project uses Next.js 16, which has breaking changes from earlier versions. Before writing routing, data-fetching, or caching code, read the relevant guide in `node_modules/next/dist/docs/`.
