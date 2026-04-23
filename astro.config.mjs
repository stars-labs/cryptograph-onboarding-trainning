import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkMermaid } from './plugins/remarkMermaid.js';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  site: 'https://stars-labs.github.io',
  base: '/cryptograph-onboarding-trainning',
  integrations: [
    starlight({
      title: 'Cryptography Training',
      description: 'Understanding ECDSA and Blockchain Signatures from Scratch',
      favicon: '/img/favicon.ico',
      logo: {
        src: './public/img/logo.svg',
        replacesTitle: false,
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/stars-labs/cryptograph-onboarding-trainning',
        },
      ],
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        'zh-hans': {
          label: '中文（简体）',
          lang: 'zh-Hans',
        },
      },
      sidebar: [
        { label: 'Introduction', link: '/' },
        {
          label: 'Cryptography',
          autogenerate: { directory: 'cryptography' },
        },
        {
          label: 'Projects',
          autogenerate: { directory: 'project' },
        },
      ],
      customCss: [
        './src/styles/custom.css',
        'katex/dist/katex.min.css',
      ],
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: `
            import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
            const init = () => {
              const dark = document.documentElement.dataset.theme === 'dark';
              mermaid.initialize({ startOnLoad: true, theme: dark ? 'dark' : 'default' });
            };
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', init);
            } else {
              init();
            }
            document.addEventListener('astro:after-swap', init);
          `,
        },
      ],
    }),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
  },
  vite: {
    resolve: {
      alias: {
        '@site': resolve(__dirname, '.'),
      },
    },
  },
});
