import type { ReactNode } from 'react';
import AIBasedPruner from '../AIBasedPruner';
import RulesBasedPruner from '../RulesBasedPruner';
import VersionViewer from '../VersionViewer';

/**
 * Tool pages kept out of the viewer until they are wired up.
 * To show them again, spread `quarantinedToolPages` into `usePageComposition`.
 */
export { default as AIBasedPruner } from '../AIBasedPruner';
export { default as RulesBasedPruner } from '../RulesBasedPruner';
export { default as VersionViewer } from '../VersionViewer';

export const quarantinedToolPages: ReactNode[] = [
  <RulesBasedPruner key="quarantine-rules-pruner" />,
  <AIBasedPruner key="quarantine-ai-pruner" />,
  <VersionViewer key="quarantine-version-viewer" />,
];
