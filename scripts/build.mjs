import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expandIncludes, expandCollections, interpolate, escapeHtml } from './template.mjs';
import { compressDirectory } from './compress.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function build() {
  const src = path.join(root, 'src'), dist = path.join(root, 'dist');
  const site = JSON.parse(await readFile(path.join(src, 'content/site.json'), 'utf8'));
  const pages = JSON.parse(await readFile(path.join(src, 'content/pages.json'), 'utf8'));
  const content = {};
  for (const key of ['portraits', 'team']) content[key] = JSON.parse(await readFile(path.join(src, `content/${key}.json`), 'utf8'));
  const interactions = JSON.parse(await readFile(path.join(src, 'content/interactions.json'), 'utf8'));
  if (new Set(pages.map(page => page.route)).size !== pages.length) throw new Error('Rotas duplicadas');
  for (const page of pages) {
    if (!/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(page.route)) throw new Error(`Rota inválida: ${page.route}`);
    if (!page.title || !page.description) throw new Error(`SEO ausente: ${page.route}`);
    const templatePath = path.resolve(src, page.template);
    if (!templatePath.startsWith(src + path.sep)) throw new Error('Template fora de src');
  }
  // dist is always a fixed child of the project; source files are never removed.
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(root, 'public'), dist, { recursive: true });
  await cp(path.join(src, 'styles'), path.join(dist, 'styles'), { recursive: true });
  await cp(path.join(src, 'scripts'), path.join(dist, 'scripts'), { recursive: true });
  await writeFile(path.join(dist, 'scripts/interactions.js'),
    `/* Original published IX2 data, maintained in src/content/interactions.json. */\nWebflow.require("ix2").init(${JSON.stringify(interactions)});\n` +
    `document.documentElement.dataset.presentationReady="true";\n` +
    `document.documentElement.dataset.animationEvents="${Object.keys(interactions.events).length}";\n` +
    `document.documentElement.dataset.hostedFormsDisabled=String(!Webflow.require("forms"));\n`);
  await writeFile(path.join(dist, 'scripts/config.js'), `export default ${JSON.stringify({
    email: site.email, research: site.research,
  }, null, 2)};\n`);
  const layout = await readFile(path.join(src, 'layouts/base.html'), 'utf8');
  for (const page of pages) {
    const pageContent = await readFile(path.join(src, page.template), 'utf8');
    const chrome = await readFile(path.join(src, page.chrome), 'utf8');
    const head = await readFile(path.join(src, page.head), 'utf8');
    const includes = await expandIncludes(layout.replace('<!-- page-content -->', pageContent)
      .replace('<!-- page-chrome -->', chrome).replace('<!-- page-head -->', head)
      .replace('<!-- page-global-styles -->', page.hasGlobalStyles ? '<link rel="stylesheet" href="/styles/base.css">' : ''), src);
    const expanded = await expandCollections(includes, src, content);
    const canonical = new URL(page.route, site.url).href;
    let html = interpolate(expanded, { site, content, page: { ...page, canonical } });
    // Set active navigation at build time, including article routes under Publicações.
    html = html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>/g, (match, before, href, after) => {
      const active = href === page.route || (href === '/biblioteca' && (page.route.startsWith('/publicacoes') || ['/na-midia', '/depoimentos'].includes(page.route)));
      if (!active || !(before + after).includes('nav-menu-link')) return match;
      return `<a${before}href="${href}"${after} aria-current="page">`.replace(/class="([^"]+)"/, 'class="$1 w--current"');
    });
    const output = path.join(dist, page.route, 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html);
  }
  const notFound = interpolate(await readFile(path.join(src, 'pages/404.html'), 'utf8'), { site });
  await writeFile(path.join(dist, '404.html'), notFound);
  const urls = pages.map(page => `<url><loc>${escapeHtml(new URL(page.route, site.url).href)}</loc></url>`).join('\n');
  await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`);
  await compressDirectory(dist);
  console.log(`Build concluído: ${pages.length} páginas + 404 e compressão gzip/Brotli em dist/`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await build();
