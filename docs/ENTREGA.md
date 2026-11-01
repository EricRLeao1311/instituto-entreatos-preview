# Relatório de entrega — revisão 2

**Entrega atual de 01/11/2026:** a reaplicação editorial preserva os componentes originais. Leia [a correção](CORRECAO-PRESERVACAO.md) e [a política de manutenção](PRESERVACAO.md). Os dados abaixo são históricos da revisão 2.

Atualização em **01/11/2026**: aplicada otimização de fontes e entrega, com 14 testes aprovados. Veja [Desempenho](DESEMPENHO.md). Os dados abaixo registram a revisão visual de 30/10.

Data: **30/10/2026**. Esta revisão substitui a primeira entrega e restaura a apresentação exportada do site original.

## Entregue

- Sete páginas institucionais e 14 publicações internas, com as rotas existentes.
- 36 seções editáveis, cabeçalho/rodapé compartilhados, dados da equipe e dos retratos em JSON.
- Imagens, fontes, vídeos de fundo e PDF da pesquisa locais; 245 arquivos em `public/assets/`.
- Motor de apresentação exportado, jQuery e componentes em seis arquivos locais de `public/vendor/`.
- Configuração original integral de 623 eventos e 72 listas de ações em JSON legível.
- Tempos, easing, máscaras, entradas, hover, parallax, carrosséis, números e diálogo restaurados.
- Iframes originais de Embedly/YouTube e apresentação original em celular, sem os controles visuais adicionais da primeira entrega.
- Documentação para IA, mapa de edição, contratos de animação, evidência dos formulários originais e modelo de tarefa.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Build local | 21 páginas + 404 geradas |
| `node --test` | 11 testes aprovados, zero falhas |
| Objeto de interações | Impressão digital idêntica ao objeto publicado, incluindo todos os eventos e listas |
| Runtime local | Hashes conferidos; módulos hospedados de formulários, editor, marca e comércio não inicializados |
| Identidade das páginas | IDs originais presentes na saída para os alvos de animação |
| Links, âncoras, arquivos locais, imports e IDs HTML | Aprovados pela suíte |
| HTTP das páginas, mídia, fontes, estilos, scripts e documentos | 286 destinos responderam 200; 404 e rejeição de POST também conferidos |
| Comparação com a origem | 21 rotas em 1440 × 1000 e 390 × 844; 42 comparações |
| Dimensões de seções e tipografia de títulos | Nenhuma diferença não resolvida nas medidas conferidas |
| Rodapés com imagens lazy | Reavaliados visíveis e carregados; dimensões coincidentes |
| Movimento dos retratos | Transformação da faixa mudou entre observações; configuração original de percurso preservada |
| Pesquisa | Abriu pelo gatilho original; Escape fechou; formulário com dados fictícios ofereceu o PDF e informou que não houve envio |
| Contato | Formulário com dados fictícios preparou o link de e-mail; nenhuma mensagem foi enviada |
| Texto rico dos artigos | Parágrafos, listas e títulos comparados à origem, normalizando whitespace de HTML; sem diferenças restantes |

Registros: `reference/checks.txt`, `reference/http-checks.json`, `reference/fidelity/comparisons.json`, `reference/fidelity/summary.json`, `reference/interactions-baseline.json` e `reference/vendor.json`. As capturas atuais ficam em `reference/qa/`; `reference/v1-qa/` é histórico da versão substituída.

A comparação de dimensões não equivale a conferir cada pixel de cada quadro em todos os navegadores. O hover foi restaurado com os mesmos dados e motor; não foi possível confirmar seu estado final por uma entrada real de movimento do cursor na ferramenta de automação. A integridade integral das ações e a ausência dos overrides aproximados foram verificadas. Vídeos e conteúdos externos também podem mudar de quadro ou ser atualizados pelo provedor.

## Formulários e pendências reais

Contato e cadastro da pesquisa já existiam na origem ligados ao processamento padrão do Webflow. A pesquisa tinha redirecionamento para o PDF. O título de newsletter está acima do próprio formulário Contact; não foi comprovada uma integração de lista independente. A evidência e os limites estão em `FORMULARIOS-ORIGINAIS.md`.

A restauração da aparência não transfere a caixa de entrada do Webflow. Os endpoints de recebimento continuam vazios: contato prepara e-mail e pesquisa abre o PDF sem salvar cadastros. É necessário conectar e confirmar um receptor próprio antes de declarar o envio direto equivalente ao site em produção. Não houve submissão de teste ao Instituto nem acesso a suas contas privadas.

## Publicação

Nenhum repositório remoto foi criado, nenhuma versão foi publicada e nenhum DNS foi alterado. A entrega continua local, pronta para repositório e hospedagem estática. O workflow de GitHub Actions está preparado, mas não foi executado remotamente. A verificação local usou Node.js 24.22.1; o requisito mínimo declarado e o workflow usam a linha 22.

Use o ZIP de código para manutenção e o ZIP de publicação para hospedar os arquivos gerados. `src/` e `public/` continuam sendo as fontes; mudanças diretas em `dist/` são substituídas no próximo build.
