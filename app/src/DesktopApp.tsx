import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePageComposition } from './usePageComposition';

/**
 * Desktop Chrome-PDF-viewer mock. Houses the toolbar, thumbnail rail,
 * and main viewport. Page composition (what pages exist and in what
 * order) lives in `usePageComposition` so MobileApp can share it.
 *
 * Mounted by `App.tsx` whenever `useIsMobile()` is false.
 */

const FILE_NAME = 'resume.pdf';
const ZOOM_STEPS = [50, 75, 90, 100, 125, 150, 200];

// A4 @ 96dpi. Used for both the thumbnails and the main page.
const PAGE_ASPECT = 210 / 297;
const MAIN_PAGE_WIDTH = 794; // px at 100%

export default function DesktopApp() {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { pages, pageCount, measurers } = usePageComposition();

  // Keep currentPage in range when pagination shrinks.
  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  function zoomOut() {
    const next = [...ZOOM_STEPS].reverse().find((z) => z < zoom);
    if (next) setZoom(next);
  }
  function zoomIn() {
    const next = ZOOM_STEPS.find((z) => z > zoom);
    if (next) setZoom(next);
  }

  function goToPage(n: number) {
    const clamped = Math.max(1, Math.min(pageCount, n));
    setCurrentPage(clamped);
    pageRefs.current[clamped - 1]?.scrollIntoView({ block: 'start' });
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Hidden measurement hosts — one per surface. Must be mounted
          somewhere stable so they're not recreated on every render. */}
      {measurers}
      <Toolbar
        fileName={FILE_NAME}
        currentPage={currentPage}
        pageCount={pageCount}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onPageChange={goToPage}
      />
      <div className="flex min-h-0 flex-1">
        <ThumbnailRail
          pageCount={pageCount}
          currentPage={currentPage}
          onSelect={goToPage}
        />
        <MainViewport
          viewportRef={viewportRef}
          pageRefs={pageRefs}
          pages={pages}
          zoom={zoom}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Toolbar ─────────────────────────── */

function Toolbar({
  fileName,
  currentPage,
  pageCount,
  zoom,
  onZoomIn,
  onZoomOut,
  onPageChange,
}: {
  fileName: string;
  currentPage: number;
  pageCount: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPageChange: (n: number) => void;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/30 bg-[var(--chrome)] px-3 text-sm">
      {/* Left: menu + filename */}
      <div className="flex min-w-0 items-center gap-2">
        <IconButton label="Menu">
          <MenuIcon />
        </IconButton>
        <span className="ml-1 truncate text-[13px] text-neutral-100">
          {fileName}
        </span>
      </div>

      {/* Center: page counter, zoom, page tools */}
      <div className="flex items-center gap-1">
        <PageCounter
          currentPage={currentPage}
          pageCount={pageCount}
          onChange={onPageChange}
        />
        <Divider />
        <IconButton label="Zoom out" onClick={onZoomOut}>
          <MinusIcon />
        </IconButton>
        <span className="min-w-[42px] select-none text-center text-[12px] tabular-nums text-neutral-200">
          {zoom}%
        </span>
        <IconButton label="Zoom in" onClick={onZoomIn}>
          <PlusIcon />
        </IconButton>
        <Divider />
        <IconButton label="Fit to page">
          <FitIcon />
        </IconButton>
        <IconButton label="Rotate">
          <RotateIcon />
        </IconButton>
        <IconButton label="Annotate">
          <AnnotateIcon />
        </IconButton>
        <Divider />
        <IconButton label="Undo">
          <UndoIcon />
        </IconButton>
        <IconButton label="Redo">
          <RedoIcon />
        </IconButton>
      </div>

      {/* Right: file actions */}
      <div className="flex items-center gap-1">
        <IconButton label="Save to cloud">
          <CloudIcon />
        </IconButton>
        <IconButton label="Download">
          <DownloadIcon />
        </IconButton>
        <IconButton label="Print">
          <PrintIcon />
        </IconButton>
        <IconButton label="More">
          <MoreIcon />
        </IconButton>
      </div>
    </header>
  );
}

function PageCounter({
  currentPage,
  pageCount,
  onChange,
}: {
  currentPage: number;
  pageCount: number;
  onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState<string>(String(currentPage));
  // keep the input in sync when the page changes externally
  if (draft !== String(currentPage) && document.activeElement?.tagName !== 'INPUT') {
    setDraft(String(currentPage));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(draft);
        if (Number.isFinite(n)) onChange(n);
      }}
      className="flex items-center gap-1 rounded px-1.5"
    >
      <input
        aria-label="Current page"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={() => onChange(Number(draft) || 1)}
        className="w-9 rounded border border-neutral-500 bg-[#404447] px-1 py-0.5 text-center text-[12px] tabular-nums text-neutral-100 outline-none focus:border-blue-400"
      />
      <span className="select-none text-[12px] text-neutral-300">
        / {pageCount}
      </span>
    </form>
  );
}

/* ─────────────────────────── Thumbnail rail ─────────────────────────── */

function ThumbnailRail({
  pageCount,
  currentPage,
  onSelect,
}: {
  pageCount: number;
  currentPage: number;
  onSelect: (n: number) => void;
}) {
  const THUMB_WIDTH = 120;
  const THUMB_HEIGHT = Math.round(THUMB_WIDTH / PAGE_ASPECT);
  return (
    <aside className="flex w-[200px] shrink-0 flex-col items-center overflow-y-auto border-r border-black/40 bg-[var(--other-bg)] py-4">
      {Array.from({ length: pageCount }).map((_, i) => {
        const n = i + 1;
        const active = n === currentPage;
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className="group mb-6 flex flex-col items-center focus:outline-none"
          >
            <div
              style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
              className={`bg-white shadow-md transition-[box-shadow,outline] duration-100 ${
                active
                  ? 'outline outline-2 outline-[#8ab4f8]'
                  : 'outline outline-1 outline-transparent group-hover:outline-neutral-400/60'
              }`}
            />
            <span className="mt-1.5 text-[11px] tabular-nums text-neutral-300">
              {n}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

/* ─────────────────────────── Main viewport ─────────────────────────── */

function MainViewport({
  viewportRef,
  pageRefs,
  pages,
  zoom,
}: {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  pageRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  pages: ReactNode[];
  zoom: number;
}) {
  const width = Math.round(MAIN_PAGE_WIDTH * (zoom / 100));
  const height = Math.round(width / PAGE_ASPECT);
  return (
    <div
      ref={viewportRef}
      className="flex min-w-0 flex-1 flex-col items-center overflow-auto bg-[var(--chorme)] py-8"
    >
      {pages.map((content, i) => (
        <div
          key={i}
          ref={(el) => {
            pageRefs.current[i] = el;
          }}
          style={{ width, height }}
          className="mb-6 shrink-0 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5),0_10px_30px_-10px_rgba(0,0,0,0.4)]"
        >
          {content}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Primitives ─────────────────────────── */

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded text-neutral-200 transition-colors hover:bg-white/10 active:bg-white/20"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-white/15" />;
}

/* ─────────────────────────── Icons ─────────────────────────── */
// All icons are 18×18 stroke=1.75 heroicons-style. Kept inline to avoid
// pulling in an icon library for a static mock.

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function MenuIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12h14" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function FitIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" />
    </svg>
  );
}
function RotateIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
function AnnotateIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 19l7-7 3 3-7 7H12v-3z" />
      <path d="M18 13l-1.5-1.5" />
      <path d="M2 20l4-1 8-8-3-3-8 8-1 4z" />
    </svg>
  );
}
function UndoIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 14l-4-4 4-4" />
      <path d="M5 10h11a4 4 0 0 1 0 8h-3" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 14l4-4-4-4" />
      <path d="M19 10H8a4 4 0 0 0 0 8h3" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11.5 2A4 4 0 0 1 17 18H7z" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 9V4h12v5" />
      <path d="M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
      <path d="M6 14h12v6H6z" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="5" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="12" cy="19" r="1.2" />
    </svg>
  );
}
