import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PreviewPdfPageCanvas } from './PreviewPdfPageCanvas';
import { ensurePdfjsWorker } from './setupPdfjs';
import { USABLE_HEIGHT, USABLE_WIDTH } from './PreviewPagePaginator';
import { useResumePdf } from '../../pdf/ResumePdfContext';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; doc: PDFDocumentProxy; layouts: PageLayout[] };

type PageLayout = { pageNumber: number; fitScale: number };

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

/**
 * One React block per physical PDF page (rendered in `PreviewPdfPageCanvas`),
 * sized to fit the preview paginator's usable A4 area.
 *
 * The bytes consumed here are the SAME bytes the "Download" button writes to
 * disk — both come from the `ResumePdfProvider`. There is no separate HTML
 * preview path, so preview and download cannot drift.
 */
export function usePreviewPdfPageBlocks(): ReactNode[] {
  const { status: pdfStatus, bytes, error, pdfEpoch } = useResumePdf();
  const [load, setLoad] = useState<LoadState>({ status: 'idle' });

  useEffect(() => {
    if (pdfStatus === 'generating' || pdfStatus === 'idle') {
      setLoad({ status: 'loading' });
      return;
    }
    if (pdfStatus === 'error') {
      setLoad({ status: 'error', message: error ?? 'PDF generation failed' });
      return;
    }
    if (!bytes) return;

    let cancelled = false;
    let openedDoc: PDFDocumentProxy | null = null;
    setLoad({ status: 'loading' });

    (async () => {
      try {
        ensurePdfjsWorker();
        // Copy: pdf.js takes ownership of the buffer it receives.
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);
        const doc = await getDocument({ data: copy }).promise;
        openedDoc = doc;
        if (cancelled) {
          void doc.destroy();
          return;
        }
        const layouts: PageLayout[] = [];
        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const fitScale = Math.min(
            USABLE_WIDTH / base.width,
            USABLE_HEIGHT / base.height,
          );
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
        if (openedDoc) void openedDoc.destroy();
      }
    })();

    return () => {
      cancelled = true;
      if (openedDoc) void openedDoc.destroy();
    };
  }, [pdfStatus, bytes, error, pdfEpoch]);

  return useMemo(() => {
    if (load.status === 'idle' || load.status === 'loading') {
      return [
        <div
          key="pdf-loading"
          className="text-[11pt] text-neutral-500"
          style={{ fontFamily: DOC_FONT }}
        >
          Generating PDF preview...
        </div>,
      ];
    }
    if (load.status === 'error') {
      return [
        <div
          key="pdf-error"
          className="text-[11pt] text-red-600"
          style={{ fontFamily: DOC_FONT }}
        >
          {load.message}
        </div>,
      ];
    }
    return load.layouts.map((L) => (
      <PreviewPdfPageCanvas
        key={`${pdfEpoch}-${L.pageNumber}`}
        doc={load.doc}
        pageNumber={L.pageNumber}
        fitScale={L.fitScale}
      />
    ));
  }, [load, pdfEpoch]);
}
