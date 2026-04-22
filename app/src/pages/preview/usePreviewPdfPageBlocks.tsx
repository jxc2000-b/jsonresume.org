import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PreviewPdfPageCanvas } from './PreviewPdfPageCanvas';
import { ensurePdfjsWorker } from './setupPdfjs';
import { USABLE_HEIGHT, USABLE_WIDTH } from './PreviewPagePaginator';

/** Static test asset in `app/public/`. */
export const PREVIEW_PDF_URL = '/3pagepdf.pdf';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; doc: PDFDocumentProxy; layouts: PageLayout[] };

type PageLayout = { pageNumber: number; fitScale: number };

/**
 * One React block per physical PDF page (rendered in `PreviewPdfPageCanvas`),
 * sized to fit the preview paginator’s usable A4 area. Feed the result to
 * `usePreviewPagePagination` so the PDF participates in the global `pages`
 * list like any other block stack.
 */
export function usePreviewPdfPageBlocks(): ReactNode[] {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensurePdfjsWorker();
        const doc = await getDocument({ url: PREVIEW_PDF_URL }).promise;
        if (cancelled) {
          void doc.destroy();
          return;
        }
        const n = doc.numPages;
        const layouts: PageLayout[] = [];
        for (let p = 1; p <= n; p++) {
          const page = await doc.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const fitScale = Math.min(USABLE_WIDTH / base.width, USABLE_HEIGHT / base.height);
          layouts.push({ pageNumber: p, fitScale });
        }
        if (cancelled) {
          void doc.destroy();
          return;
        }
        setLoad({ status: 'ready', doc, layouts });
      } catch (e) {
        if (cancelled) return;
        setLoad({
          status: 'error',
          message: e instanceof Error ? e.message : 'Failed to load PDF',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (load.status !== 'ready') return;
    const { doc } = load;
    return () => {
      void doc.destroy();
    };
  }, [load]);

  return useMemo(() => {
    if (load.status === 'loading') {
      return [
        <div
          key="pdf-loading"
          className="text-[11pt] text-neutral-500"
          style={{
            fontFamily:
              '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif',
          }}
        >
          Loading PDF…
        </div>,
      ];
    }
    if (load.status === 'error') {
      return [
        <div
          key="pdf-error"
          className="text-[11pt] text-red-600"
          style={{
            fontFamily:
              '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif',
          }}
        >
          {load.message}
        </div>,
      ];
    }
    return load.layouts.map((L) => (
      <PreviewPdfPageCanvas
        key={L.pageNumber}
        doc={load.doc}
        pageNumber={L.pageNumber}
        fitScale={L.fitScale}
      />
    ));
  }, [load]);
}
