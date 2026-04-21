import type { ReactNode } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { RJSFSchema } from '@rjsf/utils';

/**
 * The EDIT surface as a single continuous document, broken into
 * top-level BLOCKS. The `EditPagePaginator` treats each array entry as
 * atomic — it will never split one block across two pages, so keep
 * blocks granular (one work entry per block, not one whole Work
 * section) so the packer has enough breakpoints to balance pages.
 *
 * ## Why an array, not a component?
 *
 * Block-level pagination needs to introspect the top-level children
 * of the document. Exporting an array sidesteps all `React.Children`
 * / fragment / sub-component walking; the paginator just maps over
 * `editPageBlocks` directly.
 *
 * ## Future shape (rjsf)
 *
 * Each block will become an rjsf `<Form>` bound to the relevant
 * slice of the resume schema — one form per work entry, one per
 * education entry, etc. That change is isolated: swap the stub
 * elements in `editPageBlocks` with `<ResumeSectionForm ... />`
 * components; nothing else in App.tsx or the paginator needs to
 * change.
 */

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

/* ── Entry schema / uiSchema ──────────────────────────────────────────
 * Placeholders for a single resume entry's JSON Schema + rjsf uiSchema.
 * These will eventually be DYNAMICALLY GENERATED — sliced out of
 * `lib/schema.js` per-section (work[], education[], skills[], …) —
 * so the concrete shape below is a stand-in to keep the form rendering
 * while the generator is being built. Keep the names generic
 * (`entrySchema` / `entryUiSchema`) so callers don't grow a dependency
 * on any particular section's shape.
 * ──────────────────────────────────────────────────────────────────── */

const entrySchema: RJSFSchema = {
  title: 'Work Experience',
  type: 'object',
  required: ['name', 'position'],
  properties: {
    name: { type: 'string', title: 'Company' },
    position: { type: 'string', title: 'Position' },
    url: { type: 'string', title: 'Website', format: 'uri' },
    startDate: { type: 'string', title: 'Start date', format: 'date' },
    endDate: { type: 'string', title: 'End date', format: 'date' },
    summary: { type: 'string', title: 'Summary' },
    highlights: {
      type: 'array',
      title: 'Highlights',
      items: { type: 'string' },
    },
  },
};

const entryUiSchema = {
  'ui:submitButtonOptions': { norender: true },
  name: { 'ui:placeholder': 'e.g. Acme Corporation' },
  position: { 'ui:placeholder': 'e.g. Senior Software Engineer' },
  url: { 'ui:placeholder': 'https://acme.com' },
  startDate: { 'ui:placeholder': 'YYYY-MM-DD' },
  endDate: { 'ui:placeholder': 'YYYY-MM-DD (leave blank if current)' },
  summary: {
    'ui:widget': 'textarea',
    'ui:options': { rows: 3 },
    'ui:placeholder': 'Short summary of your role, scope, and team.',
  },
  highlights: {
    items: {
      'ui:placeholder': 'Accomplished X by doing Y, resulting in Z.',
    },
  },
};

// Hand-authored sections (DocHeader, Summary, Work, Education, Skills,
// Projects) were removed so the page shows just the schema-driven form
// for visual iteration. Re-add entries to this array when you want
// them back.
export const editPageBlocks: ReactNode[] = [
  <ResumeSectionForm
    key="form-w0"
    schema={entrySchema}
    uiSchema={entryUiSchema}
  />,
];

function ResumeSectionForm({
  schema,
  uiSchema,
}: {
  schema: RJSFSchema;
  uiSchema?: Record<string, unknown>;
}) {
  return (
    // `resume-form` is a style hook consumed by `styles.css` — all the
    // input/label/button styling lives there so rjsf's unkeyed inner
    // DOM stays theme-able from one place.
    <div
      className="resume-form mt-3"
      style={{ fontFamily: DOC_FONT, color: 'black' }}
    >
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        onChange={() => {
          /* wired to nothing for now */
        }}
      />
    </div>
  );
}
