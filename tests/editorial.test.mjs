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

test('Contato sai do menu por pedido explícito; Biblioteca aponta a pesquisa/acervo preservados', async () => {
  const header = await read('src/components/header.html');
  const links = [...header.matchAll(/<a class="nav-menu-link[^>]+href="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(links,['/','/nossa-atuacao','/quem-somos','/biblioteca']);
  const lib = await read('dist/biblioteca/index.html');
  assert.match(lib,/href="\/na-midia"/);
  assert.match(await read('dist/pesquisas/index.html'),/data-research-modal/);
  assert.match(lib,/href="\/pesquisas#pesquisa-2025"/);
  assert.match(lib,/id="pesquisa-2025"/);
  const archive=await read('dist/publicacoes/arquivo-be-back-now/index.html');
  for (const page of JSON.parse(await read('src/content/pages.json')).filter(x=>x.route.startsWith('/publicacoes/') && !['lacuna-por-dentro-e-por-fora','arquivo-be-back-now'].includes(x.key))) assert.ok(archive.includes(`href="${page.route}"`));
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

test('novos documentos preservam textos aprovados, seis motivos e destinos específicos', async () => {
  const sources=JSON.parse(await read('docs/reference/editorial-contato-biblioteca-2026-10-31/sources.json'));
  const contato=await read('dist/contato/index.html'), lib=await read('dist/biblioteca/index.html');
  const analysis=await read('dist/publicacoes/lacuna-por-dentro-e-por-fora/index.html');
  const text=(d,i)=>d.paragraphs.find(p=>p.i===i).text.replace(/\s+/g,' ').trim();
  for(const i of [9,10]) assert.ok(clean(contato).includes(text(sources[0],i)),`Contato ${i}`);
  assert.ok(clean(contato).replace(/\s+\./g,'.').includes(text(sources[0],24)));
  for(const i of [10,13,28,31]) assert.ok(clean(lib).includes(text(sources[1],i)),`Biblioteca ${i}`);
  for(const i of [49,50,51,52,53,54,55,57,58]) assert.ok(clean(analysis).includes(text(sources[1],i)),`Análise ${i}`);
  const data=JSON.parse(await read('src/content/contact.json'));
  assert.equal(data.reasons.length,6);
  for(const reason of data.reasons) assert.ok(contato.includes(`<option value="${reason.value}">${reason.label}</option>`));
  assert.match(contato,/<select[^>]*name="Reason"[^>]*required/);
  assert.doesNotMatch(contato,/<input[^>]*name="(?:Subject|Phone)"/);
  assert.doesNotMatch(contato,/<input[^>]*name="Organization"[^>]*required/);
  assert.match(analysis,/href="\/contato"/);
  assert.match(analysis,/href="\/biblioteca"/);
  assert.match(analysis,/href="https:\/\/www.resumego.net\/research\/resume-employment-gaps\/"[^>]*target="_blank"/);
  assert.match(lib,/href="\/pesquisas#pesquisa-2025"/);
  assert.doesNotMatch(lib,/href="[^\"]+\.pdf"/);
  const signup=lib.match(/<form[^>]*data-form-kind="publications"[\s\S]*?<\/form>/)[0];
  assert.match(signup,/<input[^>]*type="checkbox"[^>]*required/);
  assert.doesNotMatch(signup,/\schecked(?:\s|=|\/|>)/);
  assert.match(await read('dist/pesquisas/index.html'),/name="Updates"/);
  assert.match(await read('dist/pesquisas/index.html'),/href="\/contato\?motivo=estudo-parceria-apoio#Messages"/);
  const activity=await read('dist/nossa-atuacao/index.html');
  for(const url of ['/publicacoes/lacuna-por-dentro-e-por-fora','/contato?motivo=convidar-instituto#Messages','/contato?motivo=apresentar-contato#Messages']) assert.ok(activity.includes(`href="${url}"`));
  assert.match(lib,/youtube.com\/channel\/UCYt9N3uAVGFm7azxM8hyKRw/);
});
