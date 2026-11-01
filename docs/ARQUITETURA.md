# Arquitetura

## Decisão principal

O produto é um site editorial, sem área autenticada. A publicação estática não armazena dados privados; o receptor opcional de teste local usa um banco separado, descrito no final deste documento. Um gerador estático pequeno permite produzir HTML completo e legível sem um framework ou dependências de instalação. Na opção estática, Node.js executa a montagem e o servidor de desenvolvimento. A hospedagem recebe arquivos estáticos; não precisa executar Node.

O projeto foi separado a partir da apresentação existente, preservando a geometria e as regras visuais que já estavam publicadas. A revisão 2 carrega uma cópia local do runtime de apresentação exportado, com os mesmos dados de interações, para preservar sua fidelidade visual. A inicialização do editor, marca, comércio e formulários hospedados foi retirada. Não se trata de uma nova implementação de CSS com uma nomenclatura inteiramente nova: a camada `legacy.css` é deliberadamente preservada e documentada.

## Camadas e responsabilidades

| Camada | Responsabilidade | Pode conhecer |
| --- | --- | --- |
| `src/content/` | Configuração, metadados, conteúdo repetido e dados originais de interações | Dados, URLs e alvos de animação |
| `src/pages/` | Composição, chrome e estados iniciais por página | Caminhos e identidade original |
| `src/sections/<página>/` | HTML editorial e estrutura específica | Componentes e variáveis |
| `src/components/` | Cabeçalho, rodapé, fundo, cards e carrossel | Contratos de dados documentados |
| `src/layouts/base.html` | Documento HTML, SEO e arquivos compartilhados | Página, configuração e conteúdo |
| `src/styles/` | Fontes e apresentação | Classes e marcadores de página |
| `src/scripts/` | Interações no navegador | Elementos `data-*`, configuração pública |
| `scripts/` | Montagem, validação de templates e servidor local | Sistema de arquivos do projeto |
| `public/assets/` | Mídia, fontes e PDF copiados sem transformação | Nenhuma lógica |
| `public/vendor/` | Motor IX2, jQuery e módulos de apresentação exportados | DOM e configuração local |
| `tests/` | Contratos do gerador e integridade do site | Fontes e saída gerada |

## Fluxo de montagem

1. `build.mjs` lê `site.json`, `pages.json`, `portraits.json`, `team.json` e `interactions.json`.
2. Para cada rota, lê a composição em `src/pages/`, o arquivo `*.chrome.html` com cabeçalho/fundo e o `*.head.html` com os estados iniciais. O `originalPageId` vai para o atributo `data-wf-page`. O `base.css` só é carregado nas páginas que continham esse bloco na origem; aplicá-lo a todas altera margens de listas em artigos.
3. `expandIncludes` resolve recursivamente os comentários `include:`. Uma inclusão circular ou fora de `src/` interrompe o build.
4. `expandCollections` expande `repeat:` usando os registros de uma coleção e um componente com variáveis `item.*`.
5. `interpolate` resolve as variáveis restantes e escapa caracteres HTML. Variável desconhecida interrompe o build.
6. O build copia estilos, módulos e arquivos públicos, emite `/scripts/interactions.js` com o objeto original, escreve cada rota como `<rota>/index.html` e gera `sitemap.xml`, `robots.txt` e `404.html`.

`dist/` é recriado por completo a cada build. Um erro interrompe a geração; por isso a hospedagem deve publicar somente após o comando terminar com sucesso. O observador local reconstrói com debounce e informa erros no terminal; atualize o navegador após a conclusão.

## Templates

```html
<!-- include:sections/home/01-hero.html -->
<p>{{content.portraits.0.quote}}</p>
<a href="mailto:{{site.email}}">Fale conosco</a>
<h1>{{page.title}}</h1>
<p>{{content.team.member1.bio}}</p>
```

As substituições são texto, inclusive em atributos. Não existe avaliação de JavaScript nos templates, execução de expressões ou interpolação de HTML arbitrário. Texto rico editorial continua em HTML de seção. Um `repeat:` recebe um array do objeto `content`; o componente da coleção só usa `item.*`. Includes são resolvidos antes das coleções.

## Navegador

