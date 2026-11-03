# Preservar o site em alterações futuras

Esta é a política atual de manutenção. Em 01/11/2026, uma revisão de conteúdo foi incorretamente ampliada para um redesenho. O usuário rejeitou a substituição do cabeçalho, do carrossel e das animações e determinou: fazer o mínimo, preservando o máximo do site original. A versão otimizada anterior à revisão editorial é a referência desta correção.

## Antes de editar

**Referência atual de layout (03/11/2026):** o usuário autorizou explicitamente proporções menores, carrosséis menores e reorganização visual. O padrão resultante está em `PADRAO-VISUAL.md`. As restrições históricas abaixo continuam valendo para mudanças não solicitadas; a suspensão de redução do carrossel refere-se à revisão de 01/11, não ao pedido visual de 03/11. Mantenha fontes, paleta, motor e configuração de animações. A equipe atual usa cards compartilhados dentro dos wrappers de revelação existentes.

1. Separe conteúdo, navegação, integração e apresentação no pedido. Para cada arquivo previsto, indique a frase que exige sua mudança. Termine com uma lista fechada de alterações necessárias e invariantes.
2. Consulte o mapa e os componentes existentes. Localize o conteúdo exato em vez de reconstruir a seção inteira. Textos de hover duplicados e variantes responsivas recebem a mesma atualização editorial.
3. Guarde a versão anterior e registre os contratos de apresentação. Identifique o que precisa continuar igual: classes, hierarquia, IDs, dimensões, tipografia, máscaras, opacidade inicial, percurso, duração, easing, gatilhos, hover, entrada e comportamento em celular.

## Executar a menor alteração suficiente

| Pedido | Alteração apropriada | Limite |
| --- | --- | --- |
| Trocar texto | Substituir texto no nó existente | Conservar classes e hierarquia; texto maior pode aumentar a altura naturalmente |
| Mudar menu | Trocar rótulos/destinos, retirar ou inserir itens usando o mesmo componente | Manter cabeçalho, `.menu-label.hover`, ordem de scripts e runtime de navegação |
| Mudar perfis | Atualizar os dados das pessoas e suas fotos confirmadas | Preservar cartões, máscaras e animações; não atribuir uma foto a outra pessoa |
| Mover carrossel | Mover o conjunto completo das duas variantes, preservando sua estrutura | Manter percurso, repetições técnicas, dimensões e hover; conferir movimento real |
| Acrescentar seção | Reusar wrappers, tipografia, botões e padrões de uma seção existente | Acrescentar somente a estrutura necessária ao conteúdo novo, sem sistema visual paralelo |
| Reunir acervo | Compor os componentes e cards existentes na nova rota | Preservar os endereços antigos; não redesenhar o acervo como efeito colateral |
| Corrigir corte no tablet | Corrigir apenas a visibilidade ou regra responsável no breakpoint afetado | Manter a apresentação e as transições originais do cabeçalho nos demais tamanhos |
| Integrar formulário | Alterar campos e envio exigidos pelo pedido | Credenciais no servidor; sucesso apenas após confirmação; separar visual de backend pendente |

Uma troca editorial não é oportunidade para refatoração, modernização, simplificação de animações, adoção de outro carrossel ou troca de sistema de componentes. Uma estrutura nova só é necessária quando o conteúdo solicitado realmente não cabe em nenhuma estrutura existente. Registre o motivo; mantenha o restante igual.

As notas visuais dos DOCX não prevalecem sobre a instrução mais recente do usuário de preservar o estilo e as animações. Nesta correção, recomendações de reduzir proporções do carrossel ou alterar seu funcionamento ficam suspensas. A nova posição e o conteúdo podem mudar, mantendo o componente original.

## Verificar preservação

1. Execute build, testes de conteúdo e `tests/presentation.test.mjs`. Os contratos em `docs/reference/presentation/` protegem a estrutura real do carrossel, o cabeçalho, as folhas de apresentação e o runtime; a contagem de eventos sozinha é insuficiente.
2. Abra a versão anterior e a alterada nas mesmas condições. Inspecione começo e fim da entrada, hover real, movimento do carrossel, fechamento de diálogo e menu. Use desktop/celular; inclua tablet se houver mudança no menu. Registre a largura CSS real.
3. Revise o diff. Cada diferença deve corresponder ao pedido. Remova refatorações e estilos sem uma necessidade documentada.
4. Registre o que foi executado e as limitações. Preserve baselines e evidências históricas. Uma falha de preservação é um resultado a corrigir, não uma justificativa para atualizar o teste.

## Como mudar um contrato de propósito

Um pedido explícito pode autorizar uma animação ou um estilo diferente. Registre o comportamento antigo, o comportamento solicitado e o critério de aceite antes de alterar o contrato. Atualize somente a parte correspondente e preserve a referência anterior. O simples desejo de fazer o teste passar não constitui autorização.
