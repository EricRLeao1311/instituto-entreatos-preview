# Animações e fidelidade à origem

## Autoridade de apresentação

A revisão 2 restaura o motor exportado, os atributos do HTML e o objeto original de interações: **623 eventos e 72 listas de ações**. Tempos, easing, distâncias, opacidade, seletores, breakpoints e gatilhos não foram aproximados. A configuração é a publicada no bundle do site em 30/10/2026, extraída para um JSON legível.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/content/interactions.json` | Objeto original de eventos e ações; fonte editável somente para uma tarefa explícita de animação |
| `public/vendor/runtime-core.js` | Motor IX2 e componentes exportados; dados extraídos e inicialização de comércio removida |
| `public/vendor/runtime-polyfills.js` | Compatibilidade do runtime original |
| `public/vendor/runtime-slider.js` | Componente de slider exportado |
| `public/vendor/runtime-lightbox.js` | Lightbox original |
| `public/vendor/runtime-bootstrap.js` | Inicialização dos módulos visuais; editor, marca, formulários hospedados e comércio não são inicializados |
| `public/vendor/jquery-3.5.1.min.js` | Dependência local do runtime exportado |
| `src/scripts/feature-flags.js` | Classes iniciais `w-mod-js` e `w-mod-touch`, como na origem |
| `src/scripts/counters.js` | Código original dos números animados e seu easing de quarta potência |
| `src/pages/*.head.html` | Estados iniciais responsivos antes de o motor inicializar |
| `src/pages/*.chrome.html` | Ordem de fundo, cursor e cabeçalho da página |

Os arquivos de terceiros têm procedência, hashes e adaptações registradas em `reference/vendor.json`. Eles são mantidos localmente e não exigem uma conta ou hospedagem Webflow. Não são uma reescrita autoral de toda a biblioteca. O editor do Webflow e o recebimento de formulários continuam serviços separados e não são recriados por esse runtime visual.

## Efeitos restaurados

Incluem entrada da capa e cabeçalho, máscaras de imagens, hover de botões e links, percurso desktop/celular dos retratos, revelação dos textos sobre as fotos, logos em movimento, parallax de imagens/vídeo, navegação ao rolar, números e abertura/fechamento da pesquisa. O índice completo está em `reference/animation-actions.md`.

Exemplos relevantes: `a-89` usa 120.000 ms no percurso de ida dos retratos e 180.000 ms no retorno; `a-110` e `a-111` usam 400 ms com `easeIn` para a revelação/saída; `a-102` define o movimento dos logos; `a-103` e `a-104` definem a exibição do formulário da pesquisa. Esses exemplos não substituem a consulta à lista inteira antes de editar.

Scripts de Splide, Plyr e um antigo banner também apareciam na origem, mas seus seletores `.logo-carousel`, `#youtube-player` e `#home-popup` não existiam nos documentos consultados. Eles não controlavam a apresentação visível capturada e não foram ativados artificialmente na cópia.

## Contratos que uma IA precisa preservar

1. Mantenha `originalPageId` em `pages.json` e `data-wf-page` no HTML. Alvos no formato `página|elemento` dependem deles.
2. Mantenha os atributos `data-w-id`, as classes e a hierarquia dos elementos usados pelas ações, inclusive listas repetidas dos carrosséis. Uma mudança de estrutura pode invalidar `CHILDREN` e `PARENT` mesmo sem mudar um ID.
3. Mantenha a ordem de carga do layout. O objeto de interações é inicializado depois das bibliotecas e do bootstrap.
4. Preserve os estados de opacidade e transform antes da entrada. Se uma animação não inicia, investigue identidade e runtime; forçar tudo a ficar visível altera o resultado.
5. Aplique `base.css` somente nas páginas marcadas `hasGlobalStyles`. O bloco da capa também altera margens de listas; espalhá-lo pelas publicações muda seu comprimento.
6. Edite conteúdo em JSON/HTML sem editar bundles minificados. Alterações de animação devem apontar o evento e a lista de ações afetados, com verificação nos breakpoints envolvidos.

## Verificação

`tests/interactions.test.mjs` confere a impressão digital canônica da configuração original, a geração do mesmo objeto na saída, a integridade dos arquivos do runtime e a ausência de inicialização dos módulos hospedados. Uma alteração intencional de animação exige atualizar a referência de forma explícita e registrar a mudança na tarefa; não atualize a referência para fazer passar uma alteração acidental.

O HTML gerado sinaliza `data-presentation-ready="true"`, `data-animation-events="623"` e `data-hosted-forms-disabled="true"` quando o motor inicializa. Esses marcadores ajudam a verificar o estado no navegador sem acessar dados internos.

Para comparação, use a mesma janela e tamanho de viewport nas duas URLs. Aguarde fontes e imagens; imagens lazy podem alterar a altura de um rodapé ainda não carregado. Compare também após rolar e passar o mouse, porque uma imagem parada não demonstra uma animação. Os registros da revisão ficam em `reference/fidelity/`.

A identidade da configuração e a comparação das dimensões não são uma garantia universal de rasterização idêntica em qualquer navegador, sistema ou instante de vídeo. A apresentação usa os mesmos dados e motor; serviços de vídeo externos e diferenças de renderização da plataforma continuam existindo também no original.
