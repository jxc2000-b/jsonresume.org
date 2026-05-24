import { DocBullets, DocLineBreak, DocPageShell, DocSection } from './DocPageShell';

export default function AIBasedPruner() {
  return (
    <DocPageShell
      title="AI-assisted pruner"
      lede="Use a model to suggest what to cut or rephrase for a specific job, while you stay in the loop—edits are proposals, not silent rewrites of your master."
    >
      <DocSection title="Intended use">
        <p>
          Paste a job description, pick a derived version, and get ranked
          suggestions: which bullets to shorten, which projects to deprioritize,
          or which skills to move up. The goal is a tighter fit, not a
          generic AI résumé; your voice and facts stay in charge.
        </p>
        <DocBullets
          items={[
            'Proposals only: accept, reject, or edit each suggested change before it lands in the version.',
            'Grounded in your data: the master JSON stays the source; the AI does not invent employers or degrees.',
            'Optional tone controls: stricter for finance, more narrative for product—when the wiring exists.',
          ]}
        />
      </DocSection>

      <DocLineBreak />

      <DocSection title="Status">
        <p className="italic text-neutral-600">Model integration and review UI are not live yet—this page is a structural placeholder.</p>
      </DocSection>
    </DocPageShell>
  );
}
