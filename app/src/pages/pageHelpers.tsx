export function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section className="mt-4">
        <h2 className="text-[13pt] font-bold uppercase tracking-wide">{title}</h2>
        <hr className="mt-0.5 mb-1 border-t border-black" />
        {children}
      </section>
    );
  }
  
export function EntryHeader({ left, right }: { left: string; right: string }) {
    return (
    <div className="flex items-baseline justify-between">
        <span className="font-semibold">{left}</span>
        <span>{right}</span>
    </div>
    );
}

export function EntrySubheader({ left, right }: { left: string; right: string }) {
return (
    <div className="flex items-baseline justify-between italic">
    <span>{left}</span>
    <span>{right}</span>
    </div>
);
}

export function Bullets({ items }: { items: string[] }) {
return (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
    {items.map((item, i) => (
        <li key={i}>{item}</li>
    ))}
    </ul>
);
}

export function LineBreak() {
return <div className="h-3" />;
}
