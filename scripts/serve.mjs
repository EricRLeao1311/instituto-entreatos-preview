import { createStaticServer } from './http.mjs';
import { watch } from 'node:fs';
import path from 'node:path';
import { build, root } from './build.mjs';

await build();
const dist = path.join(root, 'dist');
const portFlag = process.argv.indexOf('--port');
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 4173);
const server = createStaticServer(dist);
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
if (process.argv.includes('--watch')) {
  let timer, rebuilding = false, pending = false;
  async function rebuild() {
    if (rebuilding) { pending = true; return; }
    rebuilding = true;
    try { await build(); } catch (error) { console.error(error.message); }
    rebuilding = false;
    if (pending) { pending = false; await rebuild(); }
  }
  for (const directory of ['src', 'public']) watch(path.join(root, directory), { recursive: true }, () => {
    clearTimeout(timer); timer = setTimeout(rebuild, 120);
  });
  console.log('Alterações em src/ e public/ geram um novo build. Atualize o navegador para visualizar.');
}
