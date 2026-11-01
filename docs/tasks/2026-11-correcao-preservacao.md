# Reaplicar conteúdo preservando o site original

Status: concluída no escopo visual

## Pedido

O usuário rejeitou o redesenho e determinou restaurar a versão anterior, reforçar os Markdown e fazer o mínimo, preservando o máximo. Citou explicitamente carrossel, animações e cabeçalho. A limitação anterior a front-end continua vigente.

## Arquivos e limites

- `AGENTS.md`, `CLAUDE.md`, `docs/PRESERVACAO.md`, modelo de tarefa: política objetiva e verificação de componentes, sem aprovação extra para mudanças já autorizadas.
- `src/sections/home/`, `quem-somos/`, `content/portraits.json`, `team.json`, `pages.json`: conteúdo aprovado nos elementos existentes; carrossel extraído literalmente para `components/home-carousel.html` e movido inteiro.
- `components/header.html`, `footer.html`: textos e destinos; preservar estrutura do cabeçalho e hover.
- `sections/biblioteca/01-navigation.html`, `pages/biblioteca*`: composição de componentes existentes. A imprensa abre a rota original para preservar seus efeitos.
- `styles/site.css`: somente visibilidade do botão existente em tablet. `legacy.css`, `fonts.css`, head inicial, runtime e configuração IX2 intactos.
- `scripts/contact.js`, `main.js`, `forms.js`, `research.js`: motivo do contato e entrada pelo link da pesquisa usando o evento original.
- `tests/`, `docs/`: contratos, conteúdo e evidências da correção.

## Resultado e prova

A revisão rejeitada foi arquivada e a versão anterior foi restaurada antes da reaplicação. A regressão foi reproduzida pela ausência do carrossel original. Build e 20 testes aprovados, incluindo contratos do componente completo, estrutura de hover de cada link, estilos e grades originais. Hover nativo do cabeçalho comparado com a referência, carrossel em movimento e legenda revelada. Dimensões de frames preservadas; menu original em tablet com cinco itens. Quinze verificações de layout sem overflow.

Na conferência de tablet, a regra que mostrava também os links diretos duplicou o menu; ela foi retirada. A única correção CSS mantida é mostrar o contêiner original do botão em tablet. O contrato registra essa exceção menor, não um redesenho. Uma medida móvel inicialmente divergente foi rastreada a viewports diferentes entre abas e reconferida no breakpoint móvel; os valores reais foram registrados.

Detalhes em `../CORRECAO-PRESERVACAO.md`. Backend e materiais permanecem pendentes; nenhuma mensagem real ou versão externa foi enviada. Pacotes locais atualizados, com referências da versão rejeitada fora da distribuição atual.
