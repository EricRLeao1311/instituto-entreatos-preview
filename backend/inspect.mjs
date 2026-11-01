import path from 'node:path';
import { root } from '../scripts/build.mjs';
import { openStore } from './store.mjs';

const store = openStore(path.join(root, '.local-data/forms.sqlite'));
try { console.log(JSON.stringify(store.recent(), null, 2)); } finally { store.close(); }
