import { readFile, writeFile, readdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, root } from './build.mjs';
import { compressDirectory } from './compress.mjs';
import { normalizeBasePath, prefixUrl, rewriteMarkup, rewriteCss } from './pages-paths.mjs';

export async function buildPages(basePath) {
  const base = normalizeBasePath(basePath);
  await build();
  const output = path.join(root, 'dist-pages');
  // Fixed generated child of the project. Never remove source or a caller-supplied path.
  await rm(output, { recursive: true, force: true });
  await cp(path.join(root, 'dist'), output, { recursive: true });
  async function adapt(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await adapt(file); continue; }
      if (/\.(br|gz)$/.test(file)) { await rm(file); continue; }
      const extension = path.extname(file);
      if (!['.html', '.svg', '.css'].includes(extension)) continue;
      const original = await readFile(file, 'utf8');
      let updated = extension === '.css' ? rewriteCss(original, base) : rewriteMarkup(original, base);
      if (extension === '.html') updated = updated.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
      if (updated !== original) await writeFile(file, updated);
    }
  }
  await adapt(output);
  const site = JSON.parse(await readFile(path.join(root, 'src/content/site.json'), 'utf8'));
  await writeFile(path.join(output, 'scripts/config.js'), `export default ${JSON.stringify({
    email: site.email, research: { ...site.research, documentUrl: prefixUrl(site.research.documentUrl, base) },
  }, null, 2)};\n`);
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await writeFile(path.join(output, '.nojekyll'), '');
  await compressDirectory(output);
  console.log(`Prévia GitHub Pages gerada em dist-pages/ com base ${base || '/'}`);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const index = process.argv.indexOf('--base-path');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Informe --base-path /nome-do-repositorio');
  await buildPages(process.argv[index + 1]);
}
