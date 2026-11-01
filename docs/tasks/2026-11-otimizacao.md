# Otimizar a entrega preservando o estilo

Status: concluída

## Resultado e escopo

Pedido: otimizar sem perder o estilo completo. Alterados somente os URLs/formato das fontes em `src/styles/fonts.css` e `legacy.css`, acrescentadas fontes WOFF2 em `public/assets/`, conversor opcional, compressão no build e módulo de entrega HTTP com revalidação. Mantidos todos os dados IX2, runtime, HTML, imagens, estilos visuais e ordem de carga dos scripts.

Arquivos de implementação: `scripts/convert-fonts.py`, `scripts/compress.mjs`, `scripts/http.mjs`, `scripts/build.mjs`, `scripts/serve.mjs`. Verificações novas em `tests/delivery.test.mjs`; os testes de CSS/JS em `tests/site.test.mjs` passam a ignorar variantes binárias. Documentação e evidências em `docs/DESEMPENHO.md`, `docs/reference/font-optimization.json` e `docs/reference/optimization/`.

## Verificação e entrega

Build e 14 testes aprovados. Verificação de contornos e avanços de todos os glifos nas 11 fontes; transporte comprimido comparado byte a byte. Oito comparações de layout aprovadas (quatro páginas em desktop e celular); diferenças iniciais de altura foram identificadas como imagens lazy do rodapé e resolvidas carregando o rodapé nas duas versões antes de medir. Nenhum ajuste visual foi aplicado para forçar igualdade.

Fontes 62,4% menores. Inventário JS/CSS 87,6% menor com Brotli em relação aos bytes sem compressão. Esses números não representam ganho percentual de velocidade. Limites e instruções de hospedagem em `../DESEMPENHO.md`.

Backup anterior preservado em `work/instituto-entreatos-antes-otimizacao.zip`, fora do pacote de publicação. Pacotes de código e publicação atualizados. Nenhum envio ao GitHub, alteração de DNS ou publicação externa nesta tarefa.
