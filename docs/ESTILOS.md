# Estilos e responsividade

## Camadas

**Padrão atual:** para a revisão visual autorizada em 03/11, leia `PADRAO-VISUAL.md`. `editorial.css` carrega após `site.css` e é a camada atual para escala, CTAs e organização responsiva. Os arquivos anteriores continuam preservados. As observações históricas abaixo descrevem a camada de origem e as primeiras correções.

A ordem dos estilos no layout faz parte do contrato: `fonts.css`, `legacy.css`, `base.css` somente onde existia na origem, `site.css` e os estados iniciais do arquivo `*.head.html`.

- `fonts.css`: famílias baixadas para uso local.
- As fontes locais usam WOFF2 completo, convertido sem remoção de glifos. Os originais permanecem em `public/assets/`. Consulte `DESEMPENHO.md` antes de trocar fontes ou regenerar as conversões.
- `legacy.css`: regras da apresentação de origem, incluindo tipografia, grids, espaçamentos, cores e breakpoints. É uma camada de compatibilidade visual, com nomes herdados do Webflow.
- `base.css`: ajustes globais de texto, alinhamento e utilitários que estavam no HTML original.
- `site.css`: link de pular conteúdo, status dos formulários e 404. As substituições de hover, menu, máscaras e carrossel da primeira entrega foram retiradas; esses comportamentos pertencem ao motor original. Lugar padrão para mudanças novas, com escopo explícito.

## Alterações isoladas

Para mudar apenas uma página, ancore o seletor no atributo do `body`:

```css
[data-page="contato"] .form-label { font-weight: 600; }
```

Para uma nova seção, adicione uma classe com significado próprio, como `.research-summary`. Evite editar `.section`, `.container-huge`, `.heading-style-h1`, `.button-primary`, `_1` ou IDs `w-node-*` para resolver um caso local: esses seletores são compartilhados ou posicionam elementos nos grids.

Uma mudança global de tipografia, cor ou botão precisa comparar pelo menos a capa, contato, uma publicação e Quem somos. Uma mudança local precisa comparar a página alterada e uma página de controle que usa os mesmos componentes.

## Layouts responsivos de origem

O desenho original usa grades distintas para desktop e celular em Quem somos e Depoimentos. Elas foram preservadas como seções separadas porque possuem ordens e espaçamentos diferentes. Ambas precisam continuar presentes. Os dados existentes da equipe estão centralizados; a grade de depoimentos ainda contém sua marcação editorial em ambas as variantes.

Breakpoints herdados principais: 991, 767 e 479 pixels. A correção de 01/11 apenas torna visível o contêiner original do botão de menu entre 480 e 991px, conforme o pedido de corrigir o corte em tablet. O componente e o runtime de navegação permanecem originais. Preserve os demais estilos e transições; leia `PRESERVACAO.md`. Teste pelo menos 1440 × 1000 e 390 × 844; compare também 768 e 1024 quando alterar colunas ou navegação.

## Movimento e acessibilidade

O desenho e o comportamento das animações vêm de `src/content/interactions.json` e do motor local em `public/vendor/`. Foram restaurados os tempos de 120/180 segundos do percurso dos retratos, o hover de 400 ms, máscaras, estados de opacidade/transform, parallax e contadores. A configuração completa é a autoridade; consulte `ANIMACOES.md` para os IDs e valores exatos.

O botão adicional de pausa e as regras de movimento da primeira entrega não fazem parte da apresentação original e foram removidos. O comportamento de redução de movimento do runtime exportado permanece como publicado. O diálogo possui suporte complementar a Escape e navegação por teclado sem mudar sua geometria.

Os estados iniciais podem deixar elementos transparentes até o runtime inicializar ou até o gatilho de rolagem acontecer, como no original. Uma captura muito cedo não prova que o conteúdo sumiu. Para testar, confira o marcador `data-presentation-ready` no HTML e a animação após seu gatilho. Não force `opacity: 1` globalmente nem remova máscaras para esconder uma falha: isso altera a apresentação solicitada.

## Distribuição dos blocos editoriais corrigida em 02/11

Reaproveitar `.card-3` sem os IDs posicionais da origem deixou duas crianças ocupando somente duas das seis colunas. Não basta copiar as classes: confira a largura efetivamente ocupada pelo título e pelo conteúdo, inclusive em desktop largo. Uma linha de 1345px com texto em 197px não atende à distribuição solicitada.

O pedido específico do usuário autorizou a correção de onze linhas. `.editorial-row` marca apenas o manifesto da Home, oito linhas de aprendizado/participações em Nossa atuação e Apoiadores/Agenda de Quem somos. Em Nossa atuação/Quem somos, título ocupa duas colunas e conteúdo quatro; botões mantêm largura natural. O manifesto tem o conjunto centralizado e seu contêiner ocupa toda a largura. O empilhamento móvel vem do CSS original. Não estender o marcador indiscriminadamente aos cards antigos que já possuem IDs posicionais, às grades bento ou à equipe.

Nos dois grupos novos de Nossa atuação, `.editorial-list` mantém uma linha por cartão também em tablet. A regra antiga de `.side-by-side` fazia dois cartões por linha nessa largura, apertando novamente o texto; o ajuste fica restrito a esses dois grupos. Não muda o layout dos grupos antigos.

Regras em `site.css`, com escopo de página. Registro: `docs/tasks/2026-11-distribuicao-manifesto-blocos.md`; acréscimo autorizado em `docs/reference/presentation/editorial-row-layout-adjustment.json`. Baselines históricos, fontes, cores, dimensões tipográficas e animações não foram substituídos.
