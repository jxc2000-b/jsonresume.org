import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Tier-3 block-level paginator for the EDIT surface.
 *
 * Formerly `app/src/pages/Paginator.tsx` — moved here and renamed so
 * the edit and preview surfaces can diverge without fighting for the
 * same module name. For the moment the edit and preview paginators are
 * identical; keep them as separate files so per-surface tweaks stay
 * local (e.g. edit pages might need extra breakpoints for form help
 * text, preview pages won't).
 *
 * ## Contract
 *
 * The caller supplies an array of "blocks" — React nodes that are
 * treated as atomic by the layout engine. The hook:
 *
 *   1. Renders every block once into a hidden, absolute-positioned,
 *      A4-content-width container (the `measurer`).
 *   2. Reads each block's rendered height via `getBoundingClientRect`.
 *   3. Packs blocks into pages greedy-first-fit using the usable A4
 *      content height as the bin size.
 *   4. Returns one React node per page, each containing that page's
 *      subset of blocks wrapped in a padded container.
 *
 * The caller MUST mount `measurer` somewhere in the tree (it's
 * visually hidden; any stable location inside the app root is fine)
 * and render `pages[i]` inside its i-th visible page sheet.
 *
 * ## What this sketch does NOT do yet
 *
 *   - No `break-before` / `break-after` / `break-inside: avoid` hints.
 *     Every block is atomic; no one block is forced to / forbidden
 *     from starting a page.
 *   - No orphan/widow prevention — a `SectionHeader` block can be the
 *     last thing on a page with its body starting the next. Fix by
 *     tagging blocks with a `keep-with-next` marker and biasing the
 *     packer to break BEFORE them when they'd otherwise be last.
 *   - No handling for blocks taller than a page — they become their
 *     own overflowing page.
 *   - No block re-ordering, balancing, or justification.
 *
 * ## Stateful editor blocks (future)
 *
 * Each block is rendered twice (measurer + visible page). Static
 * placeholders are fine. If a block holds form state and its page
 * assignment changes, React will remount it and lose local state —
 * the durable fix is a stable parent + `createPortal` into page sheets.
 * Defer until needed.
 */

/* ── A4 geometry @ 96dpi ─────────────────────────────────────────── */

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

/** ~0.67" margin. Matches the WelcomePage for visual consistency. */
export const PAGE_PADDING_PX = 64;

/** Extra breathing room reserved at the bottom of every page. The
 *  packer treats this as unusable, so blocks get bumped to the next
 *  page before filling right down to the margin. Separate from
 *  `PAGE_PADDING_PX` so the visual margin at top/left/right stays as
 *  it was — only the content bin shrinks. */
const BOTTOM_SAFETY_PX = 48;

const USABLE_WIDTH = A4_WIDTH_PX - PAGE_PADDING_PX * 2;
const USABLE_HEIGHT =A4_HEIGHT_PX - PAGE_PADDING_PX * 2;

/* ── Hook ────────────────────────────────────────────────────────── */

export function useEditPagePagination(blocks: ReactNode[]): {
  measurer: ReactNode;
  pages: ReactNode[];
} {
  const measurerRef = useRef<HTMLDivElement>(null);
  const [assignments, setAssignments] = useState<number[]>(() =>
    blocks.map(() => 0),
  );

  // Runs after every render. Converges when measurement stabilises
  // (arraysEqual short-circuits further setStates). Intentionally has
  // no dep array — any upstream state change (e.g. a user typing into
  // a form block) can change block heights, and we want pagination
  // to react immediately without the caller having to memoize.
  useLayoutEffect(() => {
    const host = measurerRef.current;
    if (!host) return;

    const domBlocks = Array.from(host.children) as HTMLElement[];
    const next: number[] = [];
    let page = 0;
    let used = 0;

    for (let i = 0; i < blocks.length; i++) {
      const h = domBlocks[i]?.getBoundingClientRect().height ?? 0;

      if (used > 0 && used + h > USABLE_HEIGHT) {
        page += 1;
        used = 0;
      }

      next.push(page);
      used += h;
    }

    if (!arraysEqual(next, assignments)) setAssignments(next);
  });

  const measurer = (
    <div
      aria-hidden
      ref={measurerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: -99999,
        width: USABLE_WIDTH,
        visibility: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {blocks.map((block, i) => (
        <div key={i}>{block}</div>
      ))}
    </div>
  );

  const pageCount = Math.max(1, (assignments[assignments.length - 1] ?? 0) + 1);

  const pages: ReactNode[] = Array.from({ length: pageCount }, (_, i) => (
    <div
      key={i}
      className="h-full w-full"
      style={{ padding: PAGE_PADDING_PX }}
    >
      {blocks.filter((_, idx) => assignments[idx] === i)}
    </div>
  ));

  return { measurer, pages };
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
