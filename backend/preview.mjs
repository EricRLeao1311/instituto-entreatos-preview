import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from '../scripts/build.mjs';
import { createPreviewServer } from './server.mjs';

await build();
const site = JSON.parse(await readFile(path.join(root, 'src/content/site.json'), 'utf8'));
// Explicit preview URL: root-relative PDF in the static build must include the Pages repository.
site.research.documentUrl = 'https://ericrleao1311.github.io/instituto-entreatos-preview/assets/panorama-retorno-profissional-2025.pdf';
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 4287 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Porta inválida');
const server = createPreviewServer({
  directory: path.join(root, 'dist'), databasePath: path.join(root, '.local-data/forms.sqlite'), site,
  contactRecipient: process.env.PREVIEW_CONTACT_TO || '',
});
server.listen(port, '127.0.0.1', () => console.log(`Teste com backend: http://127.0.0.1:${port}\nE-mails capturados localmente; nenhum envio externo. Dados em .local-data/, fora do site público.`));
server.on('error', error => { console.error(error.code || 'Falha ao iniciar'); process.exitCode = 1; server.close(); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
