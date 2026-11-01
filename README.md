# Instituto Entre Atos — site em código

Reconstrução do site público [institutoentreatos.com.br](https://institutoentreatos.com.br/), consultado em **30/10/2026**. A versão atual mantém as 21 rotas originais e acrescenta Biblioteca: 22 páginas e uma 404. HTML, CSS, JavaScript, imagens, vídeos de fundo e fontes ficam neste projeto. A apresentação funciona sem hospedagem Webflow, CMS remoto ou instalação de pacotes. A apresentação agora usa cópias locais do motor de interações exportado e do jQuery para preservar os efeitos originais.

## Começar

Use Node.js 24 para desenvolvimento e testes completos. Abra um terminal nesta pasta e execute:

```sh
node scripts/serve.mjs --watch
```

Abra `http://127.0.0.1:4173`. Depois de editar um arquivo em `src/` ou `public/`, atualize o navegador. Para gerar a versão de publicação:

```sh
npm ci --ignore-scripts
node scripts/build.mjs
node --test
```

O resultado fica em `dist/`. Abra o site por HTTP, usando o servidor acima; abrir o HTML diretamente por duplo clique não carrega os módulos JavaScript corretamente. Os mesmos comandos também estão disponíveis como `npm run dev`, `npm run build` e `npm run check`, se o npm estiver instalado. A apresentação e o build estático não precisam de pacotes; a suíte completa instala uma dependência de desenvolvimento para testar o SQL real do backend.

## Onde editar

| Alteração | Fonte principal |
| --- | --- |
| Texto de uma página | `src/sections/<página>/` |
| Ordem das seções | `src/pages/<página>.html` |
| Nome, cargo, foto e biografia da equipe | `src/content/team.json` |
| Retratos e frases que passam na capa | `src/content/portraits.json` |
| Menu e rodapé | `src/components/header.html` e `footer.html` |
| Título, descrição e endereço de cada página | `src/content/pages.json` |
| E-mail, domínio e integrações | `src/content/site.json` |
| Mudança visual nova | `src/styles/site.css`, com seletor limitado à página ou componente |

O [mapa de edição](docs/MAPA-DE-EDICAO.md) identifica todos os arquivos de seção. A [arquitetura](docs/ARQUITETURA.md) explica como o site é montado. Leia [AGENTS.md](AGENTS.md) ao iniciar um trabalho com IA; o arquivo [CLAUDE.md](CLAUDE.md) aponta para as mesmas regras.

## Fidelidade visual e animações

A revisão 2 restaura o motor, os 623 eventos e as 72 listas de ações publicados no site original, incluindo os tempos, easing, carrosséis, máscaras, entradas, parallax e hover. As substituições visuais simplificadas da primeira entrega foram removidas. Os scripts ficam em `public/vendor/` e a configuração legível em `src/content/interactions.json`. Consulte [ANIMACOES.md](docs/ANIMACOES.md) antes de alterar IDs ou comportamento.

## Estado das integrações

O site é estático. Não há banco de dados ou serviço de e-mail escondido no projeto. O formulário de contato tem um fluxo funcional de preparação de e-mail, que o visitante conclui no próprio aplicativo de e-mail. O envio direto requer configurar um endpoint. O formulário da pesquisa abre o PDF incluído no projeto; salvar cadastros requer configurar um receptor. Consulte [INTEGRACOES.md](docs/INTEGRACOES.md).

Os vídeos de depoimentos continuam hospedados no YouTube. Matérias de imprensa, documentos no Google Drive, redes sociais e WhatsApp permanecem links externos. Uma cópia estática não transfere a administração dessas contas.

## Documentação

- [Arquitetura e decisões](docs/ARQUITETURA.md)
- [Mapa de edição por página](docs/MAPA-DE-EDICAO.md)
- [Conteúdo, equipe, imagens e novas publicações](docs/CONTEUDO.md)
- [Estilos e responsividade](docs/ESTILOS.md)
- [Integrações e formulários](docs/INTEGRACOES.md)
- [Verificação e critérios de aceite](docs/VERIFICACAO.md)
- [Publicação e GitHub](docs/PUBLICACAO.md)
- [Formulários que existiam na origem](docs/FORMULARIOS-ORIGINAIS.md)
- [Animações e motor local](docs/ANIMACOES.md)
- [Migração: fontes, diferenças e pendências](docs/MIGRACAO.md)
- [Modelos de tarefas para IA](docs/tasks/README.md)
- [Relatório de entrega](docs/ENTREGA.md)

`docs/reference/` é um registro de consulta do site de origem: textos visíveis, procedência dos arquivos e blocos antigos removidos. Esses arquivos não alimentam o site. `src/` e `public/` são as fontes editáveis; `dist/` é gerado e pode ser recriado.

## Publicar

Suba a pasta inteira para um repositório GitHub e configure a hospedagem para gerar `dist/` com `node scripts/build.mjs`. O projeto usa caminhos a partir da raiz do domínio. Está pronto para um domínio próprio, incluindo o domínio atual; publicação em `usuario.github.io/nome-do-repositorio/` exige adaptação de base path. O fluxo incluído em `.github/workflows/check.yml` verifica alterações, sem publicar automaticamente.

Os direitos sobre marca, fotografias, conteúdo editorial e recursos visuais seguem os titulares originais. Este projeto não altera a autoria desses materiais nem concede uma licença geral sobre eles. A origem dos arquivos está registrada em `docs/reference/assets.json`.

## Otimização de 01/11/2026

Fontes WOFF2 completas, variantes gzip/Brotli no build e revalidação no servidor local. O estilo e as configurações de animação foram preservados. Veja [resultados, verificações e configuração da hospedagem](docs/DESEMPENHO.md).

## Correção de preservação de 01/11/2026

A revisão que redesenhou componentes foi rejeitada e restaurada. Textos reaplicados nos componentes originais, cabeçalho e carrossel protegidos, sem troca de motor ou estilos globais. Veja [a política obrigatória](docs/PRESERVACAO.md), [a correção e evidências](docs/CORRECAO-PRESERVACAO.md) e [o backend pendente](docs/BACKEND-PENDENTE.md). A suíte atual tem 43 testes, incluindo os contratos de apresentação e o receptor local.

## Prévia no GitHub Pages

A publicação pelo GitHub usa `.github/workflows/pages.yml` e gera `dist-pages/` com o caminho do repositório. A edição continua em `src/` e `public/`, preservando os componentes e os contratos existentes. A suíte tem 43 testes, incluindo a adaptação de URLs e o receptor local. Veja [o guia de publicação](docs/PUBLICACAO.md).

## Backend local de teste

Execute `node backend/preview.mjs` e abra `http://127.0.0.1:4287/`. Salva contatos e cadastros em SQLite e captura e-mails para conferência, sem envio externo. Para conferir os dados localmente: `node backend/inspect.mjs`. Banco fora da pasta pública e ignorado no Git. A prévia do GitHub Pages continua estática e não recebe esses cadastros. Consulte [BACKEND-TESTE.md](docs/BACKEND-TESTE.md) e [LEVANTAMENTO-WEBFLOW.md](docs/LEVANTAMENTO-WEBFLOW.md). O site oficial não foi modificado.

## Backend para hospedar e manutenção com IA

O código está preparado para um projeto separado de teste na Vercel, com Postgres/Supabase e envio Resend. Contas, banco e credenciais ainda precisam ser configurados; nenhum backend online ou entrega real foi validado. O modo inicial captura mensagens sem envio e o modo de envio exige lista de destinatários de teste. Não altera Webflow, DNS nem domínio da cliente.

Leia [a arquitetura e os limites do backend](docs/BACKEND-CLOUD.md) e [o guia de ativação](docs/ATIVAR-TESTE.md). O build Vercel é separado (`dist-vercel/`); GitHub Pages continua com seu fluxo alternativo. O receptor SQLite local permanece disponível por `npm run preview:backend`.

**Toda mudança com IA precisa ser registrada em `docs/tasks/`, com responsável/IA, pedido, escopo, decisões, verificações reais e pendências, no mesmo conjunto da alteração.** A CI verifica a presença das seções obrigatórias; revisão humana continua necessária. `AGENTS.md` é a fonte de regras, inclusive para Claude via `CLAUDE.md`.
