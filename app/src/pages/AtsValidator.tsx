import { DocBullets, DocLineBreak, DocPageShell, DocSection } from './DocPageShell';

export default function AtsValidator() {
  return (
    <DocPageShell
      title="ATS validator"
      lede="A quick read on whether your résumé is likely to survive common applicant-tracking pipelines—structure, text, and obvious red flags that parsers choke on."
    >
      <DocSection title="What you’ll get here">
        <p>
          This tool is meant to flag issues before you send a version: headings that
          look like body text, tables that collapse to nothing, image-only
          contact blocks, and similar ATS-unfriendly choices. It does not
          auto-fix your file; it tells you what to change.
        </p>
        <DocBullets
          items={[
            'Check text extraction: can a plain machine read your dates, job titles, and company names in order?',
            'Highlight risky formatting: text boxes, multi-column layouts, or embedded graphics where text should be.',
            'Note keyword gaps vs. a target role when you point it at a job description (future).',
          ]}
        />
      </DocSection>

      <DocLineBreak />

      <DocSection title="Status">
        <p className="italic text-neutral-600">Not wired to a backend yet—this page is the shell for the real validator.</p>
      </DocSection>
    </DocPageShell>
  );
}
