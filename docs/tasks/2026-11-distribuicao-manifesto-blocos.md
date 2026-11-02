# Corrigir a distribuição do manifesto e dos blocos recentes

Status: implementação e conferência local concluídas; publicação de teste em andamento

## Resultado esperado

Responsável: Codex, com assistência de IA. Pedido: o manifesto ficou colado à esquerda e vazio à direita; verificar outras partes semelhantes e ajustar a disposição. Ambiente: local e prévia GitHub Pages autorizada. Produção, Webflow, DNS e backend fora do escopo.

## Escopo

Correção local de distribuição, autorizada pela imagem codex-clipboard-99d60c30-40a1-4fe7-b142-4661bea47263.png e pelo pedido explícito. Centralizar título/botão/aviso do manifesto, sem acrescentar imagem ou conteúdo fictício. Nas outras linhas afetadas, reservar duas colunas ao título e quatro ao conteúdo, mantendo a grade existente. Conservar cores, fontes, tamanhos dos textos/botões, bordas, espaços verticais, conteúdo, links, estados e animações. No celular, conservar o empilhamento original.

Arquivos previstos: Home/08-manifesto; Nossa atuação/01-approach e 03-benefits (somente marcador nos oito cards de texto); Quem somos/07-agenda (somente marcador em Apoiadores/Agenda); site.css (regras limitadas a essas páginas e marcador); referência nova do acréscimo CSS autorizado e teste de apresentação para reconhecer esse pedido, sem alterar baselines históricos; mapa/estilos e este registro. Nenhuma mudança de menu, carrossel, fotos, vídeos, formulários ou backend.

## Referências e diagnóstico

AGENTS.md, PRESERVACAO.md, ESTILOS.md, mapa e VERIFICACAO.md lidos. Git limpo no início, versão anterior c15d592. A grade .card-3 tem seis colunas; os cards novos sem IDs posicionais ocupavam somente duas, com texto em 197px dentro de uma linha de 1345px em viewport 1440. Isso ocorreu no manifesto, nas três linhas de aprendizado/estado e cinco participações de Nossa atuação e nos dois cards de Quem somos/07. Os cards anteriores de Quem somos já têm conteúdo em 656px, com IDs posicionais próprios; serão preservados. Biblioteca/formulários, grades bento e Home/07 não exibem essa mesma causa e ficam intactos.

## Critérios de aceite

Manifesto equilibrado horizontalmente, demais textos usando a área à direita e botões com largura natural; 1440/1024/768/390 sem overflow; estilos e animações fora das linhas afetadas preservados; testes existentes e publicação de teste aprovados. A nova referência registra apenas o CSS deste pedido explícito, sem substituir o baseline para encobrir regressão.

## Execução

Arquivos reais: os quatro HTMLs previstos receberam somente o marcador `.editorial-row`, total onze cards; os dois grupos de Nossa atuação também receberam `.editorial-list` para evitar duas colunas estreitas em tablet. `site.css` recebeu apenas as regras limitadas por página/marcador. O manifesto usa toda a largura do seu contêiner e centraliza o grupo; os demais cards ocupam as seis colunas existentes na proporção título 2/conteúdo 4. Os estilos dos botões são os mesmos, com largura natural e limite da coluna. O empilhamento permanece em uma coluna nas telas menores.

Teste de apresentação reconhece a nova extensão autorizada em `editorial-row-layout-adjustment.json`, com pedido e referência a esta tarefa; não foram alterados os baselines anteriores. Mapa e guia de estilos explicam a causa e quando usar os marcadores. Nenhum conteúdo, destino, formulário, backend, imagem, menu, fonte, cor, carrossel, vendor ou dado de animação foi alterado.

## Verificação realizada

Diagnóstico e comparação no navegador em largura CSS real 1440px: onze linhas afetadas; textos de Nossa atuação/Agenda passaram de 197px para 886px, chegando à borda direita da linha de 1345px. Apoiadores passou de 306px para 886px, com logos distribuídos em duas colunas. Os oito cards anteriores de Quem somos permanecem com conteúdo em 656px.

Manifesto: centro do botão igual ao centro da linha (712,4px em desktop e 187,6px em celular). Conferido visualmente com título, botão e aviso centralizados, sem criar área de vídeo fictícia. Demais linhas mantêm título à esquerda e conteúdo amplo à direita. Em 1024/768/390px, Nossa atuação mediu respectivamente 609/625/303px para o texto; Quem somos também manteve uma coluna móvel. Sem rolagem horizontal: scrollWidth 1009/753/375px, respectivamente. Breakpoints originais e cores/fontes foram mantidos. A conferência aguardou as transições originais de entrada; não foi forçada opacidade.

`node scripts/build.mjs` gerou 26 páginas + 404. `node --test` após o ajuste final de tablet: **51 testes aprovados**. Os contratos de apresentação também passaram após a inclusão do acréscimo CSS autorizado, preservando todos os baselines anteriores. Nenhum teste que apenas imita o CSS foi acrescentado; a verificação de distribuição foi feita no navegador. Cópia anterior em `work/layout-manifesto/baseline-site`, fora do Git. Conferência de publicação/CI será registrada ao terminar.

## Pendências e entrega

Vídeo do manifesto continua pendente, com o mesmo botão desabilitado e aviso. Nenhuma nova dependência externa. Publicação somente na prévia.
