import type { HTMLAttributes } from 'react';

type Props = {
  /** Filled amount from 0 (empty) to 1 (full). */
  value: number;
} & Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'>;

const TRACK = 'w-full h-0.5 rounded-sm bg-neutral-200/90 overflow-hidden';
const FILL = 'h-full bg-black';

/**
 * Static (non-animated) horizontal progress. Thin track with a black fill;
 * `value` is clamped to 0–1.
 */
export function ProgressBar({ value, className = '', ...rest }: Props) {
  const p = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = Math.round(p * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`${TRACK} ${className}`.trim()}
      {...rest}
    >
      <div className={FILL} style={{ width: `${percent}%` }} />
    </div>
  );
}
