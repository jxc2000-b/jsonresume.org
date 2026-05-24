import { useMemo } from 'react';
import { calculateATSScore as calculateATSScoreRaw } from '@lib/ats/scoring.js';
import { useWorkspace } from '../workspace/WorkspaceContext';
import type { AtsScoreResult } from './types';

/** Theme token passed to `checkThemeCompatibility` for the client pdf-lib layout. */
export const CLIENT_PDF_THEME = 'client-pdf-lib';

const calculateATSScore = calculateATSScoreRaw as unknown as (
  resume: Record<string, unknown>,
  options?: { theme?: string; html?: string },
) => AtsScoreResult;

export type AtsScoreState =
  | { status: 'loading'; result: null; error: null }
  | { status: 'error'; result: null; error: string }
  | { status: 'ready'; result: AtsScoreResult; error: null };

/**
 * Runs JSON-structure ATS scoring on committed `document.master` whenever the
 * workspace loads or after Save bumps `dataEpoch`. Same source as PDF generation.
 */
export function useAtsScore(): AtsScoreState {
  const { status, document, dataEpoch, error: wsError } = useWorkspace();

  return useMemo(() => {
    if (status === 'loading') {
      return { status: 'loading', result: null, error: null };
    }
    if (status === 'error') {
      return {
        status: 'error',
        result: null,
        error: wsError ?? 'Failed to load workspace',
      };
    }
    if (!document) {
      return { status: 'error', result: null, error: 'No workspace document' };
    }
    try {
      const result = calculateATSScore(document.master, {
        theme: CLIENT_PDF_THEME,
      });
      return { status: 'ready', result, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ATS scoring failed';
      return { status: 'error', result: null, error: message };
    }
    // dataEpoch: re-score after Save commits staged edits into master
  }, [status, document, dataEpoch, wsError]);
}