A ordem de carga é feature flags no head, jQuery local, módulos locais do runtime, bootstrap e configuração de interações. O motor original controla menu, hover, máscaras, carrosséis, parallax e abertura/fechamento visual da pesquisa. `main.js` inicializa `research.js` para teclado, `forms.js` para envio explícito e `counters.js` com a animação numérica original. Uma mudança editorial não deve exigir mudar esses módulos. Os IDs `data-w-id` identificam elementos usados pelas ações e precisam ser preservados.

O arquivo `/scripts/config.js` é gerado, contém apenas e-mail e configuração pública da pesquisa e nunca deve receber segredos. O conteúdo das páginas já está no HTML e não depende desses módulos para aparecer.

## Entrega otimizada

O build também chama `scripts/compress.mjs` para gerar variantes gzip/Brotli sem alterar os arquivos originais. `scripts/http.mjs` concentra negociação, MIME e revalidação por ETag no servidor local. As fontes WOFF2 completas já estão em `public/assets/`; o conversor opcional não participa do build. Decisões, resultados e contratos de manutenção: [Desempenho](DESEMPENHO.md).

## Evolução dos componentes

Crie um novo componente quando houver repetição real com o mesmo contrato. Mantenha uma seção isolada quando o desenho ou significado forem exclusivos daquela página. Acrescente uma nova dependência apenas quando houver um requisito que o código atual não atende, registrando o motivo e o novo processo de instalação. Um CMS ou backend pode ser integrado no futuro, sem mudar as rotas e o layout existentes.

## Reaplicação editorial com componentes preservados

O carrossel foi extraído literalmente para `src/components/home-carousel.html`, mantendo as duas variantes e seu runtime. A Biblioteca compõe a seção existente de Publicações e oferece acesso à página de imprensa original. `contact.js` acrescenta somente a seleção do motivo por URL. O acesso direto à pesquisa aciona o evento do diálogo original em `research.js`. Nenhum motor alternativo de navegação, carrossel ou animação foi introduzido. Consulte `CORRECAO-PRESERVACAO.md`.

## Adaptador de publicação em subdiretório

`build-pages.mjs` mantém o build normal e cria `dist-pages/`. `pages-paths.mjs` prefixa apenas endereços locais em atributos HTML/SVG e URLs CSS; configuração do PDF e comparação de pathname do diálogo são adaptadas na saída. Fontes de apresentação e vendor permanecem intactos. Testes do adaptador cobrem URLs externas, fragmentos, srcset, vídeo, fonte e caminhos inválidos. Os arquivos protegidos por hash recebem `-text` em `.gitattributes` para conservar os mesmos bytes ao publicar via Git em outro sistema operacional.

## Backend opcional de teste local

`backend/` é separado do gerador estático. `server.mjs` reutiliza o servidor HTTP existente e acrescenta dois receptores e uma resposta local de configuração; `store.mjs` encapsula SQLite e a transação de cadastro/caixa de saída. `preview.mjs` limita a execução a loopback e `inspect.mjs` é a consulta local do operador. Sem novas dependências. Os dados ficam em `.local-data/`, fora de `dist/` e do Git. Nenhuma API de leitura de dados pessoais é publicada. O backend não executa no GitHub Pages e não reutiliza o receptor do Webflow de produção. Guia: `BACKEND-TESTE.md`.

## Backend para hospedagem de teste

O front-end permanece estático. `api/` contém entradas Web Standard da Vercel; `backend/cloud/` recebe requisições, chama transações Postgres pelo REST do Supabase e tenta envio pelo Resend. `backend/forms.mjs` concentra o contrato comum com o servidor SQLite existente. Persistência, cotas e fila ficam em funções SQL versionadas; APIs públicas não consultam dados pessoais. Sem dependência de runtime ou novo framework.

`build-vercel.mjs` gera `dist-vercel/`, com `noindex` e endpoints relativos ativados somente por `BACKEND_ENABLED=true`. Uma lista explícita controla a configuração pública, sem espalhar variáveis privadas no JavaScript. Builds `dist/` e `dist-pages/` continuam independentes. A escolha, os limites, as fontes oficiais e a manutenção estão em `BACKEND-CLOUD.md`; configuração pelo titular em `ATIVAR-TESTE.md`.

A suíte completa usa PGlite em desenvolvimento para executar o SQL real. `package-lock.json` fixa a versão e os workflows instalam com `npm ci --ignore-scripts`. A verificação de registro por tarefa antecede a publicação do Pages. Manter os scripts existentes `dev`, `preview`, `build` e `check`; `preview:backend` e `build:vercel` são acréscimos.
