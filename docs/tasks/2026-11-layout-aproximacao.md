# Alinhar o bloco Como você pode se aproximar

Status: concluída

Pedido: “esse aqui deveria ficar no mesmo estilo do de cima e do de baixo”. Aplicar ao card intermediário da Home a mesma distribuição de título e conteúdo usada nos dois vizinhos.

Arquivos previstos: `src/sections/home/07-instituto.html` (identificador apenas no card intermediário); `src/styles/site.css` (incluir esse identificador nas mesmas regras de colunas e alinhamento dos botões); registro da autorização em `docs/reference/presentation/home-layout-adjustment.json`; mensagem do contrato em `tests/presentation.test.mjs`; mapa e esta tarefa.

Preservar todos os textos, ordem dos botões e descrições, destinos, cores, fontes, hover e animações. Os cards vizinhos mantêm os mesmos valores CSS. Nenhum outro componente ou página será alterado.

## Resultado e verificação

O bloco intermediário agora compartilha as mesmas colunas dos dois vizinhos: título ocupando duas colunas e descrição quatro, com botões alinhados ao início do conteúdo. Mantidas ordem, legendas, links, cores, tipografia e efeitos. O HTML recebeu somente um identificador; o CSS apenas inclui o novo identificador nas regras existentes.

Build e 20 testes aprovados. Comparação no navegador em três tamanhos: os três blocos têm as mesmas coordenadas de início de título/texto e a mesma largura útil, sem overflow. Valores CSS reais e capturas em `docs/reference/presentation/qa/layout-aproximacao/`. Os hashes das demais fontes de `src/`, `scripts/` e `public/` continuam iguais; só o HTML dessa seção e o CSS local mudaram. Pacotes locais atualizados.
