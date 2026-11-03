# Tarefa: proporções e organização editorial do site

Status: concluída e publicada na prévia de teste

## Resultado esperado

Aplicar o pedido direto de 03/11/2026: títulos menores, leitura e botões coerentes, menos vazios, rodapé compacto e reorganização de Home, Nossa atuação, Quem somos e Biblioteca. Preservar a identidade e as principais animações.

## Escopo

- Responsável: Codex, com IA GPT-6, ferramentas de edição local e navegador.
- Ambiente autorizado: local e GitHub Pages de teste; produção, Webflow, domínio e e-mail real intocados.
- Referência anterior: commit d5e6d0a. Baselines históricos preservados.
- “todo o layout num geral pode ser melhorado”: escala compartilhada em uma camada CSS própria; fontes e paleta existentes mantidas. Botões com tamanho único e distinção primário/secundário, preservando o DOM do hover.
- “carrossel ... muito grande”: reduzir dimensões por CSS; conservar componente, duplicações, máscaras, IDs e runtime de movimento.
- Home: priorizar Como trabalhamos e diagrama compartilhado; reduzir capa/pesquisa; mover números à pesquisa da Biblioteca; aparições ao final; três links de imprensa/Instituto lado a lado.
- Rodapé: reduzir proporções, remover somente seu CNPJ, crédito Caio Jacinto/Eric Leão.
- Quem somos: linha do tempo com datas documentadas; Quem faz antes da equipe; LinkedIn sob Tetê; conselho junto das fotos, incluindo Sandra; retirar faixas redundantes; apoiadores compactos em linha.
- Biblioteca: reunir todas as matérias de Na mídia, conservar rota antiga, pesquisa/números/acervo; retirar CTA redundante da análise mantendo acesso pelo card.
- Arquivos previstos: composições e seções dessas páginas, componentes de método/equipe/rodapé/números, team.json, camada CSS editorial, layout de carga CSS, contratos afetados e documentação.
- Invariantes: motor, configuração IX2, cabeçalho, fontes, cores, fotos, textos aprovados (exceto cargos/crédito pedidos), consentimentos e backend; rotas e âncoras públicas preservadas.

## Referências

Pedido direto acima e DOCX de Quem somos/Home de 31/10 e 01/11; extração editorial existente em docs/reference/. A última autorização permite alterar proporções e organização, não substituição do motor.

## Critérios de aceite

- [x] Cada item pedido tem implementação e fonte rastreável.
- [x] Desktop, tablet e celular legíveis, sem overflow.
- [x] Conteúdo, rotas, consentimentos e funcionamento de controle preservados.
- [x] Build e testes passam; contratos históricos permanecem verificáveis.
- [x] Entrada, hover e movimento conferidos no navegador.
- [x] Padrão visual e obrigatoriedade de registro por IA documentados.

## Execução

Novo padrão em camada separada para não reescrever a referência histórica. Usada a skill writing-for-agents para manter instruções de manutenção específicas, vinculadas ao padrão e ao pedido.

| Fontes alteradas | Motivo e resultado |
| --- | --- |
| `src/styles/editorial.css`, `src/layouts/base.html` | Escala compartilhada, CTAs primários/secundários, leitura, largura máxima, espaçamento, grids responsivos e rodapé. Camada carregada após site.css; motor e fontes originais intactos. |
| `src/pages/home.html`, `sections/home/01-hero.html`, `02-about.html`, `03-carousel.html`, `05-benefits.html`, `07-instituto.html` | Método em destaque, capa menor, análise secundária, três links na mesma linha, aparições ao final, números movidos. A seção antiga de números vira alias de manutenção. |
| `components/method-cycle.html` | Diagrama compartilhado, texto acessível e setas SVG, com movimento CSS discreto e respeito a movimento reduzido. Fonte: imagem 1 do Word revisado da Home. |
| `sections/nossa-atuacao/01-approach.html`, `02-approach-variant-2.html`, `03-benefits.html` | Mesmo diagrama; botões de leitura discretos; grade regular e fotografias preservadas. IDs posicionais antigos criavam colunas implícitas no tablet: liberados somente nessa grade, por CSS. |
| `components/team-profiles.html`, `content/team.json`, `sections/quem-somos/04-team.html`, `05-team-variant-2.html` | Seis pessoas, duas executivas e quatro no conselho; Sandra identificada também como diretora de parcerias. Quem faz antes das fotos; LinkedIn sob foto de Tetê. Dois wrappers de revelação responsivos originais mantidos, cards compartilhados. |
| `src/pages/quem-somos.html`, `sections/quem-somos/03-approach.html`, `06-approach-variant-2.html`, `07-agenda.html`, `08-timeline.html` | Linha do tempo 2023–2026 transcrita da imagem 1 do Word revisado; faixas redundantes retiradas; apoiadores menores em linha, NOZ como crédito de metodologia; Agenda em grade. Governança conserva CNPJ, retirado somente do rodapé. |
| `components/research-numbers.html` | HTML original dos três números e seu contador preservados e incluídos dentro da pesquisa na Biblioteca. |
| `sections/biblioteca/01-navigation.html`, `components/media-cards.html`, `sections/na-midia/01-store.html` | Todas as matérias reunidas e com fonte compartilhada; rota antiga mantida. Análise acessível pela imagem/título, sem botão redundante. Navegação local para pesquisa, análises, materiais, mídia e livro. |
| `components/ebook-cards.html`, `sections/arquivo-be-back-now/01-archive.html` | Quatro ebooks também aparecem na Biblioteca, usando as mesmas capas/links; arquivo mantém 14 artigos. Sem nova coleta ou cópia de PDFs. |
| `components/footer.html` | Compacto, crédito Caio Jacinto / Eric Leão e remoção somente de seu CNPJ. Links legais e contato mantidos. |
| `tests/editorial.test.mjs`, `tests/presentation.test.mjs`, novo contrato JSON em `docs/reference/presentation/` | Exceções explícitas aos dois wrappers da equipe; baseline histórico, motor, estilos anteriores e DOM completo do carrossel continuam protegidos. Teste de aceitação cobre números/mídia/ebooks/pessoas e destinos. |
| `AGENTS.md`, `docs/PADRAO-VISUAL.md`, `PRESERVACAO.md`, `ESTILOS.md`, `MAPA-DE-EDICAO.md` | Fonte do novo padrão e limite desta autorização; futuras IAs registram toda mudança em docs/tasks no mesmo conjunto/commit. |

