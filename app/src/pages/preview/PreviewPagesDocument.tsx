import type { ReactNode } from 'react';

/**
 * The PREVIEW surface as a single continuous document, broken into
 * atomic blocks. Mirrors `EditPagesDocument` in shape — the preview
 * paginator treats each entry as atomic, so keep blocks granular.
 *
 * Once the edit surface is wired to real resume state, this module
 * should DERIVE its blocks from the same source (probably by mapping
 * rendered, non-editable React nodes over the resume tree). For now
 * it's a standalone placeholder so the preview section is visibly
 * present in the page flow.
 */

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

export const previewPageBlocks: ReactNode[] = [
  <div
    key="preview-placeholder"
    className="text-[14pt] leading-relaxed text-black"
    style={{ fontFamily: DOC_FONT }}
  >
    <h1 className="text-[22pt] font-bold">Preview</h1>
    <p className="mt-2">
      Placeholder preview block. This is what eventually gets handed to
      the Chromium PDF pipeline.
    </p>
  </div>,
];
