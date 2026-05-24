import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Inherits typography from the parent (e.g. a surrounding `<p>`) so the line
 * reads normally. `inline` + zero box so it doesn’t add line gaps.
 *
 * Do **not** put a `<p>` inside this button (invalid: `<p>` must not wrap flow
 * blocks inside a phrasing-only button). Use text or `<span>` as children, or
 * place the button *inside* a paragraph: `<p>… <TextButton>…</TextButton></p>`.
 */
const TEXT_BTN =
  'm-0 box-border inline h-auto min-h-0 border-0 bg-transparent p-0 ' +
  'align-baseline font-inherit text-inherit leading-inherit ' +
  'text-current transition-colors ' +
  'hover:text-neutral-500 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'appearance-none';

type Props = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function TextButton({ children, className = '', type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`${TEXT_BTN} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
