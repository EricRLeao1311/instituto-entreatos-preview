# Publicar uma prévia no GitHub Pages

Status: em andamento

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
