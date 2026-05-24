import type { PDFFont } from 'pdf-lib';

/**
 * Wrap `text` into lines that each fit `maxWidth` when drawn in `font` at
 * `size`. Whitespace-normalised; long words that exceed `maxWidth` on their
 * own are hard-broken so the layout never gets stuck.
 */
export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0) return [];

  const words = cleaned.split(' ');
  const lines: string[] = [];
  let current = '';

  const measure = (s: string) => font.widthOfTextAtSize(s, size);

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
      current = '';
    }
    if (measure(word) <= maxWidth) {
      current = word;
      continue;
    }
    // Hard-break an oversized word into chunks that fit.
    let chunk = '';
    for (const ch of word) {
      const next = chunk + ch;
      if (measure(next) <= maxWidth) {
        chunk = next;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    if (chunk) current = chunk;
  }
  if (current) lines.push(current);
  return lines;
}

/** Approximate vertical advance for a line at `size`, including leading. */
export function lineHeight(size: number, leading = 1.2): number {
  return size * leading;
}

/**
 * Strip characters Helvetica/Times can't encode (WinAnsi) so `drawText` never
 * throws on smart quotes, em dashes, etc. Replaces the most common offenders
 * with ASCII look-alikes and drops anything else outside Latin-1.
 */
export function sanitizeForWinAnsi(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
}
