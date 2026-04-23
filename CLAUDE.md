# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cryptography onboarding training site for Stars-Labs, built with **Astro + Starlight**. Content covers blockchain cryptography (ECDSA, elliptic curves, RSA, BLS, Schnorr, ZKP, Merkle trees). Supports English (default) and Chinese Simplified (zh-hans) locales.

Deployed to GitHub Pages at `https://stars-labs.github.io/cryptograph-onboarding-trainning/`.

## Commands

- **Install**: `bun install`
- **Dev server**: `bun run dev` (or `bun run start`)
- **Build**: `bun run build`
- **Preview built site**: `bun run preview`

CI uses Bun. No test framework is configured.

## Architecture

### Content Layer

- **src/content/docs/**: All documentation. Starlight automatically uses this as the content collection.
  - **cryptography/**: Course chapters as `.md` and `.mdx` files
  - **project/**: Project reviews
  - **zh-hans/**: Chinese Simplified translations (mirrors root structure)
- `index.md` at root = landing page (maps to `/`)
- Sidebar ordering: use `sidebar:\n  order: N` in frontmatter
- Math: `$...$` inline and `$$...$$` block via remark-math + rehype-katex
- Mermaid: ` ```mermaid ` code blocks are converted by `plugins/remarkMermaid.js` to `<div class="mermaid">`, rendered client-side via mermaid.js CDN

### Interactive Demos

- **src/components/Interactive/**: React components for hands-on demos. Each is a `*Demo.js` file.
- **src/components/Interactive/index.js**: Barrel re-exports all demos.

**Pattern for adding a new interactive demo:**
1. Create `src/components/Interactive/FooDemo.js` with a `default` export
2. Add `export { default as FooDemo } from './FooDemo';` to `index.js`
3. Import in MDX: `import { FooDemo } from '@site/src/components/Interactive';`
4. Use as `<FooDemo client:only="react" />` — the `client:only` is required for Astro hydration
5. The `@site` alias maps to the project root (configured in `astro.config.mjs` Vite alias)

### Styling

- **src/styles/custom.css**: Starlight CSS custom properties for brand colors and mermaid diagram layout

## Key Configuration

- **astro.config.mjs**: Main config. Starlight integration, React integration, markdown plugins (math + mermaid), Vite `@site` alias.
- **plugins/remarkMermaid.js**: Converts ` ```mermaid ``` ` blocks to `<div class="mermaid">` for client-side rendering.
- Sidebar: configured directly in `astro.config.mjs` under `starlight({ sidebar: [...] })`
- i18n: Starlight `locales` with `root` (en) + `zh-hans`

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml` — builds with Bun, outputs to `dist/`, deploys to GitHub Pages via `actions/deploy-pages`.
