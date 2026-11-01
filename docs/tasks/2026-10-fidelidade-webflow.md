# Restaurar fidelidade ao site de origem

Status: concluída

## Resultado esperado

Restaurar a apresentação e os comportamentos exportados do site público: entradas, máscaras, hover, carrosséis, parallax, números e diálogo. Esclarecer o que os formulários originais configuravam sem enviar cadastros de teste ao Instituto.

## Arquivos previstos

- `src/sections/` e `src/components/`: restaurar atributos e hierarquia usados pelas interações originais; preservar conteúdo centralizado.
- `src/content/interactions.json`: configuração original de 623 eventos e 72 listas de ações.
- `public/vendor/`: cópias locais do runtime e bibliotecas; inicialização de formulários hospedados, editor, marca e comércio desativada.
- `src/layouts/base.html` e `scripts/build.mjs`: IDs de página, ordem de carga e geração das interações.
- `src/scripts/`, `src/styles/site.css`: retirar as substituições visuais simplificadas que conflitam com o original; conservar integração explícita dos formulários.
- `tests/` e `docs/`: contratos e evidências da nova implementação.

## Critérios de aceite

- Configuração de interações idêntica ao objeto publicado, sem aproximação de tempos, valores ou easing.
- Estados e geometria comparados com a origem em desktop e celular.
- Recursos de apresentação e scripts servidos localmente.
- Nenhum envio automático ao receptor do Webflow.
- Build, integridade e testes de interação aprovados; pacotes atualizados.

## Execução e resultado

Restaurados o runtime local de apresentação, o objeto original completo de ações, os atributos de animação, as listas repetidas e os estados iniciais. Retirados os overrides visuais simplificados. O CSS global da capa passou a ser aplicado somente às páginas em que existia na origem. Os embeds originais também foram restaurados.

A explicação sobre os formulários foi corrigida em `docs/FORMULARIOS-ORIGINAIS.md`. O processamento remoto não foi transferido nem testado com cadastros reais. O módulo hospedado de formulários não é inicializado na cópia.

## Verificação

Build e 11 testes aprovados. Foram comparadas as 21 rotas nos dois tamanhos de tela, com igualdade nas dimensões e tipografia medidas após conferir os rodapés com imagens carregadas. Os registros ficam em `docs/reference/fidelity/`. A configuração original integral tem impressão digital verificada por teste.

O carrossel mudou de transform entre observações; o diálogo e os fluxos locais de formulário foram conferidos com dados fictícios. O estado de hover não foi confirmado por movimento real do cursor na automação; seus dados e motor foram restaurados integralmente. Os limites estão no relatório atual de entrega.
