import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from '../scripts/build.mjs';
const read = file => readFile(path.join(root, file), 'utf8');
const clean = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

test('cinco revisões publicam textos aprovados sem notas de montagem ou promessas antigas', async () => {
  const sources=JSON.parse(await read('docs/reference/editorial-revisada-2026-11-01/sources.json'));
  for(const [key,route,paragraphs] of [
    ['home','',[9,10,11,25,26,38,45,60,61,62,63,84,105,108,111,114,132]],
    ['quem','quem-somos/',[8,9,10,13,14,26,27,28,33,39,41,45,47,48,49,50,53,61,62,63,64]],
    ['atuacao','nossa-atuacao/',[7,8,9,10,16,28,40,44,56,59,60,68,70,73,76,84,92,108,110,112,122,125,126,128,130,133,137,139,143,145,147,150,153,155,157,159,160,173,175,176,179,182,184,185,193,194,196,197,199,200,201,202]],
    ['biblioteca','biblioteca/',[10,13,26,32,35]], ['contato','contato/',[9,10]],
  ]) {
    const text=clean(await read(`dist/${route}index.html`));
    const doc=sources.find(d=>d.key===key);
    for(const i of paragraphs) {
      let expected=doc.paragraphs.find(p=>p.i===i).text.replace(/\s+/g,' ').trim();
      // Pedido de 03/11: biografias junto das fotos; Sandra identificada como conselho.
      if (key==='quem' && [47,48,49].includes(i)) expected=expected.replace(/^.*? - /,'');
      if (key==='quem' && i===50) expected='Conselho consultivo · Diretora de parcerias';
      assert.ok(text.includes(key==='quem'&&i===28 ? expected.replace(/^Por que “Entre Atos”\. /,'') : expected),`${key}: ${i}`);
    }
    assert.doesNotMatch(text,/Orientação de montagem|Buscar um desenho|Sem botões na abertura|ainda vou escrever|Caio localiza|posso enviar novamente|Trazer do site anterior/);
  }
  assert.doesNotMatch(await read('dist/nossa-atuacao/index.html'),/serviços pro bono|Conexão com Mentores|taxa de retenção 15%|Quem se prepara para a pausa volta mais rápido/);
});

test('pesquisa inline e inscrição têm aceites separados; destinos usam a Biblioteca e o artigo confirmado', async () => {
  const lib=await read('dist/biblioteca/index.html');
  const forms=[...lib.matchAll(/<form\b[^>]*data-form-kind="(research|publications)"[\s\S]*?<\/form>/g)];
  assert.deepEqual(forms.map(x=>x[1]),['research','publications']);
  for(const [form] of forms) {
    assert.match(form,/<input[^>]*type="checkbox"[^>]*required/);
    assert.doesNotMatch(form,/\schecked(?:\s|=|\/|>)/);
    assert.match(form,/<input[^>]*name="Name"[^>]*required/);
    assert.match(form,/<input[^>]*name="email"[^>]*required/);
  }
  assert.match(forms[0][0],/name="ConsentVersion" value="biblioteca-2026-11-01"/);
  assert.doesNotMatch(forms[0][0],/name="Updates"|name="Phone"/);
  assert.match(forms[0][0],/Receber a pesquisa por e-mail/);
  for(const file of ['dist/index.html','dist/nossa-atuacao/index.html']) {
    const html=await read(file);
    assert.match(html,/href="\/biblioteca#pesquisa-2025"/);
    assert.doesNotMatch(html,/href="\/pesquisas#pesquisa-2025"|href="\/publicacoes\/lacuna-por-dentro-e-por-fora"/);
  }
});

