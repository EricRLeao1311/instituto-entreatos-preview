# Instruções para agentes

## Objetivo

Manter o site do Instituto Entre Atos com alterações pequenas, verificáveis e limitadas ao pedido. O código publicado é gerado a partir de `src/` e `public/`. Edite essas fontes, nunca `dist/`.

## Regra principal: mínimo de mudança, máximo de preservação

**Preserve a implementação existente.** Uma troca de textos, nomes, links ou ordem de seções autoriza apenas essas trocas. Mantenha tipografia, cores, espaçamentos, formatos, dimensões de componentes, imagens não citadas e comportamento responsivo fora do pedido. Preserve o DOM funcional, classes, IDs, estados iniciais e animações dos componentes existentes.

**O cabeçalho e o carrossel são componentes protegidos.** Alterar itens do menu mantém seu componente, hover, entrada, easing e duração. Alterar conteúdo ou posição do carrossel mantém seus dois layouts responsivos, máscaras, repetição técnica, percurso, velocidade e hover. Reaproveite o componente inteiro; uma alternativa visualmente parecida não é equivalente.

**Antes de editar qualquer conteúdo, HTML, CSS, navegação ou animação, leia [PRESERVACAO.md](docs/PRESERVACAO.md).** Registre para cada mudança a frase do pedido que a exige e os elementos que ficarão iguais. Uma sugestão de desenho em documento de referência não amplia a autorização dada pelo usuário. Se houver ambiguidade, mantenha o desenho atual, conclua as alterações inequívocas e registre a sugestão como pendente.

**Conclua somente após comparar com a versão anterior.** Testes de build e contagem de eventos não provam preservação visual. Execute os contratos de apresentação e confira no navegador entrada, hover e movimento dos componentes afetados. Não altere um baseline para fazer passar uma regressão; mudanças de contrato exigem um pedido explícito sobre aquele comportamento e registro da justificativa.

## Sequência de trabalho

1. Leia o pedido e consulte `docs/MAPA-DE-EDICAO.md`. Identifique a página, seção e arquivos compartilhados afetados. Termine esta etapa com uma lista explícita de arquivos que precisam mudar.
2. Leia a referência correspondente antes da edição: conteúdo ou nova página → `docs/CONTEUDO.md`; CSS, layout ou responsividade → `docs/ESTILOS.md`; animação, `data-w-id`, IDs de página ou runtime → `docs/ANIMACOES.md`; formulários ou pesquisa → `docs/INTEGRACOES.md`; build ou componentes → `docs/ARQUITETURA.md`; hospedagem → `docs/PUBLICACAO.md`.
3. Faça a menor alteração que atende ao pedido. Conteúdo repetido da equipe e dos retratos tem uma fonte em `src/content/`; preserve essa centralização. Componentes compartilhados mudam todas as páginas: use uma regra com `[data-page="..."]` quando o pedido for local.
4. Execute `node scripts/build.mjs` e `node --test`. Para mudanças visuais ou de comportamento, abra a página alterada em desktop e celular e percorra os estados relevantes descritos em `docs/VERIFICACAO.md`.
5. Revise o diff. Cada arquivo modificado deve ser explicado pelo pedido. Registre o resultado em uma tarefa criada a partir de `docs/tasks/TAREFA.md`, com o que foi verificado e o que permanece pendente. Atualize a documentação se mudou um contrato, uma rota ou o mapa de edição.
6. Entregue os arquivos alterados, a mudança de comportamento e os resultados reais das verificações. Diferencie verificações executadas de sugestões futuras.

## Contratos

- As rotas atuais em `src/content/pages.json` e as âncoras `empresa` e `profissional` são URLs públicas. Mudanças de endereço precisam de redirecionamento no provedor.
- Preserve os atributos `data-w-id`, `data-wf-page`, os estados iniciais de `*.head.html` e as classes usadas pelas ações em `src/content/interactions.json`. Eles são contratos do motor local de animações. Leia `docs/ANIMACOES.md` antes de mudá-los.
- `public/vendor/` contém bibliotecas exportadas e não é o local de alterações editoriais. Os hashes e as adaptações estão em `docs/reference/vendor.json`.
- `src/styles/legacy.css` preserva o desenho de origem. Classes como `_1` e IDs `w-node-*` ainda controlam grids e variantes; a presença desses nomes não significa dependência do serviço Webflow. Novas regras ficam em `site.css` com escopo explícito.
- Inclusões usam `<!-- include:caminho-relativo-a-src -->`. Coleções usam `<!-- repeat:nome:componente.html -->`. Variáveis `{{site.*}}`, `{{page.*}}`, `{{content.*}}` e `{{item.*}}` são escapadas como texto. Consulte a arquitetura antes de mudar o mecanismo.
- Os endpoints de formulários são configuração pública, não credenciais. Segredos pertencem ao servidor do receptor. Confirme sucesso apenas depois de resposta HTTP bem-sucedida.
- Preserve os espaços de texto rico junto a tags inline e pontuação; formatar `<strong>SHRM</strong>,` como blocos separados pode inserir um espaço visível antes da vírgula.
- Textos institucionais, números da pesquisa, nomes, cargos, links de documentos e depoimentos devem vir do pedido ou de uma fonte registrada. Uma informação ausente fica explicitamente pendente; não preencha com dados inventados.
- `docs/reference/` registra a origem em 30/10/2026. Use como evidência histórica, não como conteúdo atual obrigatório.

## Limites conhecidos

Leia `docs/MIGRACAO.md` se o pedido mencionar fidelidade, pesquisa, newsletter ou funções do Webflow. A apresentação usa a configuração original de animações; as integrações de recebimento de formulários ainda dependem do Instituto. Documentação e testes reduzem regressões, mas não garantem que uma IA nunca erre.
