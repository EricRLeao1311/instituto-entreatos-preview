import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { root } from '../scripts/build.mjs';
import { createStaticServer } from '../scripts/http.mjs';

const dist = path.join(root, 'dist');

test('cada variante comprimida restaura exatamente os bytes originais', async () => {
  let checked = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await visit(file); continue; }
      if (!/\.(br|gz)$/.test(file)) continue;
      const compressed = await readFile(file), original = await readFile(file.replace(/\.(br|gz)$/, ''));
      assert.deepEqual(file.endsWith('.br') ? brotliDecompressSync(compressed) : gunzipSync(compressed), original, file);
      assert.ok(compressed.length < original.length, file);
      checked++;
    }
  }
  await visit(dist);
  assert.ok(checked > 40);
});

test('fontes WOFF2 preservam inventário e hashes da conversão verificada', async () => {
  const records = JSON.parse(await readFile(path.join(root, 'docs/reference/font-optimization.json')));
  assert.equal(records.length, 11);
  for (const record of records) {
    const font = await readFile(path.join(dist, 'assets', record.target));
    assert.equal(font.subarray(0, 4).toString(), 'wOF2');
    assert.equal(createHash('sha256').update(font).digest('hex'), record.sha256);
    assert.ok(record.outlinesAndMetricsVerified);
    assert.ok(record.after < record.before);
  }
});

test('HTTP negocia compressão, HEAD, revalidação e falhas sem servir bytes incorretos', async t => {
  const server = createStaticServer(dist);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  function request(url, headers = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path: url, headers, method }, res => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      });
      req.on('error', reject); req.end();
    });
  }
  const original = await readFile(path.join(dist, 'scripts/interactions.js'));
  for (const encoding of ['br', 'gzip']) {
    const result = await request('/scripts/interactions.js', { 'Accept-Encoding': encoding });
    assert.equal(result.status, 200);
    assert.equal(result.headers['content-encoding'], encoding);
    assert.equal(result.headers.vary, 'Accept-Encoding');
    assert.match(result.headers['content-type'], /javascript/);
    assert.deepEqual(encoding === 'br' ? brotliDecompressSync(result.body) : gunzipSync(result.body), original);
    const cached = await request('/scripts/interactions.js', { 'Accept-Encoding': encoding, 'If-None-Match': result.headers.etag });
    assert.equal(cached.status, 304); assert.equal(cached.body.length, 0);
    const head = await request('/scripts/interactions.js', { 'Accept-Encoding': encoding }, 'HEAD');
    assert.equal(head.headers['content-length'], String(result.body.length)); assert.equal(head.body.length, 0);
  }
  const identity = await request('/scripts/interactions.js', { 'Accept-Encoding': 'br;q=0,gzip;q=0' });
  assert.equal(identity.headers['content-encoding'], undefined); assert.deepEqual(identity.body, original);
  const preferred = await request('/scripts/interactions.js', { 'Accept-Encoding': 'br;q=0.5,gzip;q=1,identity;q=0' });
  assert.equal(preferred.headers['content-encoding'], 'gzip');
  const fallback = await request('/scripts/config.js', { 'Accept-Encoding': 'br,gzip' });
  assert.equal(fallback.status, 200); assert.equal(fallback.headers['content-encoding'], undefined);
  assert.equal((await request('/', { 'Accept-Encoding': '*;q=0' })).status, 406);
  assert.equal((await request('/missing', { 'Accept-Encoding': 'br' })).status, 404);
  assert.equal((await request('/contato', {}, 'POST')).status, 405);
  assert.equal((await request('/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await request('/%ZZ')).status, 400);
});
