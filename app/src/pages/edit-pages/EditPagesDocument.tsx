import { useState, type ChangeEvent, type ReactNode } from 'react';
import type { SectionId, UiSchema } from '../../types/uiSchema';
import { getMasterSection } from '../../workspace/types';
import { useWorkspace } from '../../workspace/WorkspaceContext';
import { TextButton } from '@/components/TextButton';

/**
 * The EDIT surface as a single continuous document, broken into
 * top-level BLOCKS. The `EditPagePaginator` treats each array entry as
 * atomic — it will never split one block across two pages, so keep
 * blocks granular (one entry per block when you have many) so the
 * packer has enough breakpoints to balance pages.
 *
 * Section order matches `app/schema/schema.json` / workspace `master` keys.
 * `editPageBlocks` is built once at module load: each child calls
 * `useWorkspace()` so data updates when the context reloads the fixture.
 */

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

/** One row per edit “page” — static config; `ResumeSectionForm` pulls data/ui from context. */
const EDIT_PAGE_SECTIONS: { key: string; sectionId: SectionId; title: string }[] = [
  { key: 'form-basics', sectionId: 'basics', title: 'Basics' },
  { key: 'form-work', sectionId: 'work', title: 'Work experience' },
  { key: 'form-volunteer', sectionId: 'volunteer', title: 'Volunteer' },
  { key: 'form-education', sectionId: 'education', title: 'Education' },
  { key: 'form-awards', sectionId: 'awards', title: 'Awards' },
  { key: 'form-certificates', sectionId: 'certificates', title: 'Certificates' },
  { key: 'form-publications', sectionId: 'publications', title: 'Publications' },
  { key: 'form-skills', sectionId: 'skills', title: 'Skills' },
  { key: 'form-languages', sectionId: 'languages', title: 'Languages' },
  { key: 'form-interests', sectionId: 'interests', title: 'Interests' },
  { key: 'form-references', sectionId: 'references', title: 'References' },
  { key: 'form-projects', sectionId: 'projects', title: 'Projects' },
];

function EditDocumentHeader() {
  const { commitStagedToMaster, hasStagedEdits } = useWorkspace();
  return (
    <header
      className="mb-1 flex w-full min-w-0 items-center justify-between gap-3 text-left"
      style={{ fontFamily: DOC_FONT, color: 'black' }}
    >
      <h1 className="shrink-0 text-[22pt] font-bold tracking-tight">Edit Your Resume</h1>
      <div
        className="shrink-0 flex items-baseline justify-end gap-1 text-[10pt] text-inherit"
        style={{ fontFamily: DOC_FONT, color: 'black' }}
      >
        <TextButton type="button" className="text-[10pt]">
          <span className="underline decoration-black underline-offset-2">Preview</span>
        </TextButton>
        <span aria-hidden> / </span>
        <TextButton
          type="button"
          className="text-[10pt]"
          disabled={!hasStagedEdits}
          onClick={() => commitStagedToMaster()}
        >
          <span className="underline decoration-black underline-offset-2">Save</span>
        </TextButton>
      </div>
    </header>
  );
}

// ── Paginator blocks: document header first, then section shells (workspace via hook) ─

export const editPageBlocks: ReactNode[] = [
  <EditDocumentHeader key="edit-doc-header" />,
  ...EDIT_PAGE_SECTIONS.map((row) => (
    <ResumeSectionForm
      key={row.key}
      sectionId={row.sectionId}
      title={row.title}
    />
  )),
];

function SectionJsonEditor({ sectionId }: { sectionId: SectionId }) {
  const { status, document, getSection, setSectionStaged, clearSectionStaged } = useWorkspace();
  const [text, setText] = useState(() => {
    const d = getSection(sectionId);
    return d === undefined ? '' : JSON.stringify(d, null, 2);
  });
  const [parseErr, setParseErr] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const s = e.target.value;
    setText(s);
    if (s.trim() === '') {
      clearSectionStaged(sectionId);
      setParseErr(null);
      if (status === 'ready' && document) {
        const m = getMasterSection(document, sectionId);
        setText(m === undefined ? '' : JSON.stringify(m, null, 2));
      } else {
        setText('');
      }
      return;
    }
    try {
      setSectionStaged(sectionId, JSON.parse(s) as unknown);
      setParseErr(null);
    } catch {
      setParseErr('Invalid JSON');
    }
  };

  return (
    <div>
      <textarea
        className="mt-2 box-border w-full min-h-40 resize-y rounded border border-neutral-200 bg-neutral-50 p-2 font-mono text-[9pt] leading-tight text-neutral-800"
        spellCheck={false}
        value={text}
        onChange={onChange}
        aria-label={`Edit JSON: ${sectionId}`}
      />
      {parseErr && (
        <p className="mt-1 text-[9pt] text-red-600" role="status">
          {parseErr}
        </p>
      )}
    </div>
  );
}

function ResumeSectionForm({
  sectionId,
  title,
}: {
  sectionId: SectionId;
  title: string;
}) {
  const { status, error, sectionUi, dataEpoch } = useWorkspace();
  const sectionHelp = (sectionUi[sectionId] as UiSchema).sectionHelp;

  if (status === 'loading') {
    return (
      <div
        className="resume-form mt-3"
        style={{ fontFamily: DOC_FONT, color: 'black' }}
      >
        <h2 className="text-[13pt] font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-[11pt] text-neutral-500">Loading workspace…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="resume-form mt-3"
        style={{ fontFamily: DOC_FONT, color: 'black' }}
      >
        <h2 className="text-[13pt] font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-[11pt] text-red-600">{error ?? 'Error'}</p>
      </div>
    );
  }

  return (
    <div
      className="resume-form mt-3"
      style={{ fontFamily: DOC_FONT, color: 'black' }}
    >
      <h2 className="text-[13pt] font-bold tracking-tight">{title}</h2>
      {sectionHelp && (
        <p className="mt-1 text-[9pt] text-neutral-500">{sectionHelp}</p>
      )}
      <SectionJsonEditor key={`${sectionId}-${dataEpoch}`} sectionId={sectionId} />
    </div>
  );
}
