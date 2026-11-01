# Mapa de edição

**Política atual:** leia `PRESERVACAO.md` antes de qualquer edição. A correção de 01/11 mantém os componentes originais e aplica apenas o conteúdo pedido; relatório em `CORRECAO-PRESERVACAO.md`.

A composição de cada rota fica em `src/pages/<key>.html`; os comentários `include:` determinam a ordem. A tabela aponta as fontes atuais. `dist/` é gerado e não é local de edição.

## Arquivos compartilhados

| Pedido | Fonte | Alcance |
| --- | --- | --- |
| Menu e logo do topo | `src/components/header.html` | Todas as páginas |
| Rodapé e links legais | `src/components/footer.html` | Todas as páginas |
| Diálogo da pesquisa | `src/sections/home/04-place.html` e `src/sections/publicacoes/01-events.html` | Marcações originais por página, com o mesmo comportamento exportado |
| Retratos da capa | `src/content/portraits.json` e `src/sections/home/01-hero.html` | Capa |
| Equipe existente | `src/content/team.json` | Duas grades de Quem somos |
| SEO e rotas | `src/content/pages.json` | Página selecionada |
| Domínio, e-mail e endpoints | `src/content/site.json` | Configuração global |
| Estrutura HTML e arquivos carregados | `src/layouts/base.html` | Todas as páginas |

`src/content/interactions.json` e `public/vendor/` preservam a animação publicada. Antes de alterar `data-w-id`, leia `docs/ANIMACOES.md`. Cada página possui ainda `*.head.html` (estados iniciais) e `*.chrome.html` (ordem do cabeçalho/fundo).

## Páginas institucionais

### /

Composição: `src/pages/home.html`. Escopo CSS: `[data-page="home"]`.

| Seção | Arquivo |
| --- | --- |
| Capa e apresentação, com estrutura original | `src/sections/home/01-hero.html` |
| Carrossel original nas duas variantes, movido inteiro | `src/components/home-carousel.html`, incluído por `src/sections/home/03-carousel.html` |
| Como trabalhamos, no bloco original | `src/sections/home/02-about.html` |
| Definição de pausa e introdução das histórias | `src/sections/home/03-approach.html` |
| Apresentação da pesquisa | `src/sections/home/04-place.html` |
| A pausa em números | `src/sections/home/05-benefits.html` |
| Logos e aparições na mídia | `src/sections/home/06-testimonials.html` |
| Instituto, aproximação e Agenda 2030 com padrões existentes | `src/sections/home/07-instituto.html` |

### /nossa-atuacao

Composição: `src/pages/nossa-atuacao.html`. Escopo CSS: `[data-page="nossa-atuacao"]`.

| Seção | Arquivo |
| --- | --- |
| Apresentação e serviços para empresas | `src/sections/nossa-atuacao/01-approach.html` |
| Serviços e apoio para profissionais | `src/sections/nossa-atuacao/02-approach-variant-2.html` |
| Vídeo institucional incorporado | `src/sections/nossa-atuacao/03-benefits.html` |

### /quem-somos

Composição: `src/pages/quem-somos.html`. Escopo CSS: `[data-page="quem-somos"]`.

| Seção | Arquivo |
| --- | --- |
| Capa e foto da equipe | `src/sections/quem-somos/01-hero.html` |
| Apresentação do Instituto | `src/sections/quem-somos/02-proximo.html` |
| O que nos move, prática e nome | `src/sections/quem-somos/03-approach.html` |
| Equipe: grade desktop | `src/sections/quem-somos/04-team.html` |
| Equipe: grade celular | `src/sections/quem-somos/05-team-variant-2.html` |
| Governança, conselho e aproximação nos cards antigos | `src/sections/quem-somos/06-approach-variant-2.html` |
| Apoiadores e metas ODS | `src/sections/quem-somos/07-agenda.html` |

### /publicacoes

Composição: `src/pages/publicacoes.html`. Escopo CSS: `[data-page="publicacoes"]`.

| Seção | Arquivo |
| --- | --- |
| Pesquisa, e-books e listagem de publicações | `src/sections/publicacoes/01-events.html` |

### /depoimentos

Composição: `src/pages/depoimentos.html`. Escopo CSS: `[data-page="depoimentos"]`.

| Seção | Arquivo |
| --- | --- |
| Apresentação dos depoimentos | `src/sections/depoimentos/01-about.html` |
| Vídeos e relatos: grade desktop | `src/sections/depoimentos/02-team.html` |
| Vídeos e relatos: grade celular | `src/sections/depoimentos/03-team-variant-2.html` |

### /na-midia

Composição: `src/pages/na-midia.html`. Escopo CSS: `[data-page="na-midia"]`.

| Seção | Arquivo |
| --- | --- |
| Apresentação e cards das matérias de imprensa | `src/sections/na-midia/01-store.html` |

### /contato

Composição: `src/pages/contato.html`. Escopo CSS: `[data-page="contato"]`.

