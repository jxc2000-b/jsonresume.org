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

const RESUME_PATH = process.env.RESUME
  ? resolve(ROOT, process.env.RESUME)
  : resolve(__dirname, 'sample-resume.json');
const resume = JSON.parse(readFileSync(RESUME_PATH, 'utf8'));

// Diverse set of themes to render. Override via THEMES="a,b,c" to customize.
const DEFAULT_THEMES = [
  'elegant',
  'even',
  'jacrys',
  'kendall',
  'macchiato',
  'stackoverflow',
];

const THEMES = (process.env.THEMES
  ? process.env.THEMES.split(',').map((s) => s.trim())
  : DEFAULT_THEMES
).filter(Boolean);

describe('build (pdf pathways)', () => {
  it.each(THEMES)('path 1: chromium → %s.pdf', async (theme) => {
    const { content } = await pdf.format(resume, {
      theme,
      username: 'local',
    });
    const file = resolve(OUT, `${theme}.pdf`);
    writeFileSync(file, content);
    // eslint-disable-next-line no-console
    console.log(`  wrote ${file} (${content.length} bytes)`);
    expect(content).toBeInstanceOf(Buffer);
    expect(content.length).toBeGreaterThan(1000);
  }, 60_000);

  it('path 2: rendercv → YAML (+ PDF if rendercv CLI is installed)', async () => {
    const { content } = await rendercv.format(resume);
    const yamlFile = resolve(OUT, 'resume.rendercv.yaml');
    writeFileSync(yamlFile, content);
    // eslint-disable-next-line no-console
    console.log(`  wrote ${yamlFile} (${content.length} bytes)`);
    expect(content).toContain('cv:');

    const cli = spawnSync(
      'rendercv',
      ['render', yamlFile, '--output-folder-name', OUT],
      { cwd: ROOT, stdio: 'inherit' }
    );
    if (cli.error && cli.error.code === 'ENOENT') {
      // eslint-disable-next-line no-console
      console.log(
        '  [skip] `rendercv` CLI not found. Install it with:\n' +
          '      pip install rendercv'
      );
      return;
    }
    if (cli.status !== 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `  rendercv exited with ${cli.status}; YAML still available at ${yamlFile}`
      );
    }
  }, 120_000);
});
