import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../useIsMobile';

/**
 * Inline text annotation. Wrap any run of text to make it a hoverable
 * (desktop) / tappable (mobile) affordance that opens a small popover
 * with secondary copy and an optional action button.
 *
 *     <p>I worked at <Hint content="Founded 2004…">Meta</Hint>.</p>
 *
 *     <Hint
 *       content="Full JSON Resume standard."
 *       action={{ label: 'Open schema', onClick: () => {...} }}
 *     >
 *       schema
 *     </Hint>
 *
 * ## Behaviour
 *
 *   - **Desktop** (viewport ≥ 768px): hover to open, mouse-leave to
 *     close (with a short grace delay so you can drag the cursor from
 *     the trigger into the popover without it collapsing). Click to
 *     pin/unpin.
 *   - **Mobile** (viewport < 768px): tap to open, tap outside / the
 *     action button / press Escape to close.
 *
 * ## Positioning
 *
 * The popover is portalled to `document.body` so it escapes the
 * `overflow: hidden` page sheets. Position is computed from the
 * trigger's rect: prefer *below* with a small gap, flip to *above*
 * if it would clip the bottom of the viewport, horizontally centred
 * on the trigger and clamped to the viewport edges.
 *
 * A `useLayoutEffect` reads the popover's real size after it mounts
 * and sets its final position *before* the browser paints, so there's
 * no one-frame flash in the wrong spot. While the measurement is
 * pending the popover is parked offscreen.
 *
 * ## Styling
 *
 * Popover matches the page content style (white sheet, thin border,
 * soft shadow, serif `DOC_FONT`, black 11pt) rather than the app
 * chrome — it reads as an inline footnote on the document, not a
 * browser tooltip hovering above it. Trigger is bold + 1px dotted
 * underline to signal interactivity without being loud.
 */

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

/** Time (ms) between mouse-leave and close. Lets the user drag the
 *  cursor across the gap between trigger and popover without race. */
const CLOSE_DELAY_MS = 100;

/** Vertical gap between the trigger and the popover. */
const GAP_PX = 8;

/** Minimum margin between the popover and the viewport edges. */
const EDGE_PX = 8;

type Action = { label: string; onClick: () => void };

export default function Hint({
  children,
  content,
  action,
}: {
  children: ReactNode;
  content: ReactNode;
  action?: Action;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const isMobile = useIsMobile();

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(
      () => setOpen(false),
      CLOSE_DELAY_MS,
    );
  }, [cancelClose]);

  // Reset position state every close so the next open re-measures
  // rather than flashing at a stale coordinate.
  useEffect(() => {
    if (!open) setPos(null);
  }, [open]);

  // Dismissal: Escape key + click/tap outside. Only active when open.
  useEffect(() => {
    if (!open) return;

    function isInside(target: EventTarget | null): boolean {
      if (!(target instanceof Node)) return false;
      return (
        triggerRef.current?.contains(target) === true ||
        popoverRef.current?.contains(target) === true
      );
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (isInside(e.target)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Position computation. Runs synchronously after commit so the user
  // only sees the popover after it lands in the right spot.
  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      const p = popoverRef.current?.getBoundingClientRect();
      if (!t || !p) return;

      // Prefer below, centred on trigger.
      let top = t.bottom + GAP_PX;
      let left = t.left + t.width / 2 - p.width / 2;

      // Flip above if doesn't fit below.
      if (top + p.height > window.innerHeight - EDGE_PX) {
        const above = t.top - p.height - GAP_PX;
        if (above >= EDGE_PX) top = above;
      }

      // Horizontal clamp.
      if (left < EDGE_PX) left = EDGE_PX;
      const maxLeft = window.innerWidth - p.width - EDGE_PX;
      if (left > maxLeft) left = Math.max(EDGE_PX, maxLeft);

      setPos({ top, left });
    };

    compute();

    // Keep position fresh while the popover is open. `scroll` uses
    // capture phase so we catch every ancestor scroll container, not
    // just window.
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  // Cleanup any pending close timer on unmount.
  useEffect(() => cancelClose, [cancelClose]);

  // Hover handlers only activate on desktop — touch browsers often
  // synthesize mouseenter/mouseleave after tap, which would fight
  // with the click toggle.
  const hoverHandlers = isMobile
    ? {}
    : {
        onMouseEnter: () => {
          cancelClose();
          setOpen(true);
        },
        onMouseLeave: scheduleClose,
      };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup={action ? 'dialog' : undefined}
        onClick={() => setOpen((v) => !v)}
        {...hoverHandlers}
        className="m-0 inline cursor-pointer border-0 bg-transparent p-0 font-bold underline decoration-dotted underline-offset-[3px] text-inherit hover:bg-[var(--selected)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:rounded-sm"
      >
        {children}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role={action ? 'dialog' : 'tooltip'}
            {...hoverHandlers}
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              maxWidth: 320,
              fontFamily: DOC_FONT,
              zIndex: 1000,
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-[11pt] leading-relaxed text-black shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <div>{content}</div>
            {action && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    setOpen(false);
                  }}
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1 text-[10pt] font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
