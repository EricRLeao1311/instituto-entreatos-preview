import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { root } from '../scripts/build.mjs';

const dist = path.join(root, 'dist');
const pages = JSON.parse(await readFile(path.join(root, 'src/content/pages.json'), 'utf8'));
const documents = new Map(await Promise.all(pages.map(async page => [page.route, await readFile(path.join(dist, page.route, 'index.html'), 'utf8')])));
const decode = value => value.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const attrs = (html, name) => [...html.matchAll(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'g'))].map(match => decode(match[1]));

test('inventário mantém as 21 rotas e acrescenta Biblioteca com os componentes existentes', () => {
  assert.equal(pages.length, 22);
  assert.equal(pages.filter(page => page.route.startsWith('/publicacoes/')).length, 14);
  for (const route of ['/', '/nossa-atuacao', '/quem-somos', '/publicacoes', '/depoimentos', '/na-midia', '/contato']) assert.ok(documents.has(route));
});

test('todas as páginas têm SEO, navegação, conteúdo resolvido e IDs únicos', () => {
  for (const [route, html] of documents) {
    assert.match(html, /lang="pt-BR"/, route);
    assert.match(html, /<link\b[^>]*\brel="canonical"/, route);
    assert.match(html, /<main\b[^>]*\bid="main-content"/, route);
    assert.match(html, /aria-label="Menu principal"/, route);
    assert.doesNotMatch(html, /\{\{[\w.]+\}\}|<!--\s*include:/, route);
    assert.doesNotMatch(html, /<script[^>]+src="https?:|src="https?:\/\/cdn\.prod\.website-files/, route);
    assert.doesNotMatch(html, /<script[^>]+webflow|Padelthon Club|Buy Template/, route);
    assert.doesNotMatch(html, /\uFFFD/, `UTF-8 corrompido em ${route}`);
    const ids = attrs(html, 'id');
    assert.equal(new Set(ids).size, ids.length, `IDs duplicados em ${route}`);
  }
});

test('links internos, âncoras e arquivos locais apontam para destinos existentes', async () => {
  const errors = [];
  for (const [route, html] of documents) {
    for (const [anchor] of html.matchAll(/<a\b[^>]*>/g)) {
      if (anchor.includes('href="#"') && !anchor.includes('data-open-research')) errors.push(`${route}: link sem destino ou ação`);
    }
    for (const href of attrs(html, 'href')) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      if (href === '#') continue; // Original research triggers use IX2, verified above.
      const url = new URL(href, `https://local.test${route}`);
      const target = documents.get(url.pathname.replace(/\/$/, '') || '/');
      if (target !== undefined) {
        if (url.hash && !attrs(target, 'id').includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${route}: âncora ${href}`);
      } else {
        try { await stat(path.join(dist, decodeURIComponent(url.pathname))); }
        catch { errors.push(`${route}: destino ${href}`); }
      }
    }
    const resources = [...attrs(html, 'src'), ...attrs(html, 'poster'), ...attrs(html, 'srcset').flatMap(set => set.split(',').map(item => item.trim().split(/\s+/)[0]))];
    for (const url of resources) {
      if (!url.startsWith('/') || url.startsWith('//')) continue;
      try { await stat(path.join(dist, decodeURIComponent(url))); }
      catch { errors.push(`${route}: recurso ${url}`); }
    }
  }
  assert.deepEqual(errors, []);
});

test('fontes e imagens de CSS são locais e estão disponíveis', async () => {
  for (const filename of (await readdir(path.join(dist, 'styles'))).filter(name => name.endsWith('.css'))) {
    const css = await readFile(path.join(dist, 'styles', filename), 'utf8');
    assert.doesNotMatch(css, /url\(["']?https?:/, filename);
    for (const match of css.matchAll(/url\(["']?(\/assets\/[^)"']+)/g)) await stat(path.join(dist, match[1]));
  }
});

test('formulários oferecem estado de envio e não usam endpoints do Webflow', () => {
  for (const [route, html] of documents) {
    const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)];
    for (const [form] of forms) {
      assert.match(form, /data-form-kind="(?:contact|research)"/, route);
      assert.match(form, /role="status"/, route);
      assert.match(form, /method="post"/, route);
      assert.doesNotMatch(form, /webflow\.com/, route);
    }
  }
});

test('PDF principal está incluído e módulos do navegador têm seus imports locais', async () => {
  const site = JSON.parse(await readFile(path.join(root, 'src/content/site.json'), 'utf8'));
  assert.ok(site.research.documentUrl.startsWith('/assets/'));
  const pdf = await readFile(path.join(dist, site.research.documentUrl));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  for (const filename of (await readdir(path.join(dist, 'scripts'))).filter(name => name.endsWith('.js'))) {
    const source = await readFile(path.join(dist, 'scripts', filename), 'utf8');
    for (const [, dependency] of source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)) await stat(path.resolve(dist, 'scripts', dependency));
  }
});
