import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { root } from '../scripts/build.mjs';

const read = file => readFile(path.join(root, file));
const hash = value => createHash('sha256').update(value).digest('hex');
const baseline = JSON.parse(await read('docs/reference/presentation/baseline.json'));
const editorialDesign = JSON.parse(await read('docs/reference/presentation/editorial-design-2026-11-03.json'));

test('folhas de apresentação, estados iniciais e dados de animação conservam o baseline', async () => {
  for (const [file, expected] of Object.entries(baseline.protectedHashes)) {
    const authorized = editorialDesign.overrides[file];
    if (authorized) assert.equal(authorized.before, expected, 'A referência histórica permanece preservada');
    assert.equal(hash(await read(file)), authorized?.after || expected, file);
  }
  const css = Buffer.from((await read('src/styles/site.css')).toString().replace(/\r\n/g, '\n'));
  assert.equal(hash(css.subarray(0, baseline.siteCssBaselineLength)), baseline.siteCssBaselineSha256);
  const localLayout = JSON.parse(await read('docs/reference/presentation/home-layout-adjustment.json'));
  const editorialLayout = JSON.parse(await read('docs/reference/presentation/editorial-row-layout-adjustment.json'));
  assert.equal(css.subarray(baseline.siteCssBaselineLength).toString(), baseline.authorizedCssAddition + localLayout.css + editorialLayout.css,
    'Somente os acréscimos vinculados aos pedidos explícitos de tablet, Home e distribuição editorial são autorizados.');
  // Revisão visual expressamente autorizada em 03/11; não reescreve os baselines.
  for (const asset of [editorialDesign.stylesheet, editorialDesign.teamComponent]) assert.equal(hash(await read(asset.path)), asset.sha256, asset.path);
  const layout=(await read('src/layouts/base.html')).toString();
  assert.deepEqual([...layout.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]),
    ['/styles/fonts.css','/styles/legacy.css','/styles/site.css','/styles/editorial.css']);
});

test('as duas variantes do carrossel conservam todo o componente original, e não apenas eventos IX2', async () => {
  const component = (await read('src/components/home-carousel.html')).toString().replace(/\r\n/g, '\n');
  assert.equal(hash(component), baseline.carouselSha256, 'DOM, classes, IDs, estados e geometria do componente original');
  const html = (await read('dist/index.html')).toString();
  assert.equal((html.match(/class="marquee-image-master"/g) || []).length, 1);
  assert.equal((html.match(/class="marquee-image-master-mobile"/g) || []).length, 1);
  for (const marker of ['001e70e4-fef0-d0fb-3a5b-1eadcbf8a27b','a361b092-1474-c676-024d-9929bbe5d3c5']) assert.ok(html.includes(marker));
  assert.doesNotMatch(html, /class="portrait-list"|class="portrait-card"/);
});

test('menu conserva o cabeçalho original, sua estrutura de hover e runtime de navegação', async () => {
  const header = (await read('src/components/header.html')).toString();
  const shell = header.replace(/<a\b(?=[^>]*class="[^"]*\b(?:nav-menu-link|menu-link)\b)[\s\S]*?<\/a>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(hash(shell), baseline.headerShellSha256);
  const items = [...header.matchAll(/<a class="nav-menu-link[\s\S]*?<\/a>/g)].map(x => x[0]);
  // Contato_revisado_01 nov.docx: Contato volta ao menu; shell/hover não mudam.
  assert.equal(items.length, 5);
  for (const item of items) {
    const template = item.replace(/href="[^"]*"/, 'href="__HREF__"')
      .replace(/(<div\b[^>]*class="menu-label(?: hover)?"[^>]*>)[^<]*(<\/div>)/g, '$1__LABEL__$2')
      .replace(/\s+/g, ' ').trim();
    assert.equal(hash(template), baseline.headerItemSha256, 'Cada link conserva a estrutura e os estilos do componente original.');
  }
  assert.equal((header.match(/class="menu-label hover"/g) || []).length, 5);
  assert.match(header, /data-duration="400" data-easing="ease" data-easing2="ease"/);
  assert.match(header, /class="nav-component w-nav"/);
  assert.doesNotMatch(header, /site-header|site-menu-toggle/);
  const main = (await read('src/scripts/main.js')).toString();
  assert.doesNotMatch(main, /navigation\.js/);
});
