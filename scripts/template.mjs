import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

/** Includes accept only files inside src. Cycles and unknown variables fail the build. */
export async function expandIncludes(source, srcRoot, ancestry = []) {
  const pattern = /<!--\s*include:([^>]+?)\s*-->/g;
  let output = '', cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const relative = match[1].trim();
    const filename = path.resolve(srcRoot, relative);
    const within = path.relative(srcRoot, filename);
    if (within.startsWith('..') || path.isAbsolute(within)) throw new Error(`Include fora de src: ${relative}`);
    if (ancestry.includes(filename)) throw new Error(`Include circular: ${relative}`);
    const partial = await readFile(filename, 'utf8');
    output += source.slice(cursor, match.index) + await expandIncludes(partial, srcRoot, [...ancestry, filename]);
    cursor = match.index + match[0].length;
  }
  return output + source.slice(cursor);
}

export function interpolate(source, context) {
  return source.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    const value = key.split('.').reduce((current, part) => current?.[part], context);
    if (value === undefined) throw new Error(`Variável desconhecida: ${key}`);
    if (typeof value === 'object') throw new Error(`Variável deve ser texto: ${key}`);
    return escapeHtml(value);
  });
}

/** Collection expansion runs at build time; all content remains in the delivered HTML. */
export async function expandCollections(source, srcRoot, content) {
  const pattern = /<!--\s*repeat:([\w-]+):([^>]+?)\s*-->/g;
  let output = '', cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const items = content[match[1]];
    if (!Array.isArray(items)) throw new Error(`Coleção desconhecida: ${match[1]}`);
    const template = await expandIncludes(`<!-- include:${match[2].trim()} -->`, srcRoot);
    output += source.slice(cursor, match.index) + items.map(item => interpolate(template, { item })).join('\n');
    cursor = match.index + match[0].length;
  }
  return output + source.slice(cursor);
}
