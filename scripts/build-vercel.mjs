import { cp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, root } from './build.mjs';
import { compressDirectory } from './compress.mjs';

export async function buildVercel({ enabled = process.env.BACKEND_ENABLED === 'true' } = {}) {
  await build();
  const output = path.join(root, 'dist-vercel');
  await rm(output, { recursive: true, force: true });
  await cp(path.join(root, 'dist'), output, { recursive: true });
  async function adapt(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await adapt(file); continue; }
      if (/\.(br|gz)$/.test(file)) { await rm(file); continue; }
      if (entry.name.endsWith('.html')) {
        const html = await readFile(file, 'utf8');
        await writeFile(file, html.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>'));
      }
    }
  }
  await adapt(output);
  const site = JSON.parse(await readFile(path.join(root, 'src/content/site.json'), 'utf8'));
  // Explicit whitelist. Never spread process.env or server configuration into a browser module.
  await writeFile(path.join(output, 'scripts/config.js'), `export default ${JSON.stringify({ email: site.email, research: site.research,
    ...(enabled ? { forms: { contactEndpoint: '/api/contact', researchEndpoint: '/api/research' } } : {}) })};\n`);
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await compressDirectory(output);
  return output;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await buildVercel();
