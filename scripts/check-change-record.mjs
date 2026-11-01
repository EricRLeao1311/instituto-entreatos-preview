import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The gate checks traceability, not whether the written account is truthful or complete. */
export function checkRecords(files, read) {
  if (!files.some(file => !file.startsWith('docs/tasks/'))) return;
  const records = files.filter(file => /^docs\/tasks\/(?!TAREFA\.md$).+\.md$/.test(file));
  const sections = ['## Resultado esperado', '## Escopo', '## Verificação realizada', '## Pendências e entrega', 'Responsável:'];
  if (!records.some(file => sections.every(section => read(file).includes(section)))) {
    throw new Error('Toda alteração precisa criar ou atualizar um registro em docs/tasks/ no mesmo conjunto, com responsável/IA, pedido, escopo, verificações reais e pendências. Use docs/tasks/TAREFA.md.');
  }
}

function main() {
  const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const staged = process.argv.includes('--staged');
  const base = process.env.CHANGE_BASE;
  let names;
  if (staged) names = git(['diff', '--cached', '--name-only']);
  else if (base) {
    if (!/^[0-9a-f]{40,64}$/.test(base)) throw new Error('Referência Git inválida.');
    names = /^0+$/.test(base) ? git(['ls-tree','-r','--name-only','HEAD']) : git(['diff','--name-only',base,'HEAD']);
  } else names = [git(['diff','--name-only','HEAD']), git(['ls-files','--others','--exclude-standard'])].filter(Boolean).join('\n');
  const files = names.split(/\r?\n/).filter(Boolean);
  checkRecords(files, file => { try { return staged ? git(['show', `:${file}`]) : readFileSync(file, 'utf8'); } catch { return ''; } });
  console.log('Registro de alteração conferido.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
