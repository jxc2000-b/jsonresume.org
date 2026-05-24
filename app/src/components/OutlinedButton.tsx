import type { ButtonHTMLAttributes, ReactNode } from 'react';

const OUTLINED =
  'inline-flex items-center justify-center border border-neutral-500 bg-white px-4 py-2 ' +
  'text-[11pt] font-medium text-black shadow-sm transition-colors ' +
  'hover:bg-neutral-100 active:bg-neutral-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ' +
  'rounded-md disabled:cursor-not-allowed disabled:opacity-50';

type Props = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Bordered, slightly rounded button; re-use for toolbar-style actions
 * on document sheets (e.g. edit surface header).
 */
export function OutlinedButton({ children, className = '', type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`${OUTLINED} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
