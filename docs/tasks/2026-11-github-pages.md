# Publicar uma prévia no GitHub Pages

Status: concluído em 01/11/2026

## Autorização e escopo

O usuário autorizou criar o repositório na própria conta, enviar o código e publicar. A conta autenticada é EricRLeao1311; o repositório novo será `instituto-entreatos-preview`, público conforme a opção de GitHub Pages previamente explicada. O site atual da cliente e o domínio próprio permanecem separados desta prévia.

Arquivos previstos: `scripts/build-pages.mjs` e módulo de adaptação de URLs, testes dos caminhos, `.github/workflows/pages.yml`, `.gitignore`, guia de publicação e esta tarefa. Criar o repositório e ativar Pages após os testes locais. Nenhum arquivo de apresentação, componente, texto editorial ou dado de animação precisa mudar.

## Critérios de aceite

- Build e contratos existentes aprovados.
- Artefato separado `dist-pages/` com prefixo do repositório em navegação, imagens, fontes, vídeos e PDF; a prévia local na raiz continua funcionando.
- Segredos, logs, documentos de trabalho e artefatos gerados não entram no repositório.
- Publicação automática pelo GitHub Actions, com permissões limitadas à leitura do código e publicação de Pages.
- Endereço publicado conferido em páginas diretas, mídia e navegação, com cabeçalho/carrossel originais.
- Backend permanece pendente, como determinado pelo usuário.

## Resultado e evidências

- Repositório criado: https://github.com/EricRLeao1311/instituto-entreatos-preview
- Prévia publicada: https://ericrleao1311.github.io/instituto-entreatos-preview/
- Commit publicado: `36895f7`; execução aprovada: https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41344111537
- Build e 24 testes aprovados tanto localmente quanto no GitHub. Os sete arquivos com contratos de bytes foram conferidos também no índice Git; `.gitattributes` conserva os arquivos protegidos ao clonar em Linux.
- 28 verificações HTTP aprovadas no endereço público: 22 páginas, três scripts, duas folhas de estilo e o PDF. Todas retornaram 200. Antes da publicação, 2.006 referências locais de HTML e as referências de CSS foram conferidas no artefato.
- Navegador público: apresentação pronta, nenhuma imagem quebrada na Home, nenhuma mensagem de erro ou aviso na Biblioteca; o link da Home abre o diálogo original de pesquisa e o contato recebe corretamente `motivo=convidar-instituto`.
- Artefato conserva os bytes dos scripts de terceiros e o CSS original, descontando apenas o prefixo de URLs locais. Nenhuma mudança visual, editorial ou nos dados de animação foi necessária.
- Cadastros, envio de pesquisa por e-mail e recebimento direto de mensagens continuam pendentes, conforme `docs/BACKEND-PENDENTE.md`.
