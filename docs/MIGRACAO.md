# Registro de migração — revisão 2

## Escopo e origem

Captura em **30/10/2026**, a partir do site público [Instituto Entre Atos](https://institutoentreatos.com.br/). Foram encontradas sete páginas na navegação e 14 publicações internas. O sitemap da origem respondia 404; o inventário foi construído pelos links e pela inspeção renderizada. A cópia agora gera seu próprio sitemap.

O [Website Downloader indicado](https://github.com/asimov-academy/Website-Downloader) foi consultado como referência, mas não foi instalado nem incorporado. Foram usados captura HTTP própria e navegador para separar o site em fontes editáveis e conferir sua apresentação.

## Fidelidade visual

A revisão 2 usa a folha visual publicada, as fontes e mídias locais, a hierarquia e os atributos originais, o motor de apresentação exportado e o objeto integral de 623 eventos / 72 listas de ações. Os tempos, easing, movimentos, máscaras, opacidade, hover, parallax e percursos dos carrosséis são os publicados.

As substituições visuais da primeira migração foram retiradas: carrossel CSS aproximado, botão adicional de pausa, botão adicional de navegação móvel, remoção das máscaras e estados iniciais e substituição dos controles de vídeo. Os embeds originais de Embedly/YouTube foram restaurados. O código dos contadores é o publicado na origem.

A configuração de ações está legível em `src/content/interactions.json`, separada do motor em `public/vendor/`. A inicialização dos módulos de editor, marca, comércio e formulários hospedados foi retirada. O motor visual não depende de uma conta Webflow ou de baixar scripts do seu CDN durante a visita. Os vídeos externos permanecem dependentes dos mesmos serviços do original.

`ANIMACOES.md` documenta os contratos e a verificação. A comparação usa o mesmo viewport e leva em conta carregamento de fontes/imagens; não se deve confundir um quadro transitório de vídeo com uma diferença de layout.

## Arquitetura de manutenção

As 21 rotas têm suas próprias composições. Há 36 seções de página, cabeçalho/rodapé compartilhados, configuração pública e dados centralizados da equipe e dos retratos existentes. Cada rota preserva seu identificador exportado, o chrome e os estados iniciais do head. Node.js monta HTML completo sem precisar de instalar pacotes.

Classes de variante e IDs de grid herdados foram mantidos. IDs HTML duplicados foram desambiguados sem alterar `data-w-id`. Os blocos globais de CSS são aplicados somente às páginas onde estavam publicados; aplicar os ajustes da capa aos artigos alterava as margens de listas, e isso foi corrigido.

## Conteúdo e limpeza

Foram preservados os textos institucionais, nomes, cargos, números, publicações, créditos e links legais. O e-mail com erro de digitação no rodapé foi alinhado ao endereço da página Contato. O PDF da pesquisa foi recuperado do redirecionamento do formulário e está local.

Seções editoriais ocultas do antigo template de padel foram retiradas; alguns wrappers técnicos de componentes permanecem para preservar a estrutura exportada. Eles não devem ser promovidos a conteúdo do Instituto. O histórico de blocos ocultos está em `reference/removed-blocks.json`; as ações exportadas também incluem ações antigas sem alvos na apresentação atual.

Um placeholder genérico do CDN respondeu 403 e foi substituído por um SVG neutro local, sem inventar conteúdo editorial. A ocorrência está no manifesto de arquivos.

## Formulários da origem e limite de migração

Contato e pesquisa tinham formulários ligados ao receptor padrão do Webflow. A pesquisa também tinha redirecionamento para seu PDF. O título de newsletter existia acima do próprio formulário Contact; não foi comprovada uma lista ou integração de newsletter independente. Consulte `FORMULARIOS-ORIGINAIS.md`.

O download público não transfere caixa de entrada, cadastros, configuração de destinatários ou automações privadas. Nenhuma submissão de teste foi enviada ao Instituto. Na cópia, o receptor precisa ser explicitamente configurado em `site.json`; enquanto vazio, o contato prepara um e-mail e a pesquisa oferece o PDF sem salvar dados. Esse limite funcional permanece mesmo com a apresentação restaurada.

| Pendência | Necessário |
| --- | --- |
| Recebimento direto de contato | Receptor próprio e confirmação de recebimento |
| Armazenamento do cadastro da pesquisa | Receptor e definição do destino dos dados |
| Newsletter, se houver automação privada | Confirmar o fluxo e provedor no painel original |
| Publicação final | Repositório, hospedagem e acesso ao domínio |

## Evidência e procedência

`reference/assets.json` registra a origem e integridade dos arquivos; `reference/vendor.json` registra bibliotecas e adaptações; `reference/original-forms.json` registra os atributos dos formulários. Os materiais seguem os direitos de seus titulares. A migração não dá acesso a contas privadas nem cria novas áreas de login.

Não houve publicação, alteração de DNS ou desativação do Webflow. O projeto é uma entrega local pronta para repositório e hospedagem estática.
