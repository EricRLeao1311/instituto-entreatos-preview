# Backend para hospedagem de teste e registro obrigatório de alterações por IA

Status: código concluído e validado localmente; ativação externa pendente das contas

## Resultado esperado

Pedido: “de forma simples, boa, segura e otimizada todo o backend” e “quando alguém usar IA no futuro precisa colocar na documentação”. Preparar Vercel, armazenamento persistente e envio de e-mails com registro de consentimento, sem redesenho e sem alterações no Webflow, Registro.br, domínio ou produção da cliente. O usuário informou não possuir contas na Vercel, Supabase ou serviço de e-mail; não contratar serviços nem alegar ativação sem acesso.

## Escopo

- Responsável: Codex, com assistência de IA.
- Arquivos previstos: `backend/forms.mjs`, `backend/server.mjs` (reuso da validação), `backend/cloud/`, `api/`, `supabase/migrations/`, `scripts/build-vercel.mjs`, `scripts/check-change-record.mjs`, `vercel.json`, `.env.example`, `.gitignore`, `.nvmrc`, `package.json`, lockfile, workflows, testes correspondentes, `src/scripts/forms.js` (recibo de e-mail), `AGENTS.md`, `CLAUDE.md`, template de tarefa, guias de backend/publicação/arquitetura/edição, `docs/BACKEND-CLOUD.md`, `docs/ATIVAR-TESTE.md`, levantamento e README.
- Invariantes: HTML, CSS, fontes, cabeçalho, carrossel, botões, animações, textos editoriais, rotas, Webflow oficial e DNS. GitHub Pages continua com endpoints vazios. Nenhuma credencial ou destinatário privado entra no código público.
- Arquitetura proposta: funções Node na Vercel, Postgres gerenciado pelo Supabase, transporte HTTP do Resend. Zero dependências em runtime; PGlite somente em desenvolvimento para executar a migração real nos testes.
- Serviços isolados em projetos de teste. Modo padrão de captura; envio real limitado a lista de destinatários de teste. A etapa atual não promove o site oficial.

## Referências

Configurações fornecidas pelo usuário: notificações nativas no Webflow, destinatário padrão registrado fora do Git, sem Apps, integrações de marketing, webhooks ou Custom code nas telas consultadas. Overrides por formulário ainda não confirmados. Não deduzir credenciais de envio a partir de um endereço de e-mail.

## Critérios de aceite

- Persistência atômica de cadastro e caixa de saída; APIs públicas somente de submissão.
- Validação, consentimento, limites persistentes de requisições e deduplicação; tabelas sem acesso anônimo.
- Transporte com timeout, chave de idempotência, fila com lease e retomada segura; erros não apagam cadastros nem afirmam entrega.
- Build separado para Vercel e ativação explícita de endpoints; nenhuma alteração visual.
- Testes HTTP, SQL real, permissões, fila/falhas e contratos existentes aprovados.
- AGENTS/CLAUDE apontam ao registro obrigatório por tarefa; CI rejeita código sem registro de mudança no mesmo conjunto.
- Guia de ativação com passos e dependências externas reais; diferenciar código testado, teste local e serviço online.

## Execução

Implementado. A escolha de três serviços separa hospedagem, dados e entrega de e-mail sem instalar um framework no front-end. O receptor local existente será preservado. Contas, preços/plano aplicável e credenciais serão configurados pelo titular antes de ativar hospedagem/envio reais. Fontes consultadas: documentação oficial de Vercel, Supabase, Resend e PGlite; decisões e limites constarão no guia.

## Verificação realizada

- `node scripts/build.mjs` e `node --test`: 43 testes aprovados, sem falhas. Incluem os contratos visuais anteriores, receptor SQLite, SQL/RLS e integrações do novo receptor com transporte externo simulado.
- Migração real executada em PGlite: cadastro/caixa de saída atômicos, cotas por IP e e-mail entre instâncias, deduplicação, permissões de anon/authenticated, RLS mesmo com SELECT concedido, leases, token inválido, falha do provedor, retomada e revisão após 23h. Não houve conexão a um Supabase ou Resend real.
- Build Vercel executado com endpoints habilitados e desabilitados: o build padrão continua sem endpoints. HTML difere apenas pelo noindex de teste; CSS e vendor são byte a byte iguais. Varredura de todos os arquivos de texto do artefato confirmou ausência de uma credencial canário colocada apenas no processo de teste.
- `npm audit --audit-level=high`: zero vulnerabilidades reportadas para o lockfile atual; não equivale a auditoria completa de segurança.
- Navegador local em 1280 e 390 pixels CSS: pesquisa salva dados fictícios, mostra captura sem envio externo, oferece PDF, reseta checkbox e não apresenta overflow horizontal em celular. Screenshot privada em `work/backend-cloud-formulario-local.png`, fora do repositório. O servidor local permanece em `http://127.0.0.1:4287/`.
- O registro obrigatório passou na verificação local. A CI e a publicação de teste serão conferidas após o push. Nenhum HTML, CSS, cabeçalho, carrossel, vendor, rota ou dado de animação precisou mudar.

Não foram testados contas/credenciais reais, deploy na Vercel, API hospedada do Supabase, concorrência entre conexões Postgres reais nem entrega à caixa de e-mail. O build `build:vercel` executa a suíte antes de gerar a saída; scripts npm existentes foram mantidos e apenas ampliados.

## Pendências e entrega

Criar/conectar as contas, aplicar a migração em banco exclusivo de teste, configurar segredos no provedor, publicar no endereço de teste e validar entrega real. Nenhum passo de DNS ou publicação oficial está autorizado.

## Decisões registradas

O remetente nativo do Webflow não é reutilizado; o novo transporte precisa de remetente próprio autorizado. O destinatário padrão confirmado fica fora do Git e será uma variável privada. Reply-to do novo contato usa o e-mail validado do visitante, para permitir resposta; isso não altera o Webflow. A fila é durável, mas o cron diário não garante baixa latência de recuperação: mensagens ambíguas fora da janela de idempotência exigem revisão. Não foi criada newsletter, área de login ou CMS novo sem requisito; os dados são administrados no painel do provedor. O padrão é captura, e envio externo em teste exige lista explícita. A opção Vercel não presume gratuidade: o titular deve conferir plano permitido para trabalho de cliente.
