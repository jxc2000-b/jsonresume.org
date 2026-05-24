import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type {
  ClientAward,
  ClientCertificate,
  ClientEducation,
  ClientLanguage,
  ClientPublication,
  ClientResume,
  ClientSkill,
  ClientVolunteer,
  ClientWork,
} from './clientResumeTypes';
import { lineHeight, sanitizeForWinAnsi, wrapText } from './layoutText';

/* ── Page + typography geometry (points, A4) ─────────────────────────── */

const PAGE_W = 595.28;
const PAGE_H = 841.89;

const MARGIN_X = 54; // ~0.75"
const MARGIN_Y = 54;

const COLOR_BLACK = rgb(0, 0, 0);
const COLOR_RULE = rgb(0.15, 0.15, 0.15);

const FS_NAME = 22;
const FS_CONTACT = 10;
const FS_SECTION = 12;
const FS_ENTRY = 11;
const FS_BODY = 10;

const GAP_SECTION = 10;
const GAP_ENTRY = 6;
const BULLET_INDENT = 14;

type Fonts = { body: PDFFont; bold: PDFFont; italic: PDFFont };

interface Cursor {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;
}

/* ── Cursor + flow primitives ────────────────────────────────────────── */

function newPage(c: Cursor): void {
  c.page = c.doc.addPage([PAGE_W, PAGE_H]);
  c.y = PAGE_H - MARGIN_Y;
}

function ensureSpace(c: Cursor, needed: number): void {
  if (c.y - needed < MARGIN_Y) newPage(c);
}

function drawLine(c: Cursor, text: string, font: PDFFont, size: number, x = MARGIN_X): void {
  const h = lineHeight(size);
  ensureSpace(c, h);
  c.page.drawText(sanitizeForWinAnsi(text), {
    x,
    y: c.y - size,
    size,
    font,
    color: COLOR_BLACK,
  });
  c.y -= h;
}

function drawWrapped(
  c: Cursor,
  text: string,
  font: PDFFont,
  size: number,
  x = MARGIN_X,
  maxWidth = PAGE_W - MARGIN_X * 2,
): void {
  for (const line of wrapText(sanitizeForWinAnsi(text), font, size, maxWidth)) {
    drawLine(c, line, font, size, x);
  }
}

function drawSectionHeader(c: Cursor, title: string): void {
  const h = lineHeight(FS_SECTION) + 6;
  // Keep header attached to at least one following line (orphan prevention).
  ensureSpace(c, h + lineHeight(FS_BODY));
  c.y -= GAP_SECTION;
  c.page.drawText(sanitizeForWinAnsi(title.toUpperCase()), {
    x: MARGIN_X,
    y: c.y - FS_SECTION,
    size: FS_SECTION,
    font: c.fonts.bold,
    color: COLOR_BLACK,
  });
  c.y -= FS_SECTION + 2;
  c.page.drawLine({
    start: { x: MARGIN_X, y: c.y },
    end: { x: PAGE_W - MARGIN_X, y: c.y },
    thickness: 0.6,
    color: COLOR_RULE,
  });
  c.y -= 6;
}

function drawTwoCol(
  c: Cursor,
  left: string,
  right: string,
  size: number,
  font: PDFFont,
): void {
  const h = lineHeight(size);
  ensureSpace(c, h);
  c.page.drawText(sanitizeForWinAnsi(left), {
    x: MARGIN_X,
    y: c.y - size,
    size,
    font,
    color: COLOR_BLACK,
  });
  const rightW = c.fonts.body.widthOfTextAtSize(sanitizeForWinAnsi(right), size);
  c.page.drawText(sanitizeForWinAnsi(right), {
    x: PAGE_W - MARGIN_X - rightW,
    y: c.y - size,
    size,
    font: c.fonts.body,
    color: COLOR_BLACK,
  });
  c.y -= h;
}

