import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import pdf from '../lib/formatters/pdf';
import resume from './sample-resume.json';

describe('pdf formatter (smoke)', () => {
  it('produces a PDF buffer', async () => {

    const { content, headers } = await pdf.format(resume, {
      theme: 'elegant',
      username: 'local',
    });

    expect(content).toBeInstanceOf(Buffer);
    expect(content.length).toBeGreaterThan(1000);
    expect(headers.find((h) => h.key === 'Content-Type').value).toBe(
      'application/pdf'
    );

    writeFileSync('out.pdf', content);
  }, 30_000);
});