import { GlobalWorkerOptions } from 'pdfjs-dist';
// Vite resolves the worker to a URL served from the app bundle.
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let ready = false;

export function ensurePdfjsWorker(): void {
  if (ready) return;
  GlobalWorkerOptions.workerSrc = pdfWorker;
  ready = true;
}
