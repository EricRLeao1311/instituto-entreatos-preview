import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBasePath, prefixUrl, rewriteMarkup, rewriteCss } from '../scripts/pages-paths.mjs';

test('base do Pages aceita nomes de repositório e rejeita travessia/origens', () => {
  assert.equal(normalizeBasePath('/instituto-entreatos-preview/'), '/instituto-entreatos-preview');
  assert.equal(normalizeBasePath('/'), '');
  for (const value of ['https://example.org', '/../site', '//site', '/a/./b']) assert.throws(() => normalizeBasePath(value));
});

test('prefixo preserva destinos externos, e-mail, fragmentos e URLs sem raiz', () => {
  const base = '/repo';
  assert.equal(prefixUrl('/', base), '/repo/');
  assert.equal(prefixUrl('/contato?motivo=apresentar-contato#Messages', base), '/repo/contato?motivo=apresentar-contato#Messages');
  for (const value of ['https://example.org/x', '//cdn.example.org/x', 'mailto:a@example.org', '#empresa', './forms.js', '']) assert.equal(prefixUrl(value, base), value);
});

test('HTML/SVG inclui variantes responsivas, vídeo e links sem alterar IDs ou estados', () => {
  const markup = '<a href="/">Home</a><img data-w-id="original" style="opacity:0" src="/assets/a.png" srcset="/assets/a.png 500w, /assets/b.png 900w"><video poster="/assets/p.jpg" data-video-urls="/assets/a.mp4,/assets/a.webm"></video><image href="/assets/logo.png"/>';
  const output = rewriteMarkup(markup, '/repo');
  assert.match(output, /href="\/repo\/"/);
  assert.match(output, /srcset="\/repo\/assets\/a.png 500w, \/repo\/assets\/b.png 900w"/);
  assert.match(output, /data-video-urls="\/repo\/assets\/a.mp4,\/repo\/assets\/a.webm"/);
  assert.match(output, /data-w-id="original" style="opacity:0"/);
});

test('CSS conserva regras visuais e adapta apenas URLs locais', () => {
  assert.equal(rewriteCss('.x{opacity:0;transform:translateY(2rem);src:url("/assets/font.woff2")} .y{background:url(//cdn.example.org/x)}', '/repo'),
    '.x{opacity:0;transform:translateY(2rem);src:url("/repo/assets/font.woff2")} .y{background:url(//cdn.example.org/x)}');
});
