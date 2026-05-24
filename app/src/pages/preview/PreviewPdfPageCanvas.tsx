import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

type Props = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  fitScale: number;
};

/**
 * Renders a single PDF page to a <canvas> at the size implied by
 * `getViewport({ scale: fitScale })` (one physical page, scaled to
 * the preview “usable” box).
 */
export function PreviewPdfPageCanvas({ doc, pageNumber, fitScale }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<RenderTask | null>(null);
  const pageRef = useRef<PDFPageProxy | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Preview page ${pageNumber}`);
    host.appendChild(canvas);

    let cancelled = false;

    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) {
          void page.cleanup();
          return;
        }
        pageRef.current = page;
        const dpr = Math.min(2, globalThis.devicePixelRatio ?? 1);
        const viewport = page.getViewport({ scale: fitScale * dpr });
        const cssVp = page.getViewport({ scale: fitScale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${cssVp.width}px`;
        canvas.style.height = `${cssVp.height}px`;
        canvas.style.display = 'block';

        const task = page.render({ canvas, viewport });
        taskRef.current = task;
        await task.promise;
        taskRef.current = null;
        if (cancelled) {
          void page.cleanup();
        }
      } catch {
        // getPage/render can fail on rapid navigation; ignore if unmounted
      }
    })();

    return () => {
      cancelled = true;
      taskRef.current?.cancel();
      taskRef.current = null;
      void pageRef.current?.cleanup();
      pageRef.current = null;
      host.removeChild(canvas);
    };
  }, [doc, pageNumber, fitScale]);

  return <div className="select-none" ref={hostRef} style={{ fontFamily: DOC_FONT }} />;
}
