/**
 * Welcome page — rendered to look like a LaTeX-typeset resume for the
 * project itself ("Resume-Tree"). Follows the Jake's-Resume layout pattern
 * from `notes.md` verbatim: centered name + underlined contact line, then
 * left-aligned bold section headers with full-width rule dividers and
 * two-column (left-aligned / right-aligned) entry headers.
 *
 * Typography:
 * - Computer Modern serif at ~12pt body size.
 * - Computer Modern isn't installed on typical systems; the stack falls
 *   back through Latin Modern → CMU Serif → Georgia → Times. For an
 *   exact match, load the `cmu-serif` webfont via @font-face in styles.css
 *   and bump this stack.
 *
 * Sizing:
 * - 1" PDF-style margins (`px-[72px] py-[64px]`).
 * - Text flows naturally; if the content overflows the A4 page sheet it
 *   is clipped (MainViewport sets `overflow-hidden` on each sheet).
 */
export default function WelcomePage() {
  return (
    <div
      className="h-full w-full px-[72px] py-[64px] text-[10pt] leading-snug text-black"
      style={{
        fontFamily:
          '"Latin Modern Roman", "CMU Serif", "Computer Modern", Georgia, "Times New Roman", Times, serif',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="text-center">
        <h1 className="text-[22pt] font-bold tracking-tight">Resume-Tree</h1>
        <div className="flex items-center justify-center">
          <p className="mt-1 text-[11pt] underline decoration-black underline-offset-2">123-456-7890</p>
        <p className="mt-1 text-[11pt] ml-2.5px">‎ | ‎ </p>
        <a href="https://github.com/jxc2000-b" className="mt-1 text-[11pt] underline decoration-black underline-offset-2">github</a>
        <p className="mt-1 text-[11pt] ml-2.5px">‎ | ‎ </p>
        <p className="mt-1 text-[11pt] underline decoration-black underline-offset-2">opensource</p>
        <p className="mt-1 text-[11pt] ml-2.5px">‎ | ‎ </p>
        <p className="mt-1 text-[11pt] underline decoration-black underline-offset-2">built with
        jsonresume and rendercv</p>
        </div>
        
      </header>

      <LineBreak />

      {/* ── ABOUT ──────────────────────────────────────────────────── */}
      <Section title="About">
        <EntryHeader left="This is not a PDF" right="Georgetown, TX" />
        <EntrySubheader
          left="Just a website made to look like one :),‎ B.S. in Computer Science"
          right="Apr. 2026 – Current"
        />
        <EntryHeader left="Your data is not being stored" right="Bryan, TX" />
        <EntrySubheader
          left="Ever,‎ Associate’s in Philosophy"
          right="Apr. 2026 – May 2018"
        />
      </Section>

      <LineBreak />

      {/* ── WELCOME ────────────────────────────────────────────────── */}
      <Section title="Welcome">
        <EntryHeader left="What It Does" right="Present" />
        <EntrySubheader left="Texas A&M University" right="College Station, TX" />
        <Bullets
          items={[
            'This is a resume workspace. You maintain one long master resume here, then spin off tailored versions of it for specific jobs.',
            'The app never modifies your master — each version is a separate document derived from it.',
            'When you’re ready, the version compiles into a PDF that looks exactly like the preview you’ve been editing.',
            'Everything is JSON Resume schema, so your data stays portable.',
            'Export, move providers, or throw the whole thing at a different tool — nothing is locked in.',
          ]}
        />

        <div className="mt-3" />
        <EntryHeader left="Getting started" right="Present" />
        <EntrySubheader left="Southwestern University" right="Georgetown, TX" />
        <Bullets
          items={[
            'Upload your previous workspace or create and fill in your basics: name, contact, a short summary.',
            'Add your full work history, education, skills, projects. Don’t self-edit — put everything in. The master is supposed to be long.',
            'Click New Version, give it a name (e.g. “Acme — Senior Backend”), and start removing or reordering sections for that specific application.',
            'Preview updates live in the viewer to your right. When the layout looks right, Download as PDF.',
          ]}
        />
      </Section>

      <LineBreak />

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <Section title="Features">
        <p className="font-bold italic">
          Lorem Ipsum | Python, Flask, React, PostgreSQL, Docker{' '}
          <span className="font-normal not-italic float-right">
            June 2020 – Present
          </span>
        </p>
        <Bullets
          items={[
            'Master + versions. One source of truth, unlimited derived resumes. Versions remember which sections they include; editing the master propagates into them where it makes sense.',
            'Live PDF-accurate preview. What you see in the viewer is the PDF. No separate render step, no surprises at download time.',
            'Rule-based filtering. Mark sections with tags (e.g. “backend”, “leadership”) and build a version with a one-line rule like “only sections tagged backend”. Good for quickly producing a first-draft version.',
            'Theme switching. Swap themes without changing your data. Every version can use a different theme if you want.',
            'ATS hints. Inline checks flag things applicant tracking systems commonly mishandle — missing contact fields, unusual date formats, empty sections — before you submit.',
            'Local-first. Your resume lives on your machine. Sync is opt-in.',
          ]}
        />
      </Section>

      {/* ── WHERE THIS IS GOING ────────────────────────────────────── */}
      <Section title="Tools">
        <p>
          <span className="font-semibold">ATS Validator:</span> coming soon, Python, C/C++,
          SQL (Postgres), JavaScript, HTML/CSS, R
        </p>
        <p>
          <span className="font-semibold">Rules based Pruner:</span> coming soon, Node.js,
          Flask, JUnit, WordPress, Material-UI, FastAPI
        </p>
        <p>
          <span className="font-semibold">AI Based Builder:</span> coming soon, Docker,
          TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm,
          IntelliJ, Eclipse
        </p>
        <p>
          <span className="font-semibold">Version Viewer:</span> coming soon, NumPy,
          Matplotlib
        </p>
      </Section>
    </div>
  );
}

/* ─────────────────────────── Primitives ─────────────────────────── */

function Section({
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

function EntryHeader({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-semibold">{left}</span>
      <span>{right}</span>
    </div>
  );
}

function EntrySubheader({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-baseline justify-between italic">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function LineBreak() {
  return <div className="h-3" />;
}
