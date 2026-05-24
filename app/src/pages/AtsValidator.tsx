import { useAtsScore } from '../ats/useAtsScore';
import type { AtsCheck, AtsIssue } from '../ats/types';
import { DocLineBreak, DocPageShell, DocSection } from './DocPageShell';

function scoreTone(score: number): string {
  if (score >= 90) return 'text-green-800';
  if (score >= 75) return 'text-emerald-800';
  if (score >= 60) return 'text-amber-800';
  return 'text-red-800';
}

function severityLabel(severity: AtsIssue['severity']): string {
  if (severity === 'critical') return 'Critical';
  if (severity === 'warning') return 'Warning';
  return 'Info';
}

function CheckRow({ check }: { check: AtsCheck }) {
  const pct = check.maxScore > 0 ? Math.round((check.score / check.maxScore) * 100) : 0;
  return (
    <div className="mt-2 border-b border-neutral-200 pb-2 last:border-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{check.name}</span>
        <span className="tabular-nums text-neutral-600">
          {check.score}/{check.maxScore} ({pct}%)
          {check.passed ? ' ✓' : ''}
        </span>
      </div>
      {check.issues.length > 0 && (
        <ul className="mt-1 list-none space-y-1 pl-0 text-[9pt]">
          {check.issues.map((issue, i) => (
            <li key={i} className="text-neutral-700">
              <span className="font-medium uppercase tracking-wide text-neutral-500">
                {severityLabel(issue.severity)}
              </span>
              {' — '}
              {issue.message}
              {issue.fix ? (
                <span className="block pl-2 text-neutral-600 italic">{issue.fix}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AtsValidator() {
  const { status, result, error } = useAtsScore();

  return (
    <DocPageShell
      title="ATS validator"
      lede="Scores your committed master résumé JSON for common applicant-tracking structure issues—contact fields, work history shape, dates, skills, and keywords. Uses the same data that feeds PDF generation."
    >
      {status === 'loading' && (
        <DocSection title="Analysis">
          <p className="text-neutral-600">Loading workspace…</p>
        </DocSection>
      )}

      {status === 'error' && (
        <DocSection title="Analysis">
          <p className="text-red-700">{error}</p>
        </DocSection>
      )}

      {status === 'ready' && result && (
        <>
          <DocSection title="Overall score">
            <p className={`text-[18pt] font-bold tabular-nums ${scoreTone(result.score)}`}>
              {result.score}/100 — {result.rating}
            </p>
            <p className="mt-2 text-[10pt] leading-normal text-neutral-800">{result.summary}</p>
            <p className="mt-2 text-[9pt] text-neutral-500">
              Based on saved master data. Edit sections and click Save to refresh this score.
              PDF parseability is not tested here—your export uses selectable text via pdf-lib.
            </p>
          </DocSection>

          <DocLineBreak />

          <DocSection title="Checks">
            {result.checks.map((check) => (
              <CheckRow key={check.name} check={check} />
            ))}
          </DocSection>

          {result.recommendations.length > 0 && (
            <>
              <DocLineBreak />
              <DocSection title="All recommendations">
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[9pt]">
                  {result.recommendations.map((issue, i) => (
                    <li key={i}>
                      <span className="font-medium">{severityLabel(issue.severity)}:</span>{' '}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </DocSection>
            </>
          )}
        </>
      )}
    </DocPageShell>
  );
}
