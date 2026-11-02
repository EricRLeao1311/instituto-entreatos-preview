# Atualizar Contato e Biblioteca com os documentos da contratante

Status: implementação concluída; conferência da publicação de teste em andamento

## Resultado esperado

Pedido: implementar Contato_31 out 26.docx e Biblioteca_31 out 26.docx. Ambiente autorizado: teste, sem alterar Webflow, DNS ou domínio oficial. Responsável: Codex, com assistência de IA.

## Escopo

Preservar a tipografia, estilos, cabeçalho/carrossel e animações; reaproveitar componentes completos. Mudanças de conteúdo não autorizam redesenho. O documento Contato autoriza explicitamente retirar seu item do menu principal, preservando o componente e o hover dos itens restantes; o link permanece no rodapé. Não alterar o baseline de apresentação: registrar esse ajuste de quantidade no teste correspondente com referência a esta tarefa.

Arquivos previstos: seções/páginas Contato e Biblioteca; novas páginas Pesquisas, análise e arquivo Be Back Now; header/footer (somente itens/textos solicitados); links de análise/pesquisa nas seções já existentes; pages.json; configuração editorial de contato; módulos de contato/formulários/pesquisa; backend de validação, inscrição/consentimento/descadastramento e captura de mensagens, migração SQL nova e adaptadores; build de configuração e adaptação de links; testes relacionados; fontes editoriais extraídas e documentação de mapa/integrações/backend. Se layout novo exigir CSS, usar apenas regras locais nas áreas novas e registro específico, sem mudar o baseline.

Decisões: os documentos dão ordens diferentes ao rodapé; manter a ordem atual, adicionar Pesquisas e atualizar tagline/CNPJ sem redesenho. O usuário confirmou manter os quatorze artigos e forneceu https://www.youtube.com/channel/UCYt9N3uAVGFm7azxM8hyKRw, incluído como link no rodapé existente, sem inventar ícone. Links de pesquisa apontam à página /pesquisas com o bloco existente e seu diálogo original, sem mandar diretamente ao PDF. Preservar /publicacoes e demais endereços antigos. A análise local usa integralmente o texto fornecido. O e-mail de boas-vindas mantém o LinkedIn explicitamente fornecido no DOCX; seu título externo difere da análise e precisa de conferência editorial antes do envio real.

O envio externo continua sem contas configuradas. O teste deve mostrar captura/indisponibilidade de envio, sem afirmar inscrição ativa ou entrega real. Biblioteca/Pesquisas não serão promovidas à produção oficial sem serviço ligado e testado. A implementação prepara os fluxos e registra essa dependência.

## Verificação realizada

Antes da edição: Git limpo. Texto e tabelas extraídos dos DOCX e hashes em docs/reference/editorial-contato-biblioteca-2026-10-31/sources.json. Não há imagens nos documentos. Cópia da saída anterior preservada fora do Git em work/editorial-contato-biblioteca/baseline-site. A fonte ResumeGo abriu; o link LinkedIn de outubro aponta a artigo com outro título, por isso links internos de análise e o texto aprovado prevalecem.

`node scripts/build.mjs`, `node scripts/build-pages.mjs --base-path /instituto-entreatos-preview` e `node --test`: 26 rotas + 404; **48 testes aprovados**. Verificam fontes editoriais, rotas/âncoras/arquivos, CSS/vendor/carrossel contra baselines históricos, menu sem Contato e com o mesmo shell/hover, campos sem telefone obrigatório, todos os seis motivos e destinatário, persistência após reinício, rejeições/cotas, transações, lista única, escolhas separadas, cancelamento/reinscrição, CSV e RLS/permissões. PGlite executou ambas as migrações SQL; HTTP de Supabase/Resend é simulado, não houve serviço real ou entrega externa.

Navegador local: Contato/Biblioteca/diálogo de Pesquisas/análise em 390 × 844, largura CSS real 390, sem rolagem horizontal. Contato: parâmetro pré-selecionado alterável; seis placeholders corretos; envio sem organização/telefone; e-mail inválido barrado; confirmação de captura visível sem rolagem adicional. Biblioteca: consentimento começa desmarcado e volta ao estado inicial depois da captura. Pesquisa: novidades desmarcadas/independentes, captura e PDF após receber; diálogo fecha com Escape. Botões/fontes ao fim da análise em coluna única; menu móvel conserva quatro itens. Desktop a 1440 × 1000: Contato, Home e versão anterior da Home conferidos; entrada/final, hover real de Nossa atuação e transformações sucessivas do carrossel comparadas. Deslocamentos continuam nas duas versões. CSS, vendor, interações, componente do carrossel e baselines não têm diff. Não é uma medição sincronizada quadro a quadro.

Arquivos reais: `src/content/contact.json`, `site.json`, `pages.json`; header/footer; composição Biblioteca e quatro páginas/chrome/head novos; seções Contato/Biblioteca/Pesquisas/arquivo/análise/cancelamento; dois destinos de links na Home; três botões solicitados em Nossa atuação, reutilizando o componente atual; scripts contact/forms/research; build/build-pages/build-vercel; backend forms/store/server/preview/cloud config/delivery/handler e exportação; adaptadores api/publications/unsubscribe; migração incremental; testes backend/cloud/editorial/presentation/site; fontes extraídas e guias de integração, mapa, arquitetura, verificação, publicação, ativação/backend/README. Nenhum CSS novo. A quantidade do menu foi ajustada nos testes somente por autorização explícita do documento; hashes dos componentes continuam protegidos.

## Referências e critérios de aceite

DOCX fornecidos pelo usuário (texto/tabelas e hashes preservados), decisão posterior sobre os 14 artigos/YouTube e política `PRESERVACAO.md`. Aceite: conteúdos e destinos implementados, estilos/runtime preservados, captura testada sem envio externo, novas escolhas registradas e documentação atualizada. Integração real não é declarada concluída.

## Execução

O receptor local permanece disponível sem contas. Backend hospedável continua separado e restrito a teste/captura ou envio por lista autorizada. Inscrição fica desabilitada quando não há endpoint, como no Pages. Migração nova acrescenta audiência/eventos/cancelamento sem editar a primeira. Exportação é CLI privada; não há listagem pública, campanha em massa ou CMS novo. Arquivo Be Back Now reutiliza literalmente cards/e-books antigos. O botão de estudo em Pesquisas pré-seleciona o motivo correto. Nossa atuação não tinha os três botões indicados nos novos documentos; foram acrescentados no wrapper existente, sem reestruturar as seções.

## Pendências e entrega

PDFs legais novos não fornecidos: links existentes do Drive preservados. Contas Vercel/Supabase/Resend, banco online, credenciais/remetente autorizado e entrega/resposta/cancelamento reais ainda pendentes. Aplicar as duas migrações na ordem; definir acesso, backup e retenção. Sem disparador de campanhas em massa: lista exportável para ferramenta autorizada. Conferir o link LinkedIn do e-mail antes de ativá-lo. Biblioteca/Pesquisas só podem substituir o site oficial após serviço de e-mail ligado/testado e autorização futura específica. Nenhuma alteração em Webflow, DNS ou domínio oficial.
