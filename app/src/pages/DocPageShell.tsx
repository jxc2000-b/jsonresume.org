import type { ReactNode } from 'react';

const DOC_FONT =
  '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif';

const SHELL =
  'h-full w-full overflow-auto px-[72px] py-[64px] text-[10pt] leading-snug text-black';

type ShellProps = {
  title: string;
  lede?: string;
  children: ReactNode;
};

/**
 * Full-sheet document shell matching `WelcomePage` margins and type (serif, ~1"
 * style padding). For standalone tool / placeholder pages in the same viewer.
 */
export function DocPageShell({ title, lede, children }: ShellProps) {
  return (
    <div className={SHELL} style={{ fontFamily: DOC_FONT }}>
      <header className="text-center">
        <h1 className="text-[22pt] font-bold tracking-tight">{title}</h1>
        {lede ? (
          <p className="mt-2 max-w-xl mx-auto text-center text-[11pt] text-neutral-700 leading-normal">
            {lede}
          </p>
        ) : null}
      </header>

      <div className="h-3" />

      {children}
    </div>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 first:mt-0">
      <h2 className="text-[13pt] font-bold uppercase tracking-wide">{title}</h2>
      <hr className="mt-0.5 mb-1 border-t border-black" />
      {children}
    </section>
  );
}

export function DocBullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function DocLineBreak() {
  return <div className="h-3" />;
}
