import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Tier-3 block-level paginator for the PREVIEW surface.
 *
 * Structurally identical to `EditPagePaginator` for now. Lives in its
 * own file so the preview can diverge from the edit surface without
 * coupling: the preview is ultimately what gets handed to the PDF
 * pipeline, so it may grow stricter break rules (forced section
 * starts, orphan/widow prevention, page-number footers) that the edit
 * surface shouldn't inherit.
 *
 * ## Contract
 *
 * Caller supplies an array of atomic blocks; hook measures them
 * offscreen and packs them greedily into page-sized bins. Returns a
 * hidden measurer node (must be mounted somewhere stable) and one
 * `ReactNode` per laid-out page.
 */

/* ── A4 geometry @ 96dpi ─────────────────────────────────────────── */

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

/** ~0.67" margin. Matches the WelcomePage for visual consistency. */
export const PAGE_PADDING_PX = 64;

const USABLE_WIDTH = A4_WIDTH_PX - PAGE_PADDING_PX * 2;
const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_PX * 2;

/* ── Hook ────────────────────────────────────────────────────────── */

export function usePreviewPagePagination(blocks: ReactNode[]): {
  measurer: ReactNode;
  pages: ReactNode[];
} {
  const measurerRef = useRef<HTMLDivElement>(null);
  const [assignments, setAssignments] = useState<number[]>(() =>
    blocks.map(() => 0),
  );

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
