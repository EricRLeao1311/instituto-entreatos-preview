# GitHub e publicação

## Prévia pelo GitHub Pages

O usuário autorizou a criação do repositório público `EricRLeao1311/instituto-entreatos-preview` e a publicação de uma prévia separada. A configuração está em `.github/workflows/pages.yml`: primeiro gera e testa o site normal, depois gera `dist-pages/` e publica via Pages. Atualizações da aplicação na branch `main` disparam nova publicação; mudanças somente na documentação não precisam republicar o site. O workflow `check.yml` continua verificando todas as mudanças.

O comando específico é `node scripts/build-pages.mjs --base-path /instituto-entreatos-preview`. O adaptador gera uma cópia separada, modifica apenas URLs locais e o caminho do diálogo da pesquisa, e comprime novamente as variantes. Não editar componentes nem CSS para resolver o prefixo do GitHub. `dist/` continua disponível para execução local/produção na raiz. Ambos os diretórios gerados são ignorados no Git.

A prévia possui `noindex` e robots com `Disallow: /`, sem alterar os metadados nem as configurações do domínio atual da cliente nas fontes. Isso é uma orientação a buscadores, não uma restrição de acesso. Backend continua pendente. O guia abaixo descreve também a hospedagem definitiva na raiz de um domínio.


## Repositório

O repositório público desta prévia é [EricRLeao1311/instituto-entreatos-preview](https://github.com/EricRLeao1311/instituto-entreatos-preview). O site está em [GitHub Pages](https://ericrleao1311.github.io/instituto-entreatos-preview/). A publicação inicial foi aprovada em 01/11/2026, no commit `36895f7`, pelo [workflow de publicação](https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41344111537).

Versionados: `src/`, `public/`, `scripts/`, `tests/`, documentação e configuração. `dist/` e `dist-pages/` são gerados e ignorados no Git. Para atualizar, faça a alteração mínima autorizada, execute build e testes, registre o commit e envie à branch `main`. O GitHub publica automaticamente após os testes; confira o resultado na aba Actions. Mudanças apenas de documentação não disparam nova publicação.

## Hospedagem estática

| Configuração | Valor |
| --- | --- |
| Runtime de build | Node.js 22 ou superior |
| Comando | `node scripts/build.mjs` |
| Pasta de publicação | `dist` |
| Instalação de dependências | Desnecessária |
| Backend do site | Nenhum; receptor de formulários é uma integração separada |

Sirva a pasta gerada na raiz de um domínio. Cada rota tem seu próprio `index.html`, permitindo navegação direta e indexação. Configure a hospedagem para servir `404.html` com status 404 em URLs inexistentes; não use uma regra de SPA que retorne a capa para qualquer endereço.

O projeto usa caminhos absolutos como `/assets/...`. Para subdiretórios do GitHub Pages, use o adaptador `build-pages.mjs` descrito acima, já configurado e testado para esta prévia. Consulte a [documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) para configurar a fonte de publicação.

O arquivo `.github/workflows/check.yml` roda o build e os testes em pushes e pull requests. Ele não publica o site. A publicação desta prévia é feita pelo workflow separado `pages.yml`, já habilitado. Um domínio definitivo e suas integrações exigem configuração própria.

## Troca do site atual

Desde a revisão de 01/11/2026, o build inclui variantes gzip/Brotli e fontes WOFF2. A compressão está ativa no servidor local; o provedor externo precisa de compressão automática ou negociação configurada. A presença dos arquivos `.br`/`.gz` por si só não ativa compressão no provedor. Configure também revalidação por ETag. Consulte [Desempenho](DESEMPENHO.md) para resultados e contratos.

1. Publique `dist/` em um endereço de teste.
2. Confira as oito páginas institucionais e as 14 publicações, imagens, vídeos e formulário no endereço de teste.
3. Configure e valide os endpoints e confira a abertura do PDF local conforme `INTEGRACOES.md`.
4. Confira o valor de `site.url`, o sitemap, as rotas antigas e os redirects necessários.
5. A pessoa responsável pelo domínio altera DNS/hospedagem quando a versão estiver aprovada.
6. Confira HTTPS, URLs diretas, 404 e recebimento de mensagens no domínio final.

A prévia foi publicada em um endereço separado do GitHub Pages. O DNS e o domínio da cliente e sua conta Webflow permanecem sem alteração. Mantenha a versão atual disponível até concluir a validação de substituição.

## Voltar uma versão

Use o histórico de versões do provedor ou gere novamente `dist/` a partir de um commit conhecido. O conteúdo e os arquivos locais estão no repositório; a recuperação do receptor de formulários e de serviços externos segue o processo desses serviços.
