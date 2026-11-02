# Verificação

## Verificação automática

```sh
node scripts/build.mjs
node --test
```

O build rejeita rotas inválidas, metadados essenciais ausentes, variáveis desconhecidas, includes circulares e caminhos fora da pasta de origem. Os testes verificam inventário, SEO, navegação, IDs únicos, links e âncoras internas, arquivos locais, fontes, ausência de scripts remotos, integridade dos scripts locais, identidade da configuração original de animação e estados de formulário.

Os testes não prometem validação completa de HTML, acessibilidade, entrega de e-mail ou disponibilidade futura de links externos. Uma alteração visual exige a conferência no navegador abaixo.

## Conferência no navegador

Inicie `node scripts/serve.mjs --watch`. Depois de uma alteração, aguarde a geração terminar e atualize a página.

| Área | Critério de aceite |
| --- | --- |
| Todas as páginas | Abrem diretamente pela URL; título e texto principal aparecem; nenhuma rolagem horizontal involuntária |
| Menu desktop | Quatro destinos corretos (Contato fica no rodapé por pedido de 31/10); página atual identificada; hover original preservado |
| Navegação celular | Usa o botão e o runtime originais; botão visível em tablet; quatro itens, sem duplicação |
| Capa | Dois botões chegam às âncoras de atuação; percurso e hover dos retratos usam os tempos originais; nenhum controle visual adicional |
| Pesquisa | Abre; botão de fechar e Escape funcionam; Tab fica no diálogo; ao fechar, foco volta ao acionador |
| Contato | Campos obrigatórios e e-mail inválido são barrados; fluxo sem endpoint oferece preparar e-mail após submeter, sem afirmar recebimento |
| Envio configurado | Estado de espera; sucesso somente após HTTP 2xx; falha e timeout preservam os dados e permitem repetir |
| Quem somos | Equipe e biografias aparecem tanto em desktop como celular; edição de JSON aparece nas duas grades |
| Publicações | Cards abrem as páginas locais; texto rico e links aparecem; documentos externos mantêm os destinos confirmados |
| Depoimentos | Grade adequada ao tamanho; iframes têm título; reprodução depende do YouTube |
| Movimento reduzido | Conteúdo continua visível; carrossel não exige animação para ser compreendido |
| 404 | URL inexistente retorna página de erro e oferece voltar ao início |

Use 1440 × 1000 e 390 × 844 como referências. Inclua 768 e 1024 pixels ao alterar grids ou menu. Percorra toda a extensão da página, incluindo rodapé e campos abaixo da primeira tela. Compare uma página de controle ao alterar componentes compartilhados.

## Evidência

Registre comandos executados, resultados, página e tamanhos conferidos em uma tarefa ou no relatório da alteração. Guarde capturas relevantes se a mudança visual precisar de revisão. Para uma falha que não conseguiu reproduzir ou uma integração sem credenciais, descreva exatamente esse limite.

O relatório atual da entrega está em `docs/ENTREGA.md`. A referência específica de animações fica em `docs/ANIMACOES.md`. Os snapshots históricos em `docs/reference/` permitem conferir textos, rotas e procedência sem depender de o site de origem continuar igual.

## Preservação obrigatória

Execute também `node --test tests/presentation.test.mjs`. Confira o componente original e o hover, não apenas a quantidade de eventos. Compare cabeçalho, frames do carrossel e movimento com a versão anterior, mantendo as mesmas larguras CSS reais. Os critérios atuais e as exceções desta tarefa estão em `PRESERVACAO.md` e `CORRECAO-PRESERVACAO.md`. Não substituir baselines para encobrir uma regressão.
