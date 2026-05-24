/** Shape returned by `lib/ats` checks (mirrors JS module output). */
export type AtsIssue = {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
};

export type AtsCheck = {
  name: string;
  score: number;
  maxScore: number;
  issues: AtsIssue[];
  passed: boolean;
};

export type AtsScoreResult = {
  score: number;
  rating: string;
  checks: AtsCheck[];
  recommendations: AtsIssue[];
  summary: string;
};