test('conteúdo novo reaproveita fotos/sanfona; vídeos pendentes não aparentam estar disponíveis', async () => {
  const section=await read('src/sections/nossa-atuacao/01-approach.html');
  assert.equal((section.match(/class="expanded-list"/g)||[]).length,7);
  for(const title of ['O que já sabemos','O que trazemos','O que podemos realizar']) assert.equal((section.match(new RegExp(`<p class="text-size-medium text-weight-semibold">${title}</p>`,'g'))||[]).length,7);
  const partnership=(await read('src/sections/nossa-atuacao/02-approach-variant-2.html')).split('<div class="body-wrapper _2 _3">')[0];
  assert.equal((partnership.match(/<strong>/g)||[]).length,5);
  assert.equal((partnership.match(/<a class="button-primary/g)||[]).length,1);
  assert.match(partnership,/Propor um estudo/);
  for(const file of ['dist/index.html','dist/quem-somos/index.html']) assert.match(await read(file),/<button[^>]*disabled>Assistir ao manifesto<\/button>/);
  const photos=(await read('docs/reference/editorial-revisada-2026-11-01/nossa-photo-marquee.html')).replace(/\r\n/g,'\n').trim();
  assert.ok((await read('src/sections/nossa-atuacao/03-benefits.html')).replace(/\r\n/g,'\n').includes(photos),'Fotos, estrutura, IDs e animação do componente anterior permanecem intactos');
});

test('Contato volta ao menu por pedido revisado; Biblioteca mantém a pesquisa/acervo preservados', async () => {
  const header = await read('src/components/header.html');
  const links = [...header.matchAll(/<a class="nav-menu-link[^>]+href="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(links,['/','/nossa-atuacao','/quem-somos','/biblioteca','/contato']);
  const lib = await read('dist/biblioteca/index.html');
  // Pedido de 03/11 reúne a mídia na Biblioteca e conserva a rota antiga.
  assert.match(lib,/id="midia-biblioteca"/);
  assert.match(await read('src/sections/na-midia/01-store.html'),/include:components\/media-cards.html/);
  assert.match(await read('dist/pesquisas/index.html'),/data-research-modal/);
  assert.match(lib,/id="library-research-form"/);
  assert.match(lib,/id="pesquisa-2025"/);
  const archive=await read('dist/publicacoes/arquivo-be-back-now/index.html');
  for (const page of JSON.parse(await read('src/content/pages.json')).filter(x=>x.route.startsWith('/publicacoes/') && !['lacuna-por-dentro-e-por-fora','arquivo-be-back-now'].includes(x.key))) assert.ok(archive.includes(`href="${page.route}"`));
});

test('motivos de contato têm opções válidas e equipe conserva as duas variantes de revelação', async () => {
  const contact=await read('dist/contato/index.html');
  for(const reason of ['apresentar-contato','convidar-instituto','contar-historia']) assert.ok(contact.includes(`<option value="${reason}">`));
  assert.doesNotMatch(contact,/<\/option\s+[^>]+>/);
  const who=await read('dist/quem-somos/index.html');
  assert.match(who,/class="section mobile1"/);
  assert.match(who,/class="section-mobile mobile"/);
  assert.doesNotMatch(who,/people-grid|editorial-page|site-header/);
});

test('reorganização de 03/11 mantém pesquisa, acervo, pessoas e mídia acessíveis sem duplicar destinos', async () => {
  const home=await read('dist/index.html'), lib=await read('dist/biblioteca/index.html'), who=await read('dist/quem-somos/index.html');
  assert.doesNotMatch(home,/id="Benefits"/);
  assert.ok(lib.indexOf('id="Benefits"')>lib.indexOf('id="pesquisa-2025"'));
  assert.equal((lib.match(/counter-element="number"/g)||[]).length,3);
  assert.ok(home.indexOf('id="Testimonials"')>home.indexOf('id="Instituto"'));
  const media=await read('src/components/media-cards.html');
  for(const url of [...media.matchAll(/<a class="product-link[^>]*href="([^"]+)"/g)].map(x=>x[1])) {
    assert.ok(lib.includes(`href="${url}"`));
    assert.ok((await read('dist/na-midia/index.html')).includes(`href="${url}"`));
  }
  assert.equal((media.match(/<a class="product-link/g)||[]).length,13);
  const ebooks=await read('src/components/ebook-cards.html');
  const ebookUrls=[...ebooks.matchAll(/<a class="event-card-link[^>]*href="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ebookUrls.length,4);
  for(const url of ebookUrls) assert.ok(lib.includes(`href="${url}"`));
  assert.doesNotMatch(lib,/href="https:\/\/imprensa\.example\.com/);
  for(const sectionId of ['Team','Team-variant-2']) {
    const section=who.split(`id="${sectionId}"`)[1].split('</section>')[0];
    assert.equal((section.match(/class="team-profile"/g)||[]).length,6);
    assert.match(section,/Conselho consultivo · Diretora de parcerias/);
    assert.ok(section.indexOf('Quem faz')<section.indexOf('team-profile'));
  }
  const footer=await read('src/components/footer.html');
  assert.doesNotMatch(footer,/CNPJ/);
  assert.match(who,/CNPJ 66\.442\.226\/0001-50/);
  assert.match(footer,/Caio Jacinto/); assert.match(footer,/Eric Leão/);
});

test('novos documentos preservam textos aprovados, seis motivos e destinos específicos', async () => {
  const sources=JSON.parse(await read('docs/reference/editorial-contato-biblioteca-2026-10-31/sources.json'));
  const contato=await read('dist/contato/index.html'), lib=await read('dist/biblioteca/index.html');
  const analysis=await read('dist/publicacoes/lacuna-por-dentro-e-por-fora/index.html');
  const text=(d,i)=>d.paragraphs.find(p=>p.i===i).text.replace(/\s+/g,' ').trim();
  for(const i of [9,10]) assert.ok(clean(contato).includes(text(sources[0],i)),`Contato ${i}`);
  assert.ok(clean(contato).replace(/\s+\./g,'.').includes(text(sources[0],24)));
  for(const i of [10,13,28,31]) assert.ok(clean(lib).includes(text(sources[1],i)),`Biblioteca ${i}`);
  assert.match(analysis, /http-equiv="refresh"/);
  const data=JSON.parse(await read('src/content/contact.json'));
  assert.equal(data.reasons.length,6);
  for(const reason of data.reasons) assert.ok(contato.includes(`<option value="${reason.value}">${reason.label}</option>`));
  assert.match(contato,/<select[^>]*name="Reason"[^>]*required/);
  assert.doesNotMatch(contato,/<input[^>]*name="(?:Subject|Phone)"/);
  assert.doesNotMatch(contato,/<input[^>]*name="Organization"[^>]*required/);
  assert.match(analysis,/href="\/contato"/);
  assert.match(analysis,/href="\/biblioteca"/);
  assert.match(analysis,/href="https:\/\/www.linkedin.com\/pulse\/lacuna-que-empresa-aceita/);
  assert.match(lib,/id="library-research-form"/);
  assert.doesNotMatch(lib,/href="[^\"]+\.pdf"/);
  const signup=lib.match(/<form[^>]*data-form-kind="publications"[\s\S]*?<\/form>/)[0];
  assert.match(signup,/<input[^>]*type="checkbox"[^>]*required/);
  assert.doesNotMatch(signup,/\schecked(?:\s|=|\/|>)/);
  assert.match(await read('dist/pesquisas/index.html'),/name="Updates"/);
  assert.match(await read('dist/pesquisas/index.html'),/href="\/contato\?motivo=estudo-parceria-apoio#Messages"/);
  const activity=await read('dist/nossa-atuacao/index.html');
  for(const url of ['https://www.linkedin.com/pulse/lacuna-que-empresa-aceita-por-dentro-e-recusa-fora-baggio-tet%C3%AA--eyoef','/contato?motivo=convidar-instituto#Messages','/contato?motivo=apresentar-contato#Messages']) assert.ok(activity.includes(`href="${url}"`));
  assert.match(lib,/youtube.com\/channel\/UCYt9N3uAVGFm7azxM8hyKRw/);
});
