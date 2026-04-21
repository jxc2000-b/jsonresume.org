import type { ReactNode } from 'react';
import WelcomePage from './pages/WelcomePage';
import AtsValidator from './pages/AtsValidator';
import RulesBasedPruner from './pages/RulesBasedPruner';
import AIBasedPruner from './pages/AIBasedPruner';
import VersionViewer from './pages/VersionViewer';
import { editPageBlocks } from './pages/edit-pages/EditPagesDocument';
import { useEditPagePagination } from './pages/edit-pages/EditPagePaginator';
import { previewPageBlocks } from './pages/preview/PreviewPagesDocument';
import { usePreviewPagePagination } from './pages/preview/PreviewPagePaginator';

/**
 * Shared page composition. Both DesktopApp and MobileApp call this —
 * whichever surface is mounted runs the paginators and assembles the
 * final flat `pages` array the viewer iterates over.
 *
 * Page order (identical on both surfaces):
 *
 *   1. WelcomePage                  — hand-authored cover / intro
 *   2. edit pages                   — paginated, from `editPageBlocks`
 *   3. preview pages                — paginated, from `previewPageBlocks`
 *   4. AtsValidator                 — single static page
 *   5. RulesBasedPruner             — single static page
 *   6. AIBasedPruner                — single static page
 *   7. VersionViewer                — single static page
 *
 * The two paginators each return a hidden measurer node. Both must be
 * mounted somewhere stable in the tree; the caller is responsible for
 * rendering `measurers` inside the surface's root.
 *
 * No React `key` props on the elements below — the consumers (Desktop
 * and Mobile viewports) wrap each page in a `<div key={i}>` before
 * rendering, which is what React actually reconciles against. Keys
 * on the inner elements would be ignored.
 */
export function usePageComposition(): {
  pages: ReactNode[];
  pageCount: number;
  measurers: ReactNode;
} {
  const { measurer: editMeasurer, pages: editPages } =
    useEditPagePagination(editPageBlocks);
  const { measurer: previewMeasurer, pages: previewPages } =
    usePreviewPagePagination(previewPageBlocks);

  const pages: ReactNode[] = [
    <WelcomePage />,
    ...editPages,
    ...previewPages,
    <AtsValidator />,
    <RulesBasedPruner />,
    <AIBasedPruner />,
    <VersionViewer />,
  ];

  const measurers: ReactNode = (
    <>
      {editMeasurer}
      {previewMeasurer}
    </>
  );

  return { pages, pageCount: pages.length, measurers };
}