function drawBullets(c: Cursor, items: string[]): void {
  const maxW = PAGE_W - MARGIN_X * 2 - BULLET_INDENT;
  for (const item of items) {
    const lines = wrapText(
      sanitizeForWinAnsi(item),
      c.fonts.body,
      FS_BODY,
      maxW,
    );
    if (lines.length === 0) continue;
    ensureSpace(c, lineHeight(FS_BODY));
    c.page.drawText('-', {
      x: MARGIN_X,
      y: c.y - FS_BODY,
      size: FS_BODY,
      font: c.fonts.body,
      color: COLOR_BLACK,
    });
    for (let i = 0; i < lines.length; i++) {
      drawLine(c, lines[i] ?? '', c.fonts.body, FS_BODY, MARGIN_X + BULLET_INDENT);
    }
  }
}

/* ── Section renderers ───────────────────────────────────────────────── */

function fmtRange(start?: string, end?: string): string {
  const s = start?.slice(0, 7) ?? '';
  const e = end?.slice(0, 7) ?? '';
  if (!s && !e) return '';
  if (s && e) return `${s} - ${e}`;
  if (s) return `${s} - Present`;
  return e;
}

function renderHeader(c: Cursor, basics: ClientResume['basics']): void {
  if (basics.name) {
    ensureSpace(c, lineHeight(FS_NAME));
    const w = c.fonts.bold.widthOfTextAtSize(
      sanitizeForWinAnsi(basics.name),
      FS_NAME,
    );
    c.page.drawText(sanitizeForWinAnsi(basics.name), {
      x: (PAGE_W - w) / 2,
      y: c.y - FS_NAME,
      size: FS_NAME,
      font: c.fonts.bold,
      color: COLOR_BLACK,
    });
    c.y -= lineHeight(FS_NAME);
  }
  if (basics.label) {
    const w = c.fonts.italic.widthOfTextAtSize(
      sanitizeForWinAnsi(basics.label),
      FS_CONTACT,
    );
    ensureSpace(c, lineHeight(FS_CONTACT));
    c.page.drawText(sanitizeForWinAnsi(basics.label), {
      x: (PAGE_W - w) / 2,
      y: c.y - FS_CONTACT,
      size: FS_CONTACT,
      font: c.fonts.italic,
      color: COLOR_BLACK,
    });
    c.y -= lineHeight(FS_CONTACT);
  }
  const contactBits = [
    basics.email,
    basics.phone,
    basics.url,
    basics.location?.city,
    basics.location?.region,
  ].filter((v): v is string => Boolean(v));
  if (contactBits.length) {
    const text = contactBits.join('  •  ');
    const w = c.fonts.body.widthOfTextAtSize(sanitizeForWinAnsi(text), FS_CONTACT);
    ensureSpace(c, lineHeight(FS_CONTACT));
    c.page.drawText(sanitizeForWinAnsi(text), {
      x: (PAGE_W - w) / 2,
      y: c.y - FS_CONTACT,
      size: FS_CONTACT,
      font: c.fonts.body,
      color: COLOR_BLACK,
    });
    c.y -= lineHeight(FS_CONTACT);
  }
  if (basics.summary) {
    c.y -= 4;
    drawWrapped(c, basics.summary, c.fonts.body, FS_BODY);
  }
}

function renderWork(c: Cursor, rows: ClientWork[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Experience');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    if (i > 0) c.y -= GAP_ENTRY;
    const left = [r.position, r.name].filter(Boolean).join(' - ');
    drawTwoCol(c, left || r.name || '', fmtRange(r.startDate, r.endDate), FS_ENTRY, c.fonts.bold);
    if (r.summary) drawWrapped(c, r.summary, c.fonts.body, FS_BODY);
    if (r.highlights.length) drawBullets(c, r.highlights);
  }
}

function renderVolunteer(c: Cursor, rows: ClientVolunteer[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Volunteer');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    if (i > 0) c.y -= GAP_ENTRY;
    const left = [r.position, r.organization].filter(Boolean).join(' - ');
    drawTwoCol(c, left || r.organization || '', fmtRange(r.startDate, r.endDate), FS_ENTRY, c.fonts.bold);
    if (r.summary) drawWrapped(c, r.summary, c.fonts.body, FS_BODY);
    if (r.highlights.length) drawBullets(c, r.highlights);
  }
}

