# Editar conteúdo

Antes de editar, leia `PRESERVACAO.md`. O conteúdo novo deve entrar nos componentes existentes; referências editoriais não autorizam redesenho.

## Texto de uma seção

Encontre o arquivo no mapa de edição e altere o texto entre as tags. Preserve as classes, a hierarquia e os IDs quando o pedido for somente editorial. Os nomes dos arquivos começam pela ordem na página. O arquivo de composição em `src/pages/` é a autoridade sobre a ordem efetiva.

Textos duplicados em `.button-label` e `.button-label.hover`, ou `.menu-label` e `.menu-label.hover`, formam a transição visual do mesmo botão. Altere ambas as cópias; a cópia `.hover` deve continuar marcada `aria-hidden="true"`.

## Equipe e retratos

`src/content/team.json` contém seis registros `member1` a `member6`. Campos: `name`, `role`, `bio`, `image` e `srcset`. As duas grades responsivas de Quem somos usam os mesmos campos para os registros existentes. Para adicionar uma pessoa, adicione o registro e a marcação nas duas grades indicadas no mapa, preservando a composição visual. Adicionar somente o JSON não cria automaticamente um card na grade.

`src/content/portraits.json` contém os dez retratos da capa. Campos: `name`, `role`, `quote`, `image` e `srcset`. A revisão 2 preserva as listas repetidas e os atributos do carrossel exportado; os registros existentes continuam centralizados, mas adicionar um registro também exige inserir sua marcação nas variantes desktop e celular da capa. Preserve a quantidade e as duplicações necessárias ao percurso de animação ou ajuste o percurso de forma deliberada, seguindo `ANIMACOES.md`.

Os vídeos e textos da página Depoimentos são conteúdo distinto dos retratos da capa; edite seus arquivos de seção. Se o pedido mudar o mesmo depoimento nos dois lugares, ambos estão no escopo. Não propague uma frase para pessoas diferentes por semelhança visual; há repetições de frases no site de origem, registradas no histórico de migração.

## Imagens e fontes

Adicione novos arquivos em `public/assets/` com nomes claros. Use `/assets/nome.ext` no HTML ou JSON. Para uma nova foto, informe um texto alternativo que identifica o retratado ou descreve a função da imagem. Uma imagem decorativa pode usar `alt=""`. Se houver `srcset`, atualize as variantes ou remova o atributo ao usar um único arquivo; uma imagem antiga em `srcset` pode prevalecer sobre `src`.

Os arquivos migrados têm um prefixo curto de hash para evitar colisões, seguido do nome de origem. A procedência e a integridade da captura estão em `docs/reference/assets.json`. Esse manifesto é histórico: novos arquivos editoriais não precisam se passar por arquivos capturados na migração.

## Adicionar uma publicação

1. Escolha um slug estável em português sem acentos, como `/publicacoes/nova-pesquisa`.
2. Crie `src/sections/nova-pesquisa/01-artigo.html`. Use uma publicação existente como referência de estrutura; substitua título, imagem, data e corpo completos.
3. Crie `src/pages/nova-pesquisa.html` com `<!-- include:sections/nova-pesquisa/01-artigo.html -->`.
4. Adicione um objeto em `src/content/pages.json` com `route`, `key`, `title`, `description` e `template`.
5. Inclua o card na listagem em `src/sections/publicacoes/`. Os cards da listagem são HTML editorial: cadastrar uma rota não cria automaticamente o card.
6. Atualize `docs/MAPA-DE-EDICAO.md` e os números de inventário nos testes e documentos que descrevem a captura. Nos testes, aumente o total somente pelo número de páginas efetivamente adicionado.
7. Gere o site, rode os testes e abra a URL diretamente, sem passar pela capa. Verifique o card, o corpo e a leitura em celular.

## SEO e links

`pages.json` define título e descrição; o endereço canônico vem de `site.url` + `page.route`. O sitemap é gerado a partir das mesmas rotas. Para alterar um slug já publicado, configure um redirecionamento permanente na hospedagem. Preserve o domínio atual na configuração enquanto a reconstrução substituir o mesmo site; em um domínio definitivo novo, atualize `site.url`.

Os links de mídia, Google Drive e redes sociais são externos e pertencem à origem. Corrija um destino somente com um endereço confirmado. Links em nova aba usam `rel="noopener noreferrer"`.

## Conteúdo reaplicado em 01/11

O carrossel da Home foi extraído sem alterações para `components/home-carousel.html` e movido para depois da definição de pausa. Preservar essa fonte protegida: os textos e as imagens continuam em `portraits.json`. Há oito pessoas e dois slots repetidos para manter a geometria. Os demais elementos repetidos do componente também são técnicos.

O menu conserva seus wrappers e duas labels de hover; alterar as duas cópias editoriais. Biblioteca compõe mídia, análise externa, acervo preservado, formulário da pesquisa, livro e inscrição, com os padrões existentes. Para um conteúdo novo, use os wrappers e os botões existentes; registre a necessidade de cada nó adicional na tarefa. O relatório atual é `CORRECAO-PRESERVACAO.md`; a revisão que introduziu um sistema visual paralelo foi rejeitada.
