import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { interpolate, expandIncludes, expandCollections } from '../scripts/template.mjs';

test('conteúdo de configuração é escapado e variável desconhecida falha', () => {
  assert.equal(interpolate('<title>{{page.title}}</title>', { page: { title: '<script>&"' } }), '<title>&lt;script&gt;&amp;&quot;</title>');
  assert.throws(() => interpolate('{{page.missing}}', { page: {} }), /desconhecida/);
});

test('coleções geram HTML estático e escapam o conteúdo de cada registro', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'entreatos-collection-'));
  try {
    await writeFile(path.join(dir, 'card.html'), '<p>{{item.name}}</p>');
    const result = await expandCollections('<!-- repeat:people:card.html -->', dir, { people: [{ name: 'A&B' }, { name: '<C>' }] });
    assert.equal(result, '<p>A&amp;B</p>\n<p>&lt;C&gt;</p>');
    await assert.rejects(expandCollections('<!-- repeat:missing:card.html -->', dir, {}), /desconhecida/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('includes recursivos rejeitam ciclos e acesso fora da pasta de origem', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'entreatos-test-'));
  try {
    await writeFile(path.join(dir, 'a.html'), '<!-- include:b.html -->');
    await writeFile(path.join(dir, 'b.html'), '<!-- include:a.html -->');
    await assert.rejects(expandIncludes('<!-- include:a.html -->', dir), /circular/);
    await assert.rejects(expandIncludes('<!-- include:../outside.html -->', dir), /fora/);
    await writeFile(path.join(dir, 'b.html'), '<p>Funciona</p>');
    assert.equal(await expandIncludes('<!-- include:a.html -->', dir), '<p>Funciona</p>');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
