# Backend para hospedagem de teste

Estado em 01/11/2026: código implementado e testado localmente; ativação online depende das contas e configurações do titular. O usuário informou não possuir contas na Vercel, Supabase ou serviço de e-mail. Nenhum serviço foi provisionado, contratado ou conectado e nenhum e-mail real foi enviado nesta implementação.

## Decisão e limite do escopo

A arquitetura conserva o gerador estático e os componentes existentes. Vercel hospeda os arquivos e três funções HTTP; Supabase mantém os dados em Postgres; Resend é o transporte de e-mail. As funções usam APIs nativas de Node, sem dependências de runtime. PGlite é dependência somente de desenvolvimento para executar a migração SQL nos testes. O banco SQLite continua disponível como alternativa local sem contas externas.

Essa escolha evita executar um servidor próprio ou manter um framework no front-end. A separação permite substituir o transporte de e-mail ou o adaptador de banco sem redesenhar as páginas. Três contas são necessárias para essa opção; as contas e o plano aplicável são uma dependência real, não uma configuração recuperável do Webflow.

O ambiente autorizado é **teste**. `APP_STAGE=preview` é obrigatório, e os endereços do domínio oficial da cliente são recusados pelo receptor. Isso é uma barreira adicional, não uma garantia contra alterações externas de DNS ou implantação por alguém. O código de promoção para a produção da cliente não faz parte deste trabalho. O projeto de teste deve ter conta/banco/configuração separados e usar apenas seu endereço de teste.

## Fluxo e módulos

```text
Formulário original → /api/contact ou /api/research
  → validação compartilhada (backend/forms.mjs)
  → RPC transacional no Postgres: cotas + cadastro + caixa de saída
  → captura, ou tentativa de envio a destinatário de teste autorizado
  → recibo de aceitação dos dados; PDF disponível no fluxo da pesquisa
```

| Local | Responsabilidade |
| --- | --- |
| `backend/forms.mjs` | Campos, consentimento e composição de mensagens; compartilhado com SQLite local |
| `backend/cloud/config.mjs` | Configuração privada e barreiras do ambiente de teste |
| `backend/cloud/handler.mjs` | Contrato HTTP, origem, limite do corpo e orquestração |
| `backend/cloud/store.mjs` | Transporte REST para funções SQL do Supabase |
| `backend/cloud/delivery.mjs` | Transporte Resend, timeout e conclusão de leases |
| `supabase/migrations/202611010001_forms.sql` | Transações, quotas persistentes, deduplicação, fila, permissões e RLS |
| `api/*.mjs` | Entradas Web Standard das funções Vercel |
| `scripts/build-vercel.mjs` | Artefato de teste separado, com configuração pública por lista explícita |

## Funções implementadas

Contato recebe nome, e-mail, telefone obrigatório, motivo opcional e mensagem. Pesquisa recebe nome, e-mail, telefone opcional, aceite do texto já existente, edição 2025 e data. O aceite não é convertido em inscrição de newsletter. Os nomes dos campos da apresentação original permanecem intactos.

Cadastro e caixa de saída são salvos na mesma transação. Conteúdo idêntico durante dez minutos retorna o mesmo registro. A API pública não lista cadastros, e-mails, configurações ou dados administrativos. O operador usa o painel autenticado do Supabase, com acesso somente dos responsáveis. Não foi criado um login próprio nem um novo CMS para editar o conteúdo editorial.

## Proteções

- Corpos JSON limitados a 16 KiB, campos com limites e validação no servidor.
- Escrita aceita apenas as origens HTTPS configuradas. Origem não é autenticação nem substitui o limite de abuso.
- Limites no Postgres: dez tentativas por IP e cinco por e-mail a cada janela de dez minutos. Cada nova instância das funções compartilha essas cotas. Não é um rate limiter completo de borda; configure proteção de tráfego e limites de gastos do provedor antes de expor amplamente.
- IP e chave de e-mail das cotas são HMACs com segredo do servidor; o endereço IP bruto não é salvo. O e-mail do cadastro permanece privado no banco, como necessário para envio.
- Tabelas têm RLS habilitada e acesso de `anon`/`authenticated` revogado. RPCs de escrita e fila só têm execução concedida a `service_role`. A chave secreta moderna (ou o JWT service_role legado) fica exclusivamente no servidor. O adaptador usa apikey e não envia a chave moderna como Bearer, conforme a documentação do provedor.
- `MAIL_MODE=capture` por padrão. Para `send`, credenciais, remetente, destino e lista de destinatários de teste são obrigatórios. Qualquer destinatário fora da lista continua capturado, sem envio. Não existe modo de envio aberto a todos nesta etapa.
- `CRON_SECRET` forte protege o reenvio; não há interface pública de administração. Erros e recibos não expõem destinatários, dados pessoais nem mensagens brutas dos provedores.

