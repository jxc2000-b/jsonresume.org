import { TextButton } from '@/components/TextButton';
import Hint from '../components/Hint';
import { Section, EntryHeader, EntrySubheader, Bullets, LineBreak } from './pageHelpers';
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
        <p className="mt-1 text-[11pt] underline decoration-black underline-offset-2">Built with jsonresume and rendercv.</p>
           {/* <Hint content="JSON data format for résumés.">Built with jsonresume and rendercv.</Hint></p> */}
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
            'The app never modifies your master, each version is a separate document derived from it.',
            'When you’re ready, the version compiles into a PDF that looks exactly like the preview you’ve been editing.',
            'Everything is JSON Resume schema (popular standard for resumes), so your data stays portable.',
            'Export, move providers, or throw the whole thing at a different tool, nothing is locked in.',
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
            'Preview updates live in the viewer some pages below. When the layout looks right, Download as PDF.',
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
            'Master + versions. One source of truth, unlimited derived resumes. Versions remember which sections they include and their targets; editing the master propagates into them where it makes sense.',
            'Live PDF-accurate preview. What you see in the viewer is the PDF. No separate render step, no surprises at download time.',
          ]}
        />
        <p className="font-bold italic">
        Dolor sit amet | Python, Flask, React, PostgreSQL, Docker{' '}
          <span className="font-normal not-italic float-right">
            June 2020 – Present
          </span>
        </p>
        <Bullets
          items={[
            'Rule-based filtering. Eventually you will be able to programmtically version your resume, better than AI slop generated bullets, Pangram can detect those .',
            'Theme switching. Swap themes without changing your data actually youre probs gonna need to change some data to swap themes.',
            'ATS hints validation. Found some ATS validation code in json resume so fuck it why not',
            'Local-first, no perma store, download your master document in json format',
          ]}
        />
      </Section>

      {/* ── WHERE THIS IS GOING ────────────────────────────────────── */}
      <Section title="Tools">
        <p>
        <TextButton type="button">
          <span className="font-semibold">ATS Validator:</span>
          </TextButton> &lt;-- clickable, coming soon, Python, C/C++,
          SQL (Postgres), JavaScript, HTML/CSS, R
        </p>
        <p>
        <TextButton type="button">
          <span className="font-semibold">Rules based Pruner:</span>
        </TextButton> coming soon, Node.js,
          Flask, JUnit, WordPress, Material-UI, FastAPI
        </p>
        <p>
        <TextButton type="button">
          <span className="font-semibold">AI Based Builder:</span>
        </TextButton> coming soon, Docker</p>
        <p>
        <TextButton type="button">
          <span className="font-semibold">Version Viewer:</span>
        </TextButton> coming soon, NumPy, Matplotlib</p>
      </Section>
    </div>
  );
}

/* ─────────────────────────── Primitives ─────────────────────────── */