| Seção | Arquivo |
| --- | --- |
| Canais de contato e vídeo | `src/sections/contato/01-hero.html` |
| Formulário de contato / convite de newsletter | `src/sections/contato/02-messages.html` |

## Publicações internas

Cada artigo tem sua própria composição e seção de conteúdo. Os cards que levam a esses artigos ficam na seção da página Publicações.

| Rota | Conteúdo |
| --- | --- |
| `/publicacoes/10-passos-para-escrever-uma-carta-de-apresentacao-de-sucesso` | `src/sections/10-passos-para-escrever-uma-carta-de-apresentacao-de-sucesso/01-hero.html` |
| `/publicacoes/como-funciona-um-programa-de-retorno` | `src/sections/como-funciona-um-programa-de-retorno/01-hero.html` |
| `/publicacoes/como-identificar-empresas-que-valorizam-profissionais-em-pausa-de-carreira` | `src/sections/como-identificar-empresas-que-valorizam-profissionais-em-pausa-de-carreira/01-hero.html` |
| `/publicacoes/construindo-uma-marca-pessoal-guia-para-o-sucesso` | `src/sections/construindo-uma-marca-pessoal-guia-para-o-sucesso/01-hero.html` |
| `/publicacoes/de-volta-ao-jogo-o-valor-de-um-programa-de-retorno` | `src/sections/de-volta-ao-jogo-o-valor-de-um-programa-de-retorno/01-hero.html` |
| `/publicacoes/entrevista-maria-luiza` | `src/sections/entrevista-maria-luiza/01-hero.html` |
| `/publicacoes/ferramentas-para-organizacao-e-planejamento-de-2025` | `src/sections/ferramentas-para-organizacao-e-planejamento-de-2025/01-hero.html` |
| `/publicacoes/maes-lideres---5-soft-skills` | `src/sections/maes-lideres---5-soft-skills/01-hero.html` |
| `/publicacoes/pausa-de-carreira-e-o-fim-de-ano-como-transformar-um-periodo-de-descanso-em-um-novo-comeco` | `src/sections/pausa-de-carreira-e-o-fim-de-ano-como-transformar-um-periodo-de-descanso-em-um-novo-comeco/01-hero.html` |
| `/publicacoes/porque-escolher-um-programa-de-retorno` | `src/sections/porque-escolher-um-programa-de-retorno/01-hero.html` |
| `/publicacoes/retorno-de-carreira-uma-nova-estrategia-para-o-recrutamento-corporativo` | `src/sections/retorno-de-carreira-uma-nova-estrategia-para-o-recrutamento-corporativo/01-hero.html` |
| `/publicacoes/voce-nao-perde-desempenho-porque-fez-uma-pausa-na-carreira` | `src/sections/voce-nao-perde-desempenho-porque-fez-uma-pausa-na-carreira/01-hero.html` |
| `/publicacoes/workshop---estrategias-para-retomar-sua-carreira` | `src/sections/workshop---estrategias-para-retomar-sua-carreira/01-hero.html` |
| `/publicacoes/workshop---melhorando-a-autoconfianca` | `src/sections/workshop---melhorando-a-autoconfianca/01-hero.html` |

## Cuidado com fontes diferentes

A frase de um retrato na capa e o relato em vídeo de Depoimentos são conteúdos diferentes. Quem somos preserva duas grades responsivas, alimentadas pelos dados existentes de `team.json`. Para adicionar ou remover uma pessoa, ajuste as duas grades. Novas publicações precisam de rota e card; leia `CONTEUDO.md` antes de adicionar.

Os nomes de arquivo de seções refletem a origem. IDs `w-node-*` ainda posicionam elementos; não são scripts do Webflow. Para mudanças visuais locais, preserve esses identificadores e acrescente uma classe explícita.

## Biblioteca

`/biblioteca` compõe `src/sections/biblioteca/01-navigation.html` e a seção original de Publicações. As categorias adicionais usam os mesmos botões e levam a `/na-midia` e `/depoimentos`, preservando layout e animações dessas rotas. As páginas antigas permanecem acessíveis. O link `/biblioteca#pesquisa-2025` aciona o diálogo original por `research.js`; nenhum outro motor de modal é usado.

Os perfis da Home são oito pessoas distintas em dez slots técnicos. A duplicação final de dois registros conserva a geometria do percurso original; não remover slots ou duplicações de markup para limpar o HTML. As duas grades de equipe continuam sendo as originais e leem os mesmos dados. Consulte os contratos em `docs/reference/presentation/` antes de alterar esses componentes.

## Ajustes locais autorizados nos três blocos da Home

Em `home/07-instituto.html`, `#sobre-instituto-home`, `#aproximacao-home` e `#agenda-home` compartilham a distribuição de título e conteúdo em `site.css`. O primeiro pedido autorizou os blocos Instituto/Agenda; o pedido posterior autorizou estender exatamente a mesma distribuição ao bloco intermediário. Registros: `docs/tasks/2026-11-layout-dois-blocos.md` e `docs/tasks/2026-11-layout-aproximacao.md`. Não estender esses seletores a outros cards sem um pedido correspondente.
