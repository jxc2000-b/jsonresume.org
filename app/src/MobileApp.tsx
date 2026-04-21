import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePageComposition } from './usePageComposition';

/**
 * Mobile surface. No toolbar, no sidebar, no zoom — a single vertical
 * scroll of page sheets with scroll-snap, plus a floating "N of M"
 * pill in the top-left.
 *
 * ## Page sizing
 *
 * Pages are laid out internally at A4 (794×1123px, 96dpi). That's
 * what the paginator measured against, so we must NOT re-paginate at
 * phone width — the page breaks would drift per-device. Instead the
 * sheet is CSS-scaled via `transform: scale(W/794)` where W is the
 * viewport width minus a gutter, and the outer wrapper's width/height
 * use the *scaled* dimensions so pages stack cleanly.
 *
 * ## Current-page tracking
 *
 * `IntersectionObserver` watches every sheet and picks whichever has
 * the greatest visible area as the current page. Ties break toward
 * the lower page number (natural DOM order).
 */

/** A4 @ 96dpi — must match the paginator's A4_WIDTH_PX / _HEIGHT_PX. */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/** Horizontal gutter between the page sheet and the viewport edges. */
const GUTTER_PX = 12;

export default function MobileApp() {
  const { pages, pageCount, measurers } = usePageComposition();

  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Viewport width drives the scale factor. Track via ResizeObserver
  // so rotation / split-screen / browser-chrome changes are handled.
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === 'undefined' ? A4_WIDTH_PX : window.innerWidth,
  );

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportWidth(el.clientWidth));
    ro.observe(el);
    setViewportWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Watch sheets to keep the pill in sync with scroll position.
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;
    const ratios = new Map<Element, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        // Find the sheet with the highest intersection ratio. Ties
        // resolve to the earlier page (lower index), which matches
        // how users perceive "the page I'm currently on".
        let bestIdx = -1;
        let bestRatio = -1;
        pageRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestIdx = i;
          }
        });
        if (bestIdx >= 0) setCurrentPage(bestIdx + 1);
      },
      {
        root,
        // Multiple thresholds so we get updates throughout the scroll,
        // not only at fully-on/fully-off transitions.
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    pageRefs.current.forEach((el) => {
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [pageCount]);

  const sheetWidth = Math.max(0, viewportWidth - GUTTER_PX * 2);
  const scale = sheetWidth / A4_WIDTH_PX;
  const sheetHeight = Math.round(A4_HEIGHT_PX * scale);

  return (
    <div className="relative h-full w-full bg-[var(--bg)] text-[var(--fg)]">
      {/* Hidden measurement hosts. Mounted here so the paginators keep
          measuring even before the scroll container paints. */}
      {measurers}

      {/* Floating page-counter pill. */}
      <div
        className="pointer-events-none absolute left-3 top-3 z-10 select-none rounded-lg bg-white/95 px-2.5 py-1 text-sm font-semibold text-neutral-900 shadow-md"
        aria-live="polite"
      >
        {currentPage} of {pageCount}
      </div>

      {/* Scroll-snap viewport. `overscroll-contain` keeps iOS from
          bouncing the whole app body when the user over-scrolls. */}
      <div
        ref={viewportRef}
        className="h-full w-full overflow-y-auto overscroll-contain"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {pages.map((content, i) => (
          <div
            key={i}
            ref={(el) => {
              pageRefs.current[i] = el;
            }}
            style={{
              width: sheetWidth,
              height: sheetHeight,
              marginLeft: GUTTER_PX,
              marginRight: GUTTER_PX,
              marginTop: i === 0 ? GUTTER_PX : 0,
              marginBottom: GUTTER_PX,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
            className="overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5),0_10px_30px_-10px_rgba(0,0,0,0.4)]"
          >
            {/* Inner layer: internal A4 coordinates, CSS-scaled into
                the sheet. `transform-origin: top left` so (0, 0) of the
                A4 canvas aligns with (0, 0) of the visible sheet. */}
            <div
              style={{
                width: A4_WIDTH_PX,
                height: A4_HEIGHT_PX,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
