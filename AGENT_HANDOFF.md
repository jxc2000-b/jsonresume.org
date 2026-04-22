# Agent handoff — jsonresume.org workspace (frontend focus)

This document summarizes the **current state of the repository and the Vite/React app** so another agent can continue without re-discovering quirks. It is accurate as of the last update to this file.

---

## 1. What this repo is

- **Original project:** [jsonresume.org](https://jsonresume.org)-style tooling (JSON Resume → HTML/PDF, themes, registry ideas, etc.).
- **User’s fork:** Heavily **pruned** from the upstream monorepo. Large chunks (homepages, turbo pipeline, many apps) were removed; **what remains** includes:
  - **`lib/`** — Node/JS modules still used for PDF, themes, **JSON Resume schema** (`lib/schema.js` + `lib/schema/*.js`), validation (`lib/generateResume/validation.js`), ATS-related code the user may keep, etc.
  - **`app/`** — The **Vite + React** frontend the user is building: a **Chrome PDF-viewer** aesthetic with paginated “pages” of content.

**Chromium/Playwright** and **RenderCV** paths existed historically; the user’s product direction is **Chromium for PDF** with RenderCV as optional / separate. Not all old scripts are guaranteed to work after the prune.

---

## 2. Monorepo / tooling (high level)

- **Package manager:** `pnpm@8.15.9` (see `packageManager` in root `package.json`).
- **Root `package.json` scripts** relevant to the web app:
  - `dev:web` — `vite --config app/vite.config.ts` (Vite **root = `app/`**).
  - `build` — Vite build with same config.
- **Full `dev` script** also starts `app/server` — only needed if the user is working the API. Frontend-only: use **`pnpm dev:web`** (or your own `vite` invocation from `app/`).
- **Paths:** Vite has aliases `@` → `app/src`, `@lib` → repo `lib/`.

**pnpm gotcha:** If `pnpm add` at root errors with workspace rules, use `-w` and align `--store-dir` with the user’s store if their `.npmrc` expects a local store. This was a real issue once; the fix was `pnpm add -w ...` with an explicit store.

---

## 3. Frontend stack (`app/`)

| Piece | Role |
|--------|------|
| **Vite 5** | Bundler, HMR, dev server (default port **5173** in `app/vite.config.ts`). |
| **React 19** | App shell. `main.tsx` uses `StrictMode`. |
| **TypeScript** | `app/tsconfig.json` — `jsx: react-jsx`, includes `src/**/*.ts` and `src/**/*.tsx`. |
| **Tailwind** | `app/tailwind.config.ts` — **content paths are repo-root-relative** (`./app/...`) so globs work when the config is resolved from `app/`. |
| **PostCSS** | Inlined in `app/vite.config.ts` (Tailwind + autoprefixer), not a separate `postcss.config.cjs` in `app/`. |
| **Styles** | `app/src/styles.css` — Tailwind layers + `:root` CSS variables for chrome/sidebar/background. |

### CSS variables (theming)

Defined in `styles.css`, used across the app (e.g. `--bg`, `--chrome`, `--fg`, `--page`, `--selected`, `--other-bg`). **If the whole UI looks “wrong color” (e.g. solid blue)**, check that `:root` is present and the dev server the user is viewing is the **current** one (see “Vite / HMR” below).

---

## 4. App architecture (the important mental model)

### 4.1 `App.tsx` — viewport **dispatcher** only

- Uses **`useIsMobile()`** (`app/src/useIsMobile.ts`) — `matchMedia('(max-width: 767px)')` (i.e. **&lt; 768px = mobile**).
- Renders **`MobileApp`** or **`DesktopApp`**. **Only one surface is mounted** at a time. Crossing the breakpoint **remounts** the subtree: zoom, current page, scroll position **do not** carry over. Intentional.

### 4.2 Shared page list — **`usePageComposition`**

- **File:** `app/src/usePageComposition.tsx` (must be **`.tsx`** — JSX inside; a `.ts` file will break parsing and can blank the app).
- **Exports:** `usePageComposition()` → `{ pages, pageCount, measurers }`.
- **What it does:**
  - Runs **two** paginator hooks: **edit** (`useEditPagePagination(editPageBlocks)`) and **preview** (`usePreviewPagePagination(previewPageBlocks)`).
  - Builds a **flat** `ReactNode[]` in fixed order:
    1. `WelcomePage`
    2. All **edit** paginated “pages”
    3. All **preview** paginated “pages”
    4. `AtsValidator`, `RulesBasedPruner`, `AIBasedPruner`, `VersionViewer` (static one-page each)
- **`measurers`** is a **fragment** of both hidden measurer divs. **Both must be mounted** in the active surface’s tree so off-screen measurement works.

**Renaming / cache:** If Vite HMR glitches after moving this file, a **hard refresh** or **dev server restart** may be required.

### 4.3 `DesktopApp.tsx` — Chrome-pdf **mock**

- Toolbar, thumbnail rail, main scroll viewport with “paper” sheets.
- **Zoom** scales width/height of each sheet; content can **clip** at non-100% zoom (known limitation; not “fixed” by design in recent work).
- `viewportRef` exists but is not central to mobile.

### 4.4 `MobileApp.tsx` — **pill + scroll-snap**

- **No** toolbar, **no** sidebar, **no** zoom.
- **Floating pill:** `currentPage` / `pageCount` (e.g. `1 of 10`), top-left.
- **Scroll container:** `scroll-snap-type: y mandatory`, each “page” is a **snap point**.
- **Scaling:** Each logical page is **laid out at A4 (794×1123)** internally, then **CSS `transform: scale(W/794)`** so content matches what the paginators measure; **no re-pagination at phone width** (by design).
- **Current page tracking:** `IntersectionObserver` on sheets, picks **max intersection ratio** (ties → lower index).
- **`ResizeObserver`** on the scroll root for width-driven scale.

**iOS quirk:** `scroll-snap-stop: always` is not always honored on older Safari; user might “skip” a page on a fast fling. Acceptable for now.

### 4.5 `Hint.tsx` (optional pattern)

- Reusable **inline** annotation: bold + **dotted underline** trigger, popover (page-matched white card, portal to `document.body`), desktop hover + mobile tap, optional action button. Uses same `useIsMobile` breakpoint.

**Caveat:** `position: fixed` popovers can misbehave if a parent applies `transform` / `filter` (creates a containing block). Current tree is OK; re-check if wrapping the whole viewer in `transform: scale` later.

---

## 5. Pagination — edit vs preview (Tier 3, block-level)

### Files

- **Edit:** `app/src/pages/edit-pages/EditPagePaginator.tsx` — exports `useEditPagePagination`, `A4_WIDTH_PX`, `A4_HEIGHT_PX`, `PAGE_PADDING_PX`.
- **Preview:** `app/src/pages/preview/PreviewPagePaginator.tsx` — exports `usePreviewPagePagination` (+ same A4 constants).
- Bodies are **largely duplicated on purpose** so each surface can diverge later (edit forms vs print preview rules).

### Algorithm (both)

- Caller passes **`blocks: ReactNode[]`** (atomic; **the paginator does not split a single block** across two pages).
- **Hidden “measurer”** renders all blocks in an off-screen column at **usable width**; heights from `getBoundingClientRect()`.
- **Greedy first-fit** into pages of **usable height**; assignments stored in state; `useLayoutEffect` re-runs after paint (no explicit dependency array so form/content height changes re-flow).

### Geometry

- A4 at **96dpi:** **794×1123** CSS px.
- **PAGE_PADDING_PX = 64** on each page container (content area padding in the visible page `div`s).
- **`BOTTOM_SAFETY_PX` (48)** subtracted from **only** the vertical “bin” used for packing — forces an **extra visual gap** at the bottom of each page without shrinking top/side padding. (User: “padding at the bottom of the page always.”)

### Known limitations (explicit / accepted)

- **Section-aware breaks** (orphans, “keep with next”) — **not** implemented. User is OK with “weird” breaks in **edit** flow; **preview** / PDF can be the polished view.
- **Blocks taller than one page** — one block can **overflow** a single sheet.
- **rjsf forms rendered twice** (measurer + visible page) — static preview OK; if a block’s **page index changes**, React **unmounts/remounts** the form and **loses in-form state** unless you later portal stable instances (noted in comments in edit paginator).

### Document sources

- **Edit blocks:** `app/src/pages/edit-pages/EditPagesDocument.tsx` — exports **`editPageBlocks`**, contains **`ResumeSectionForm`** + placeholder **`entrySchema` / `entryUiSchema`** (renamed from work-specific names; meant to be **dynamically generated** from `lib/schema.js` later).
- **Preview blocks:** `app/src/pages/preview/PreviewPagesDocument.tsx` — **`previewPageBlocks`**, currently a small placeholder; intended to map from resume data for “print” view.

### Styling note for rjsf

- **`.resume-form`** class on the form wrapper; **intentional minimal CSS** in `styles.css` (user pared back heavy rjsf styling). Form uses browser defaults + Tailwind preflight in places.

---

## 6. JSON Resume schema in this repo

- **Not** a single `schema.json` on disk for the *meta-schema*; the **canonical structure** is **`lib/schema.js`**, built from `lib/schema/basics.js`, `work.js`, etc.
- **`app/schema/schema.json`** — user-added **sample resume document** (canonical example JSON from the website), **not** the JSON Schema file. Name is misleading; `formData` vs `schema` in rjsf terms.

---

## 7. Static “pages” in the flow

- `app/src/pages/WelcomePage.tsx` — LaTeX-ish styled intro (custom layout).
- `AtsValidator.tsx`, `RulesBasedPruner.tsx`, `AIBasedPruner.tsx`, `VersionViewer.tsx` — **placeholder** centered text; wired into the **global** `pages` array after paginated content.

`workspace.ts` / `themes.ts` exist as stubs (nearly empty) — not wired.

---

## 8. Vite / HMR / “why is the site wrong?”

- **Multiple dev servers** or **stale tabs** can show old bundles/CSS. User previously saw wrong colors and suspected HMR; **killing duplicate Vite processes** and a **single** active port fixed confusion.
- **User preference:** the coding agent should **not** leave stray Vite processes running in the sandbox; user may run their own `vite` — **do not assume** you are the only long-lived server.
- **PostCSS inlining:** if Tailwind “does nothing,” check `vite.config.ts` uses ESM `import tailwindcss` and passes `config` path; a broken inline PostCSS step can make `@tailwind` directives appear **raw** in the browser.

---

## 9. TypeScript / imports

- **`usePageComposition` must be `.tsx`** if it contains JSX.
- **Extensionless imports** `from './usePageComposition'` resolve to `.tsx` — fine after delete/rename *once* the dev server picks up the graph.

---

## 10. Suggested next work (not implemented)

- Wire **`editPageBlocks`** to real **resume state**; generate **per-section** rjsf schemas from `lib/schema.js` (carry **`definitions`** for `$ref` resolution if slicing sub-schemas).
- **Preview** pipeline: render read-only resume HTML or components from the same data; optional **Chromium print-to-PDF** path from server scripts.
- **Desktop zoom:** scale content like mobile instead of clipping (if desired).
- **Portal** for rjsf blocks if pagination moves forms between “pages” often.
- **Optional:** consolidate duplicated paginator code into a shared module **if** both stay identical; until then, **keep them in sync** when changing geometry (e.g. `BOTTOM_SAFETY_PX`).

---

## 11. File map (frontend, concise)

| Path | Purpose |
|------|---------|
| `app/index.html` | Vite entry HTML |
| `app/vite.config.ts` | Vite + PostCSS (Tailwind) |
| `app/tailwind.config.ts` | Tailwind content globs |
| `app/src/main.tsx` | React mount + `styles.css` |
| `app/src/App.tsx` | Mobile/desktop switch |
| `app/src/DesktopApp.tsx` | PDF chrome UI |
| `app/src/MobileApp.tsx` | Mobile scroll + pill |
| `app/src/usePageComposition.tsx` | Single source of `pages` + measurers |
| `app/src/useIsMobile.ts` | Breakpoint |
| `app/src/Hint.tsx` | Inline popover / tooltip pattern |
| `app/src/styles.css` | Global + variables + `.resume-form` hook |
| `app/src/pages/WelcomePage.tsx` | First “page” |
| `app/src/pages/edit-pages/*` | Edit paginator + `editPageBlocks` |
| `app/src/pages/preview/*` | Preview paginator + `previewPageBlocks` |
| `app/schema/schema.json` | Sample **resume** JSON (not JSON Schema) |

---

## 12. User expectations for agents (from past conversation)

- **Follow instructions fully**; **minimal, task-scoped diffs**; don’t add unsolicited docs (this file was **explicitly requested**).
- **Date:** user environment indicated **2026** when relevant.
- **Dev server:** prefer **user-run Vite**; **kill** any Vite the agent starts when done, or don’t start it.
- **Quality:** clear prose; **code citations** in chat with ````startLine:endLine:path```` when helpful.

---

*End of handoff. Update this file when major architecture or workflow assumptions change.*
