import { DocBullets, DocLineBreak, DocPageShell, DocSection } from './DocPageShell';

export default function RulesBasedPruner() {
  return (
    <DocPageShell
      title="Rule-based pruner"
      lede="Trim a version of your master résumé with explicit rules you control—keep or drop sections, cap length, and match keywords without guessing."
    >
      <DocSection title="How it will work">
        <p>
          You’ll define conditions on top of your JSON Resume data: include only
          certain skills for this industry, remove volunteer work when a role is
          senior, or enforce a one-page cap by dropping the lowest-priority
          blocks first. Everything stays explainable: no black box, just “if
          this, then that.”
        </p>
        <DocBullets
          items={[
            'Per-version rule sets: save presets like “Acme — backend” and reuse them on the next application.',
            'Order and visibility: mark sections as required, optional, or cut first when space runs out.',
            'Length targets: max bullets per job, or max lines in the work section, applied predictably.',
          ]}
        />
      </DocSection>

      <DocLineBreak />

      <DocSection title="Status">
        <p className="italic text-neutral-600">Rule engine UI and evaluation are not connected yet—placeholder layout only.</p>
      </DocSection>
    </DocPageShell>
  );
}
