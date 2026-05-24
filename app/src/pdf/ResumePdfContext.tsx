import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { generateResumePdf } from './generateResumePdf';
import { parseMasterToClientResume } from './parseMasterResume';

/**
 * Generates a fresh PDF (`Uint8Array`) whenever the workspace `dataEpoch`
 * advances, and exposes the bytes for both the on-screen preview and the
 * "Download" action. Bytes are the single source of truth — preview and
 * download share them, so they cannot drift.
 */

type PdfState =
  | { status: 'idle'; bytes: null; error: null }
  | { status: 'generating'; bytes: null; error: null }
  | { status: 'ready'; bytes: Uint8Array; error: null }
  | { status: 'error'; bytes: null; error: string };

interface ResumePdfContextValue {
  status: PdfState['status'];
  bytes: Uint8Array | null;
  error: string | null;
  /** Bumps each time new bytes are committed; useful as a render key. */
  pdfEpoch: number;
  downloadPdf: (suggestedFileName?: string) => void;
}

const Ctx = createContext<ResumePdfContextValue | null>(null);

export function ResumePdfProvider({ children }: { children: ReactNode }) {
  const { status: wsStatus, document, dataEpoch } = useWorkspace();
  const [state, setState] = useState<PdfState>({
    status: 'idle',
    bytes: null,
    error: null,
  });
  const [pdfEpoch, setPdfEpoch] = useState(0);
  const runRef = useRef(0);

  useEffect(() => {
    if (wsStatus !== 'ready' || !document) return;
    const myRun = ++runRef.current;
    setState({ status: 'generating', bytes: null, error: null });
    (async () => {
      try {
        const resume = parseMasterToClientResume(document.master);
        const bytes = await generateResumePdf(resume);
        if (runRef.current !== myRun) return;
        setState({ status: 'ready', bytes, error: null });
        setPdfEpoch((e) => e + 1);
      } catch (e) {
        if (runRef.current !== myRun) return;
        const message = e instanceof Error ? e.message : 'PDF generation failed';
        setState({ status: 'error', bytes: null, error: message });
      }
    })();
  }, [wsStatus, document, dataEpoch]);

  const downloadPdf = useCallback(
    (suggested?: string) => {
      if (state.status !== 'ready') return;
      const blob = new Blob([state.bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = suggested ?? 'resume.pdf';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [state],
  );

  const value = useMemo<ResumePdfContextValue>(
    () => ({
      status: state.status,
      bytes: state.bytes,
      error: state.error,
      pdfEpoch,
      downloadPdf,
    }),
    [state, pdfEpoch, downloadPdf],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResumePdf(): ResumePdfContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useResumePdf must be used under <ResumePdfProvider>');
  }
  return v;
}
