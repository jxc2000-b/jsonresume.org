# Creating a Theme

A theme is just a package that exports a `render(resume)` function which returns an HTML string. The build pipeline feeds that HTML to headless Chromium, which prints it to PDF.

That's the entire contract:

```js
export function render(resume) {
  return '<!doctype html>...';
}
```

You pick whatever tool you want to produce that string — plain template literals, Handlebars, EJS, React SSR, etc. As long as the signature is `(resume) => htmlString`, it works.

## Folder layout

All custom themes live in `packages/themes/`:

```
packages/themes/
└── jsonresume-theme-<name>/
    ├── package.json
    └── index.js
```

The folder name should match the npm-style package name. Convention: prefix with `jsonresume-theme-`.

## Step-by-step

### 1. Scaffold the folder

```bash
mkdir -p packages/themes/jsonresume-theme-mytheme
cd packages/themes/jsonresume-theme-mytheme
```

### 2. `package.json`

```json
{
  "name": "jsonresume-theme-mytheme",
  "version": "0.0.1",
  "type": "module",
  "main": "index.js",
  "private": true
}
```

- `"type": "module"` — ESM syntax (`export`, `import`).
- `"private": true` — prevents accidental npm publish.
- `"main"` — entry file whose `render` export will be called.

### 3. `index.js`

Minimal, dependency-free example:

```js
const css = `
  @page { margin: 24mm; size: A4; }
  body {
    font-family: -apple-system, Segoe UI, Roboto, sans-serif;
    color: #222;
    line-height: 1.45;
  }
  h1 { margin: 0; font-size: 28px; }
  h2 {
    margin: 20px 0 6px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #555;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }
  .muted { color: #666; font-size: 13px; }
  .row { display: flex; justify-content: space-between; gap: 12px; }
  ul { padding-left: 18px; margin: 4px 0; }
`;

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function render(resume) {
  const b = resume.basics || {};
  const work = resume.work || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(b.name || 'Resume')}</title>
  <style>${css}</style>
</head>
<body>
  <header>
    <h1>${esc(b.name || '')}</h1>
    <div class="muted">${esc(b.label || '')}</div>
    <div class="muted">${[b.email, b.phone, b.url].filter(Boolean).map(esc).join(' · ')}</div>
    ${b.summary ? `<p>${esc(b.summary)}</p>` : ''}
  </header>

  ${work.length ? `<h2>Experience</h2>${work.map(w => `
    <div class="row">
      <strong>${esc(w.position || '')} — ${esc(w.name || '')}</strong>
      <span class="muted">${esc(w.startDate || '')} – ${esc(w.endDate || 'Present')}</span>
    </div>
    ${w.summary ? `<div>${esc(w.summary)}</div>` : ''}
    ${w.highlights?.length ? `<ul>${w.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
  `).join('')}` : ''}

  ${education.length ? `<h2>Education</h2>${education.map(e => `
    <div class="row">
      <strong>${esc(e.institution || '')}</strong>
      <span class="muted">${esc(e.startDate || '')} – ${esc(e.endDate || '')}</span>
    </div>
    <div class="muted">${esc([e.studyType, e.area].filter(Boolean).join(', '))}</div>
  `).join('')}` : ''}

  ${skills.length ? `<h2>Skills</h2><ul>${skills.map(s => `
    <li>
      <strong>${esc(s.name || '')}</strong>${s.keywords?.length ? ': ' + s.keywords.map(esc).join(', ') : ''}
    </li>
  `).join('')}</ul>` : ''}
</body>
</html>`;
}

export default { render };
```

### 4. Register the theme

Themes aren't auto-discovered — you have to wire them in three places.

**`package.json` (repo root):** add to `dependencies`

```json
"jsonresume-theme-mytheme": "workspace:*"
```

**`lib/formatters/template/themeConfig.js`:** add the import and register in the `THEMES` map

```js
import * as mytheme from 'jsonresume-theme-mytheme';

export const THEMES = {
  // ...existing themes
  mytheme,
};
```

**`lib/formatters/template/themeMetadata.js`** (optional — only needed if you want the theme to show up in listings / random-theme selection)

```js
export const THEME_METADATA = {
  // ...existing metadata
  mytheme: {
    name: 'My Theme',
    description: 'My custom theme',
    author: 'You',
    tags: ['custom'],
  },
};
```

### 5. Install and render

```bash
pnpm install
THEMES=mytheme pnpm build:chromium
open out/mytheme.pdf
```

After the first install, iterations are fast — just edit `index.js` and rerun `THEMES=mytheme pnpm build:chromium`. No reinstall needed.

## Using Handlebars instead

If you'd rather keep templates in a separate file and have loops/conditionals, use Handlebars (already a project dep):

```js
import Handlebars from 'handlebars';

const template = `
  <h1>{{basics.name}}</h1>
  {{#each work}}
    <h3>{{position}} — {{name}}</h3>
    <ul>{{#each highlights}}<li>{{this}}</li>{{/each}}</ul>
  {{/each}}
`;

export function render(resume) {
  return Handlebars.compile(template)(resume);
}
```

## ATS-friendly checklist

Most recruiters run resumes through an Applicant Tracking System before a human ever sees them. To make sure yours parses cleanly:

- Use real headings (`h1`, `h2`) — ATS parsers key off them.
- Prefer single-column layouts. Multi-column is frequently jumbled.
- Never put text inside images, SVG `<text>`, or canvas.
- Use semantic elements: `<ul>`, `<li>`, `<time>`, `<section>`.
- Avoid CSS tricks like `display: none`, `position: absolute`, or text set by pseudo-elements — parsers may miss or duplicate that content.
- Stick to standard fonts (the PDF embeds them, but text extraction works best with common fonts).
- Don't rely on tables for layout.

The repo also ships an ATS scorer in `lib/ats/` — you can score your generated HTML against it to spot issues.

## Testing your theme

`scripts/build.test.js` accepts a comma-separated theme list:

```bash
THEMES=mytheme,elegant,kendall pnpm build:pdf
```

You can also run the full Vitest suite — any theme you add automatically passes through the HTML smoke test in `lib/formatters/template/format.test.js`.

## Reference implementations

The six bundled themes live in `node_modules/` after `pnpm install`. Browse them for inspiration:

- `jsonresume-theme-elegant` — classic, popular Handlebars theme with nice typography.
- `jsonresume-theme-even` — balanced, clean modern look.
- `jsonresume-theme-jacrys` — simple professional layout.
- `jsonresume-theme-kendall` — clean, readable Handlebars example.
- `jsonresume-theme-macchiato` — warm, coffee-inspired design.
- `@jsonresume/theme-stackoverflow` — developer-focused, Stack Overflow-inspired.

`elegant`, `even`, and `kendall` are all short Handlebars-based themes and make great starting points.
