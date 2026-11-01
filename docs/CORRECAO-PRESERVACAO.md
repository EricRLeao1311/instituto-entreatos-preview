# Correção da revisão editorial com preservação

Data: 01/11/2026. Esta entrega substitui a revisão visual rejeitada pelo usuário.

## Causa e correção

A revisão anterior interpretou uma troca editorial como redesenho: substituiu o cabeçalho, o carrossel e as grades de pessoas. Os testes conferiam eventos IX2, conteúdo e ausência de overflow, mas não protegiam os componentes que executavam os efeitos. A checagem de regressão reproduziu a falha: o componente `.marquee-image-master` original não existia na revisão rejeitada.

A fonte inteira foi restaurada de `work/instituto-entreatos-antes-editorial.zip`, incluindo as otimizações aprovadas. A revisão rejeitada permanece em `work/rejected-editorial.zip`, fora da distribuição. Os DOCX continuam sendo as fontes de conteúdo; suas sugestões de redesenho não prevalecem sobre a ordem posterior do usuário de preservar o visual e as animações.

## Alterações limitadas ao pedido

| Pedido | Aplicação | Preservado |
| --- | --- | --- |
| Textos da Home e Quem somos | Textos nos nós existentes; metadados atualizados | Fontes, cores, classes, wrappers e entrada original |
| Menu com Biblioteca | Rótulos e destinos nos links originais; retirada dos itens que saíram | Cabeçalho, seus links duplicados de hover, runtime e transição |
| Carrossel na nova posição e perfis atualizados | Extração literal das duas variantes para `src/components/home-carousel.html`, movidas juntas | Todos os IDs, máscaras, tamanhos, percurso, hover e repetições técnicas |
| Equipe e conselho | JSON atualizado nas duas grades antigas; governança nos cards de texto existentes | Grades, fotos confirmadas, máscaras e gatilhos originais |
| Aproximação e Agenda 2030 | Seções adicionais usando wrappers, tipografia e botões do site | Camada visual global, sem sistema de componentes paralelo |
| Biblioteca com pesquisa, publicações e imprensa | Acervo/diálogo existentes reutilizados; link para a página de imprensa existente | Cards e animações próprios de cada página, sem copiar a imprensa como cards estáticos |
| Motivo de contato | Campo no formulário existente e pré-seleção por URL | Formulário e fluxo local anteriores |
| Menu cortado em tablet | Uma regra de visibilidade para `.nav-right.smaller-gap` entre 480 e 991px | Implementação e transições do menu original |

O carrossel possui oito perfis distintos aprovados e duas repetições técnicas para conservar os dez slots da geometria original. O loop já repetia elementos; não foram inventadas pessoas nem depoimentos. Mari C. e Sônia P. continuam com iniciais enquanto não houver fotografias corretas. As dimensões não foram reduzidas: a orientação mais recente do usuário é preservar o estilo do carrossel.

As alturas totais das páginas podem crescer por causa dos textos e das seções solicitados. Isso não autoriza reduzir a fonte ou redesenhar o componente para conservar uma altura total antiga.

## Guardrails novos

`AGENTS.md` contém a regra principal de mínima alteração e a leitura obrigatória de `PRESERVACAO.md`. `CLAUDE.md` aponta à mesma política. O modelo de tarefa pede a frase que exige cada mudança e os invariantes a conferir.

`tests/presentation.test.mjs` verifica as folhas visuais e estados iniciais, as grades originais da equipe, o componente completo do carrossel e a estrutura de cada link do cabeçalho. O CSS de complemento admite somente a regra de tablet desta tarefa. `docs/reference/presentation/baseline.json` foi extraído da versão anterior, não do redesenho rejeitado; alterar esse contrato para acomodar uma regressão é proibido pela política. A extração do carrossel normaliza somente as quebras de linha para o hash, sem mudar seu conteúdo.

## Verificação executada

- Build de 22 rotas + 404 e gzip/Brotli; 20 testes aprovados.
- Comparação do hover com cursor real: as versões anterior e corrigida apresentaram o mesmo deslocamento do texto e a mesma transição de 0,4s com `cubic-bezier(0.77, 0, 0.175, 1)`.
- Comparação de frames: desktop 400 × 520 com raio de 16px; variante móvel 300 × 420 com raio de 16px, iguais à referência. As medições e larguras reais disponíveis estão no JSON de evidências.
- Movimento automático confirmado por duas transformações diferentes; máscara e legenda atingiram opacidade 1 no retrato sob o cursor.
- Menu original abriu em 800px com exatamente cinco destinos visíveis, sem itens duplicados.
- Quinze verificações de layout: cinco páginas em 1440, 800 e 390px CSS reais, sem overflow horizontal da página.
- O link da Home para a pesquisa abriu o diálogo original na Biblioteca, com seus campos e efeitos.

Resultados e capturas em `reference/presentation/qa/`. Esses registros não constituem uma conferência de cada pixel de cada quadro em todos os navegadores.

## Escopo que permanece pendente

Backend de cadastros/envio de pesquisa e contato continua desativado, como o usuário determinou. Vídeo do manifesto, duas fotos e canal de YouTube dependem de material confirmado. Nenhum envio real, publicação, alteração de DNS ou Search Console foi executado. Consulte `BACKEND-PENDENTE.md`.