function renderEducation(c: Cursor, rows: ClientEducation[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Education');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    if (i > 0) c.y -= GAP_ENTRY;
    const left = [r.studyType, r.area && `in ${r.area}`].filter(Boolean).join(' ');
    const top = [r.institution, left].filter(Boolean).join(' - ');
    drawTwoCol(c, top || (r.institution ?? ''), fmtRange(r.startDate, r.endDate), FS_ENTRY, c.fonts.bold);
    if (r.score) drawLine(c, `GPA / Score: ${r.score}`, c.fonts.body, FS_BODY);
    if (r.courses.length) drawWrapped(c, `Courses: ${r.courses.join(', ')}`, c.fonts.body, FS_BODY);
  }
}

function renderSkills(c: Cursor, rows: ClientSkill[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Skills');
  for (const r of rows) {
    const label = [r.name, r.level && `(${r.level})`].filter(Boolean).join(' ');
    const kw = r.keywords.join(', ');
    const line = label && kw ? `${label}: ${kw}` : label || kw;
    if (line) drawWrapped(c, line, c.fonts.body, FS_BODY);
  }
}

function renderAwards(c: Cursor, rows: ClientAward[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Awards');
  for (const r of rows) {
    const left = [r.title, r.awarder && `- ${r.awarder}`].filter(Boolean).join(' ');
    drawTwoCol(c, left, r.date?.slice(0, 7) ?? '', FS_ENTRY, c.fonts.bold);
    if (r.summary) drawWrapped(c, r.summary, c.fonts.body, FS_BODY);
  }
}

function renderCerts(c: Cursor, rows: ClientCertificate[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Certificates');
  for (const r of rows) {
    const left = [r.name, r.issuer && `- ${r.issuer}`].filter(Boolean).join(' ');
    drawTwoCol(c, left, r.date?.slice(0, 7) ?? '', FS_ENTRY, c.fonts.bold);
  }
}

function renderPubs(c: Cursor, rows: ClientPublication[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Publications');
  for (const r of rows) {
    const left = [r.name, r.publisher && `- ${r.publisher}`].filter(Boolean).join(' ');
    drawTwoCol(c, left, r.releaseDate?.slice(0, 7) ?? '', FS_ENTRY, c.fonts.bold);
    if (r.summary) drawWrapped(c, r.summary, c.fonts.body, FS_BODY);
  }
}

function renderLangs(c: Cursor, rows: ClientLanguage[]): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Languages');
  const line = rows
    .map((r) => [r.language, r.fluency].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join('  •  ');
  if (line) drawWrapped(c, line, c.fonts.body, FS_BODY);
}

function renderProjects(c: Cursor, rows: ClientResume['projects']): void {
  if (rows.length === 0) return;
  drawSectionHeader(c, 'Projects');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    if (i > 0) c.y -= GAP_ENTRY;
    drawTwoCol(c, r.name ?? '', fmtRange(r.startDate, r.endDate), FS_ENTRY, c.fonts.bold);
    if (r.description) drawWrapped(c, r.description, c.fonts.body, FS_BODY);
    if (r.highlights.length) drawBullets(c, r.highlights);
  }
}

/* ── Public API ──────────────────────────────────────────────────────── */

/**
 * Render a `ClientResume` to a real PDF byte array via pdf-lib. Pure browser
 * pipeline: text is laid out with WinAnsi-safe characters and Helvetica
 * standard fonts (no embed), so the output is small and ATS-friendly.
 */
export async function generateResumePdf(resume: ClientResume): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(resume.basics.name ? `${resume.basics.name} - Resume` : 'Resume');
  doc.setProducer('jsonresume.org (client pdf-lib)');
  doc.setCreator('jsonresume.org');

  const fonts: Fonts = {
    body: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  const page = doc.addPage([PAGE_W, PAGE_H]);
  const c: Cursor = { doc, fonts, page, y: PAGE_H - MARGIN_Y };

  renderHeader(c, resume.basics);
  renderWork(c, resume.work);
  renderEducation(c, resume.education);
  renderSkills(c, resume.skills);
  renderProjects(c, resume.projects);
  renderVolunteer(c, resume.volunteer);
  renderAwards(c, resume.awards);
  renderCerts(c, resume.certificates);
  renderPubs(c, resume.publications);
  renderLangs(c, resume.languages);

  return doc.save();
}
