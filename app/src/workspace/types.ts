import type { SectionId } from '../types/uiSchema';

/**
 * Wrapper document for the in-app “workspace” (not pure JSON Resume — has
 * `master`, `versions`, etc.). `master` is stored as a loose object so
 * extra keys (e.g. `website` on basics) are preserved.
 */
export interface WorkspaceV1 {
  $schema?: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  /** Current résumé payload; top-level keys align with JSON Resume sections. */
  master: Record<string, unknown>;
  versions?: unknown[];
}

export function isWorkspaceV1(x: unknown): x is WorkspaceV1 {
  if (x === null || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.version === 'number' &&
    o.master !== null &&
    typeof o.master === 'object' &&
    !Array.isArray(o.master)
  );
}

/**
 * Read one section from `master` (arrays, objects, or undefined if missing).
 */
export function getMasterSection(
  document: WorkspaceV1,
  id: SectionId,
): unknown {
  return document.master[id];
}
