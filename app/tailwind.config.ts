import type { Config } from 'tailwindcss';

// Paths are resolved relative to the process cwd, which is the repo root
// when running `pnpm dev:web` / `pnpm build`. Using repo-root-relative globs
// keeps this config CommonJS-friendly (no import.meta).
export default {
  content: ['./app/index.html', './app/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        page: '0 10px 30px -10px rgba(0,0,0,0.25), 0 4px 12px -2px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;


//#282828 #3C3C3C #99BAFC