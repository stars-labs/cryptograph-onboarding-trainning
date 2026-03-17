# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cryptography onboarding training site for HecoInfo, built with Docusaurus 3.9. The content is in Chinese (zh-Hans locale) and covers cryptographic concepts relevant to blockchain (ECDSA, elliptic curves, RSA, BLS, Schnorr, ZKP, Merkle trees).

Deployed to GitHub Pages at `https://hecoinfo.github.io/cryptograph-onboarding-trainning/`.

## Commands

- **Install**: `bun install`
- **Dev server**: `bun run start`
- **Build**: `bun run build`
- **Serve built site**: `bun run serve`
- **Clear cache**: `bun run clear`

CI uses Bun (not yarn/npm despite the README).

## Architecture

- **docs/cryptography/**: Course content in `.md` and `.mdx` files. MDX files can use remark-math/rehype-katex for LaTeX equations and Mermaid diagrams.
- **src/components/Interactive/**: React components for interactive cryptography demos (SHA256, RSA, EllipticCurve, ECDSA, EdDSA, BLS, Schnorr, ZKProof, MerkleTree, ModularArithmetic, CryptoApps). These are imported into MDX docs.
- **src/pages/**: Standalone pages (homepage in `index.js`).
- **docusaurus.config.js**: Site config using ESM imports. Configures KaTeX stylesheets, Mermaid theme, and GitHub Pages deployment settings.
- **sidebars.js**: Sidebar navigation structure for docs.

## Key Configuration Details

- Math support: `remark-math` + `rehype-katex` plugins in docs config
- Mermaid diagrams enabled via `@docusaurus/theme-mermaid`
- `onBrokenLinks: 'throw'` — build fails on broken internal links
- `future.v4: true` — forward-compatibility flag for Docusaurus v4
- Node.js >= 20 required