## O que significa cada recibo

Uma resposta 202 confirma gravação, não entrega à caixa final. `captured` significa mensagem preparada sem envio; `pending` indica tentativa ainda sem confirmação; `accepted` significa aceitação pelo serviço de e-mail. A interface mantém essa distinção. `failed`/`review` não são apresentados como entrega nem como certeza de que nenhum e-mail saiu.

O status interno `sent` registra aceite HTTP com identificador do provedor. Ele não confirma chegada à caixa de entrada; essa distinção deve ser mantida em futuras alterações e na validação externa.

## Falhas, fila e idempotência

A primeira tentativa ocorre durante a submissão. Timeout/erro transitório mantém os dados e deixa a mensagem na fila. O worker obtém um lease de dois minutos; outro worker não pode concluir ou reenviar aquele lease ativo. A conclusão exige seu token. Há até cinco tentativas, com espera crescente. Erros permanentes ficam em `failed`; mensagens fora das regras ficam em `review`.

Cada pedido ao Resend usa a mesma chave derivada do ID imutável da caixa de saída. Como o provedor mantém essa deduplicação por 24 horas, o receptor deixa tentativas ambíguas com mais de 23 horas para revisão manual. Não é uma promessa de entrega exatamente uma vez: falhas entre aceite externo e confirmação no banco exigem reconciliação no painel do provedor. Não mudar remetente/corpo de uma mensagem pendente ou rotacionar o segredo de fingerprint durante uma validação de repetição sem registrar a consequência.

`vercel.json` agenda uma verificação diária às 09:00 UTC (06:00 em São Paulo). São até cinco mensagens por execução. Cron da Vercel roda no deployment que ela chama de production: aqui, isso deve ser **um projeto separado de teste**, jamais o domínio oficial. Deployments temporários de preview não recebem esse agendamento. Para retomada rápida após falha, o operador pode chamar `/api/retry-mail` por HTTPS com `Authorization: Bearer <CRON_SECRET>`, mantendo o segredo fora de URLs, capturas e logs. O agendamento diário pode deixar mensagens antigas em revisão; ele não garante recuperação rápida nem processa uma fila grande. Frequência maior requer configuração/plano adequado ou agendador autorizado. Não contratar isso automaticamente.

## Guardrails para futuras IAs

Leia `AGENTS.md` e registre cada mudança em `docs/tasks/`, no mesmo conjunto/commit. Registre pessoa/agente, IA/ferramenta, pedido, escopo, ambiente, decisões, arquivos alterados, verificações executadas e pendências. Inclua mudanças feitas em configurações externas, sem copiar segredos para o registro. Uma mudança de arquitetura ou de contrato deve atualizar este guia e os testes correspondentes.

`scripts/check-change-record.mjs` exige o registro com as seções do template. Os workflows do GitHub executam essa verificação antes dos testes/publicação do Pages. A regra não identifica automaticamente a autoria por IA nem prova a qualidade ou veracidade do texto: revisão humana continua necessária. Proteção da branch e verificações obrigatórias podem ser configuradas pelo titular para impedir mesclagens que falhem.

## Verificação e dependências externas

Os testes executam a migração em Postgres real compilado para WASM (PGlite) e simulam apenas as fronteiras HTTP dos provedores. Verificam transação, permissões, RLS mesmo se SELECT for concedido, cotas, deduplicação, lease, falhas, expiração da janela e autenticação do worker. Isso não valida credenciais reais, entrega, políticas do serviço, concorrência entre conexões reais ou publicação na Vercel.

Antes da ativação: criar contas/projetos de teste, aplicar a migração, conferir limites e plano, guardar segredos, definir destinatários de teste, backup/retenção e acesso dos operadores. Primeiro validar em captura; depois testar um e-mail real com endereço autorizado e conferir recebimento. Guia: [ATIVAR-TESTE.md](ATIVAR-TESTE.md). O link público atual do GitHub Pages permanece estático e com o fluxo alternativo existente.

## Fontes oficiais consultadas

- [Funções Node/Web Standard na Vercel](https://vercel.com/docs/functions/runtimes/node-js) e [cabeçalhos de IP controlados pela plataforma](https://vercel.com/docs/headers/request-headers).
- [Chaves de servidor no Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [funções e permissões no Supabase](https://supabase.com/docs/guides/database/functions) e [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Envio de e-mail](https://resend.com/docs/api-reference/emails/send-email) e [janela de idempotência](https://resend.com/docs/dashboard/emails/idempotency-keys) do Resend.
- [PGlite para executar Postgres nos testes](https://pglite.dev/docs/).
- [Restrições de uso do plano Hobby](https://vercel.com/docs/limits/fair-use-guidelines) e [limites de agendamento](https://vercel.com/docs/cron-jobs/usage-and-pricing). Não pressupor gratuidade para trabalho de cliente.
