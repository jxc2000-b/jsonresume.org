import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pdf from '../lib/formatters/pdf';
import rendercv from '../lib/formatters/rendercv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'out');
mkdirSync(OUT, { recursive: true });

const resume = JSON.parse(
  readFileSync(resolve(__dirname, 'sample-resume.json'), 'utf8')
);

const THEME = process.env.THEME || 'elegant';

describe('build (pdf pathways)', () => {
  it(`path 1: chromium → ${THEME}.pdf`, async () => {
    const { content } = await pdf.format(resume, {
      theme: THEME,
      username: 'local',
    });
    const file = resolve(OUT, `${THEME}.pdf`);
    writeFileSync(file, content);
    // eslint-disable-next-line no-console
    console.log(`\n  wrote ${file} (${content.length} bytes)`);
    expect(content).toBeInstanceOf(Buffer);
    expect(content.length).toBeGreaterThan(1000);
  }, 60_000);

  it('path 2: rendercv → YAML (+ PDF if rendercv CLI is installed)', async () => {
    const { content } = await rendercv.format(resume);
    const yamlFile = resolve(OUT, 'resume.rendercv.yaml');
    writeFileSync(yamlFile, content);
    // eslint-disable-next-line no-console
    console.log(`\n  wrote ${yamlFile} (${content.length} bytes)`);
    expect(content).toContain('cv:');

    const cli = spawnSync(
      'rendercv',
      ['render', yamlFile, '--output-folder-name', OUT],
      { cwd: ROOT, stdio: 'inherit' }
    );
    if (cli.error && cli.error.code === 'ENOENT') {
      // eslint-disable-next-line no-console
      console.log(
        '\n  [skip] `rendercv` CLI not found. Install it with:\n' +
          '      pip install rendercv\n' +
          '  Then rerun to produce a PDF from the YAML above.'
      );
      return;
    }
    if (cli.status !== 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `\n  rendercv exited with ${cli.status}; YAML still available at ${yamlFile}`
      );
    }
  }, 120_000);
});
