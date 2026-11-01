import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from '../scripts/build.mjs';
const read = file => readFile(path.join(root, file), 'utf8');
const clean = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

test('textos aprovados entram nas páginas existentes sem instruções de design publicadas', async () => {
  const sources = JSON.parse(await read('docs/reference/editorial-2026-10-31/sources.json'));
  const home = await read('dist/index.html'), who = await read('dist/quem-somos/index.html');
  for (const i of [10,11,17,18,21,28,35,36,51,57,60,63,66,69]) assert.ok(clean(home).includes(sources[0].paragraphs[i].replace(/\s+/g,' ').trim()), `Home: ${i}`);
  for (const i of [8,9,10,13,14,18,19,25,31,33,37,39,40,41,42]) assert.ok(clean(who).includes(sources[1].paragraphs[i].replace(/\s+/g,' ').trim()), `Quem somos: ${i}`);
  for (const html of [home, who]) assert.doesNotMatch(html, /Buscar um desenho|Sem botões na abertura|Vídeo que vou entregar/);
});

test('menu mantém cinco destinos; Biblioteca reutiliza pesquisa/acervo e aponta à imprensa original', async () => {
  const header = await read('src/components/header.html');
  const links = [...header.matchAll(/<a class="nav-menu-link[^>]+href="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(links,['/','/nossa-atuacao','/quem-somos','/biblioteca','/contato']);
  const lib = await read('dist/biblioteca/index.html');
  assert.match(lib,/href="\/na-midia"/);
  assert.match(lib,/data-research-modal/);
  assert.match(lib,/id="pesquisa-2025"/);
  for (const page of JSON.parse(await read('src/content/pages.json')).filter(x=>x.route.startsWith('/publicacoes/'))) assert.ok(lib.includes(`href="${page.route}"`));
});

test('motivos de contato têm opções válidas e as grades da equipe continuam sendo as originais', async () => {
  const contact=await read('dist/contato/index.html');
  for(const reason of ['apresentar-contato','convidar-instituto','contar-historia']) assert.ok(contact.includes(`<option value="${reason}">`));
  assert.doesNotMatch(contact,/<\/option\s+[^>]+>/);
  const who=await read('dist/quem-somos/index.html');
  assert.match(who,/class="section mobile1"/);
  assert.match(who,/class="section-mobile mobile"/);
  assert.doesNotMatch(who,/people-grid|editorial-page|site-header/);
});
