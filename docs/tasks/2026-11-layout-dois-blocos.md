# Redistribuir somente dois blocos da Home

Status: concluída

## Pedido e escopo fechado

Frase do usuário: “sem alterar mais nada disponha melhor os objetos apenas dessa parte da página”. As duas capturas identificam “Quem está por trás do Instituto” e “Agenda 2030”, na seção Instituto da Home.

Arquivos previstos: `src/sections/home/07-instituto.html` (identificar somente esses dois cards e agrupar os dois botões de imprensa), `src/styles/site.css` (posicionamento de colunas apenas nesses cards), `tests/presentation.test.mjs` e um registro de exceção em `docs/reference/presentation/` (autorização explícita do layout local), este registro e o mapa de edição.

Invariantes: textos, cores, fontes, tamanho dos ícones, formatos/hover dos botões, cabeçalho, carrossel, animações, bloco intermediário “Como você pode se aproximar” e todas as outras páginas. A referência anterior dos estilos permanece intacta; o novo acréscimo precisa ser vinculado a este pedido, não incorporado ao baseline histórico.

Critério: os dois blocos devem usar a largura disponível; os botões de imprensa e os ícones devem poder se distribuir em linha e quebrar em telas menores, sem overflow. Comparar desktop/celular e executar os contratos existentes. Conferir os hashes das demais fontes antes de finalizar.

## Resultado

O primeiro bloco ocupa duas colunas para o título e quatro para o conteúdo na grade já existente. Os dois botões de imprensa foram agrupados com a classe `button-group` original; o CTA do Instituto fica abaixo. Agenda usa a mesma distribuição, liberando largura para os quatro ícones em linha quando há espaço. Em telas menores, permanece a composição móvel existente e a quebra natural dos elementos.

A referência histórica não foi alterada. A autorização desta mudança específica está em `docs/reference/presentation/home-layout-adjustment.json`, lida pelo teste de apresentação como acréscimo separado.

## Verificação

Build concluído e 20 testes aprovados. As seis conferências dos dois blocos em tamanhos grande, intermediário e pequeno não apresentaram overflow; as larguras CSS reais constam em `docs/reference/presentation/qa/layout-dois-blocos/layout.json`. Foram conferidos botões de imprensa em linha e quatro ícones na mesma linha em tela larga.

Comparação de hashes de todas as fontes em `src/`, `public/` e `scripts/` antes/depois: somente `src/sections/home/07-instituto.html` e `src/styles/site.css` mudaram. O card intermediário foi preservado. Nenhum texto, link, script ou arquivo de outra página foi alterado. Documentação, contrato da exceção e pacotes foram atualizados.
