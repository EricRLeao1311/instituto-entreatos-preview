import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { gzip, brotliCompress, constants } from 'node:zlib';

const gzipAsync = promisify(gzip), brotliAsync = promisify(brotliCompress);
const textTypes = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);

// Sidecars are transport encodings only; originals and runtime hashes stay intact.
export async function compressDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await compressDirectory(file); continue; }
    if (!textTypes.has(path.extname(file))) continue;
    const bytes = await readFile(file);
    if (bytes.length < 1024) continue;
    const [gz, br] = await Promise.all([
      gzipAsync(bytes, { level: 9 }),
      brotliAsync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } }),
    ]);
    for (const [extension, encoded] of [['gz', gz], ['br', br]]) {
      if (encoded.length < bytes.length) await writeFile(file + '.' + extension, encoded);
    }
  }
}
