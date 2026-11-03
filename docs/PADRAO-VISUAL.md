# Padrão visual editorial

Autoridade atual: pedido direto de 03/11/2026, registrado em `tasks/2026-11-padrao-visual-editorial.md`. Este pedido autoriza novas proporções e organização; não transforma futuras trocas editoriais em autorização para redesenhar.

## Editar e reutilizar

Leia este documento antes de alterar layout, proporções ou componentes visuais. O desenho atual vem de `src/styles/editorial.css`, carregado após `site.css`, sob `.editorial-design`. `legacy.css`, `site.css` e os baselines históricos permanecem como referência. Faça ajustes nesta camada atual, com escopo de página quando forem locais.

O padrão mantém fontes e paleta do Instituto, linhas de fundo, bordas leves e cantos arredondados. Usa largura de leitura limitada, margens responsivas e uma escala única:

| Elemento | Padrão |
| --- | --- |
| Título de abertura | 32–52px, peso 500, entrelinha 1,12 |
| Título de seção | 26,4–36px, peso 500 |
| Subtítulo | 20–24px |
| Texto | 17px no desktop, 16px no celular, entrelinha 1,65 |
| Nota / legenda | 14px; metadados de perfil 13px |
| Botão | 15px, peso 500, largura natural, área mínima de 44px |

Use o laranja para a ação principal do contexto, convites de contato e envio de formulário. Navegação e leitura secundárias recebem `.cta-secondary` com fundo transparente e borda. Mantenha as duas labels do hover original. Não use um botão cheio por parágrafo nem aumente a tipografia do botão para chamar atenção. Rótulos longos podem quebrar naturalmente em telas estreitas.

## Componentes e conteúdo

- `components/method-cycle.html`: diagrama compartilhado por Home/Nossa atuação. Labels são texto; setas SVG decorativas; movimento discreto em CSS desativado em movimento reduzido. Não substitua por uma imagem com texto rasterizado.
- `components/team-profiles.html`: cards da equipe em ambas as variantes responsivas existentes. Conteúdo em `content/team.json`. Duas pessoas na diretoria executiva; Sandra e outros três no conselho. Sandra mantém sua função de parcerias. LinkedIn de Tetê junto de sua foto.
- `sections/quem-somos/08-timeline.html`: quatro marcos transcritos da imagem do Word revisado. Datas novas exigem fonte aprovada.
- `components/research-numbers.html`: contadores originais, hoje incluídos dentro da pesquisa na Biblioteca. A inclusão antiga da Home é um alias de manutenção, fora da composição da Home. Não copie o HTML para outra página: mova ou reutilize a inclusão, verificando IDs e contexto dos dados.
- `components/media-cards.html`: fonte única para Biblioteca e rota antiga Na mídia. Treze URLs herdadas confirmadas pela cópia; um registro herdado tinha endereço example.com e permanece visível, com link pendente. Não invente o endereço.
- `components/ebook-cards.html`: quatro ebooks originais apresentados na Biblioteca e no arquivo Be Back Now, com os mesmos links e capas. A grade usa quatro colunas em telas largas e duas em telas menores. Os 14 artigos permanecem no arquivo.
- `components/footer.html`: compacto, cinco destinos e links legais; CNPJ fica somente em Governança. Crédito solicitado: Caio Jacinto / Eric Leão; apenas Caio tem URL fornecida.

Home prioriza Como trabalhamos. Números ficam na Biblioteca; aparições são a última seção antes do rodapé. Biblioteca reúne Pesquisa, Análises, Ebooks/materiais, Na mídia, Livro e inscrição separada. A rota antiga continua acessível. Preserve os 14 artigos e quatro ebooks do arquivo Be Back Now.

## Limites e verificação

As dimensões dos dois carrosséis foram reduzidas por CSS por pedido explícito. DOM, repetições técnicas, máscaras, IDs, tempos e runtime continuam originais. Equipe conserva wrappers de revelação desktop/celular. Evite trocar o motor ou forçar opacidade para contornar os estados de entrada.

Compare desktop, 1024px, tablet 768px e celular 390px. Confira leitura, ausência de overflow, hover, movimento, menu, formulários e uma publicação de controle. O novo contrato em `reference/presentation/editorial-design-2026-11-03.json` registra somente as exceções autorizadas aos wrappers da equipe. Referências históricas continuam verificadas nos demais arquivos.

**Toda alteração por IA deve criar/atualizar um registro em `docs/tasks/` no mesmo conjunto/commit**, incluindo fonte do pedido, decisões, arquivos, verificações reais e pendências. O padrão é a referência para manutenção; mudanças futuras nele exigem um pedido visual explícito. A regra geral de mínimo de mudança e máximo de preservação continua aplicável.