Contato e publicações recebem a escala compartilhada. O primeiro mantém vídeo, campos, motivos e estados; apenas seus grandes espaços e títulos foram ajustados por CSS. Biblioteca conserva formulários e consentimentos separados. Nenhuma alteração de backend.

## Verificação realizada

- Build local: 26 páginas + 404, gzip/Brotli.
- Suíte completa final executada após o build terminar: **52 testes aprovados, zero falhas**, incluindo os quatro ebooks. Uma rodada intermediária foi invalidada porque iniciou enquanto dist era recriado (ENOENT); repetida em sequência após a geração, sem alterar testes ou código para esconder falhas.
- Conferência em larguras CSS reais 1440, 1024, 768 e 390px. Home, Nossa atuação, Quem somos, Biblioteca e Contato sem overflow horizontal: scrollWidth 1425/1009/753/375px, respectivamente.
- Página de controle: `/publicacoes/como-funciona-um-programa-de-retorno` aberta no tablet e leitura conferida. Menu móvel aberto/fechado e link Como trabalhamos acionado.
- Home desktop: título de 80px para 48,96px; capa de 968,8 para 586,5px. Celular: título real de 44,8 para 32px, incluindo o strong interno que mantinha tamanho antigo.
- Rodapé desktop: 552,2 para 305,3px. Retratos desktop: 400×520 para 280×364px; celular 240×312px. Eventos: 360×240px no desktop, 280×187px no celular.
- Movimento do carrossel observado por matrizes diferentes ao longo do tempo; revelação de relato por hover observada com opacidade 1. DOM completo e configuração original continuam verificadas pelos contratos.
- Equipe: dois perfis executivos e quatro de conselho visíveis por viewport; LinkedIn de Tetê sob foto; linha do tempo, apoiadores e Agenda conferidos. Banner de vídeo mantém texto legível dentro de sua nova altura em desktop/celular.
- Biblioteca: números animam até 20/64/33, mídia aparece na mesma página; consentimentos iniciam desmarcados e envio sem serviço continua desativado. Quatro capas de ebooks visíveis e com opacidade 1 no desktop.
- Ebooks finais no celular de 390px: duas colunas de 159,6px, quatro capas e links visíveis; segunda linha conferida após rolagem. Sem overflow. Também conferido desktop de 1280px (quatro colunas de 274,2px).
- Baselines históricos inalterados. Novo CSS e componente da equipe têm hashes próprios vinculados ao pedido; duas exceções aos wrappers da equipe registram hashes antes/depois.
- Capturas e cópia privada da saída anterior em `work/padrao-visual/`, fora do repositório público. Capturas iniciais durante animação não constituem evidência final; entrega utiliza estado assentado.
- `node scripts/check-change-record.mjs --staged` e `git diff --cached --check`: aprovados antes do commit.
- Implementação: commit `1bba6a67e16b213d2b64694a61308db49129bacf`.
- CI de verificação aprovada: https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41627747269 .
- Build e publicação aprovados: https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41627747012 .
- Prévia pública conferida em https://ericrleao1311.github.io/instituto-entreatos-preview/ : camada editorial carregada no subdiretório, Home sem contadores, aparições antes do rodapé, crédito correto. Navegação pelo menu à Biblioteca: 13 matérias com link + um card pendente, quatro ebooks, três contadores; ambos os formulários seguem desativados após a inicialização, com aviso honesto e aceites desmarcados. Quem somos publicado: quatro marcos e seis pessoas por variante, com Sandra no conselho.
- Evidências finais inspecionadas: `work/padrao-visual/home-publicada.png` e `metodo-final.png`. Árvore de trabalho limpa após o commit de implementação.

## Pendências e entrega

Vídeos ausentes continuam pendentes. Backend e envios reais fora desta alteração visual. O registro de mídia “Voltar ao mercado” possuía URL de exemplo herdada (`imprensa.example.com`): conservado como card sem link ativo e indicação de endereço a confirmar; os outros 13 destinos foram preservados. Entrega publicada somente no GitHub Pages de teste; produção/Webflow/DNS/domínio oficial intactos.
