import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { root } from '../scripts/build.mjs';

test('interações preservam integralmente os eventos, tempos, easing e alvos exportados', async () => {
  const config = JSON.parse(await readFile(path.join(root, 'src/content/interactions.json'), 'utf8'));
  const baseline = JSON.parse(await readFile(path.join(root, 'docs/reference/interactions-baseline.json'), 'utf8'));
  assert.equal(Object.keys(config.events).length, baseline.events);
  assert.equal(Object.keys(config.actionLists).length, baseline.actionLists);
  assert.equal(createHash('sha256').update(JSON.stringify(config)).digest('hex'), baseline.canonicalSha256);
  const generated = await readFile(path.join(root, 'dist/scripts/interactions.js'), 'utf8');
  assert.ok(generated.includes(`Webflow.require("ix2").init(${JSON.stringify(config)});`));
});

test('runtime é local e não inicializa formulários hospedados, editor, marca ou comércio', async () => {
  const vendor = JSON.parse(await readFile(path.join(root, 'docs/reference/vendor.json'), 'utf8'));
  for (const [filename, record] of Object.entries(vendor)) {
    const bytes = await readFile(path.join(root, 'public/vendor', filename));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, filename);
  }
  const bootstrap = await readFile(path.join(root, 'public/vendor/runtime-bootstrap.js'), 'utf8');
  assert.doesNotMatch(bootstrap, /\br\((?:9461|60322|27527|92779)\)/);
  const core = await readFile(path.join(root, 'public/vendor/runtime-core.js'), 'utf8');
  assert.doesNotMatch(core, /Webflow\.require\("commerce"\)\.init/);
  const pages = JSON.parse(await readFile(path.join(root, 'src/content/pages.json'), 'utf8'));
  for (const page of pages) {
    const html = await readFile(path.join(root, 'dist', page.route, 'index.html'), 'utf8');
    assert.ok(html.includes(`data-wf-page="${page.originalPageId}"`), page.route);
    assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  }
});
