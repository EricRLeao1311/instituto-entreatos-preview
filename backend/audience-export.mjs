import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from '../scripts/build.mjs';
import { openStore } from './store.mjs';
import { readConfig } from './cloud/config.mjs';

/** Explicit operator export; no public HTTP endpoint. Escape spreadsheet formula prefixes. */
export function toCsv(rows) {
  const columns = ['name','email','sources','subscribed','source','opted_in','created_at','updated_at','unsubscribed_at','consent'];
  const cell = value => {
    let text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"','""') + '"';
  };
  return '\ufeff' + columns.join(',') + '\r\n' + rows.map(row => columns.map(key => cell(row[key])).join(',')).join('\r\n') + '\r\n';
}

async function main() {
  const events = process.argv.includes('--events');
  let rows;
  if (process.argv.includes('--cloud')) {
    const config = readConfig(process.env); rows = [];
    for (let offset=0;;offset+=1000) {
      const response = await fetch(`${config.databaseUrl}/rest/v1/${events ? 'ea_audience_events' : 'ea_audience'}?select=${events ? 'email,source,opted_in,created_at,consent' : 'name,email,sources,subscribed,updated_at,unsubscribed_at,consent'}&offset=${offset}&limit=1000&order=${events ? 'created_at' : 'email'}.asc`, {
        headers: { apikey: config.databaseKey, ...(!config.databaseKey.startsWith('sb_secret_') ? { Authorization: `Bearer ${config.databaseKey}` } : {}) }, signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Exportação indisponível; confira o acesso privado.');
      const page = await response.json(); rows.push(...page); if (page.length<1000) break;
    }
  } else {
    const store = openStore(path.join(root,'.local-data/forms.sqlite'));
    try { rows = events ? store.events() : store.audience(); } finally { store.close(); }
  }
  const filename = path.join(root,'.local-data',events ? 'audience-events.csv' : 'audience.csv');
  await mkdir(path.dirname(filename),{recursive:true,mode:0o700});
  await writeFile(filename,toCsv(rows),{mode:0o600});
  console.log(`Exportação privada concluída: ${rows.length} registros em .local-data/.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
