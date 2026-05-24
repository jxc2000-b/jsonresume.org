import { DocBullets, DocLineBreak, DocPageShell, DocSection } from './DocPageShell';

export default function VersionViewer() {
  return (
    <DocPageShell
      title="Version viewer"
      lede="Inspect named snapshots taken from your master: what each version includes, when it was last updated, and how it differs from the others."
    >
      <DocSection title="Planned experience">
        <p>
          Every tailored résumé is a version derived from the same master. Here
          you’ll open a list of versions, see their section checklist and
          metadata, and open a read-only or diff view against another version or
          the master—handy when you are juggling many applications.
        </p>
        <DocBullets
          items={[
            'Version list: name, last edited, and target role or employer, if you’ve set them.',
            'Section coverage: at a glance, which blocks this version still pulls from the master.',
            'Compare: side-by-side or inline diff of JSON slices or rendered pages (as the app grows).',
          ]}
        />
      </DocSection>

      <DocLineBreak />

      <DocSection title="Status">
        <p className="italic text-neutral-600">No version data is hooked up yet—this is the book layout for the real viewer.</p>
      </DocSection>
    </DocPageShell>
  );
}
