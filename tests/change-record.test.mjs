import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRecords } from '../scripts/check-change-record.mjs';

const valid = '## Resultado esperado\nPedido\n## Escopo\nResponsável: IA Codex\n## Verificação realizada\nResultados\n## Pendências e entrega\nLimites';
test('guardrail exige registro para código, configuração e documentação no mesmo conjunto', () => {
  for (const file of ['src/scripts/forms.js', 'vercel.json', 'AGENTS.md', 'README.md']) {
    assert.throws(() => checkRecords([file], () => ''), /registro/);
    assert.throws(() => checkRecords([file, 'docs/tasks/TAREFA.md'], () => valid), /registro/);
    assert.throws(() => checkRecords([file, 'docs/tasks/task.md'], () => 'incompleto'), /registro/);
    assert.doesNotThrow(() => checkRecords([file, 'docs/tasks/task.md'], () => valid));
  }
  assert.doesNotThrow(() => checkRecords([], () => ''));
  assert.doesNotThrow(() => checkRecords(['docs/tasks/task.md'], () => valid));
});
