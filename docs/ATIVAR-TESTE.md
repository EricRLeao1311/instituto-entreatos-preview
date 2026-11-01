# Ativar a versão de teste com backend

O código está preparado; esta página descreve a configuração que ainda depende do titular das contas. Não é preciso trocar o domínio atual nem mexer no Registro.br para testar. Use projetos novos e isolados. Não escolha bancos, contas ou serviços de produção existentes.

## 1. Criar as contas e conferir o plano

Criar contas em [Supabase](https://supabase.com/), [Vercel](https://vercel.com/) e [Resend](https://resend.com/). Cada serviço exige configuração e tem limites próprios. O plano Hobby da Vercel é restrito a uso pessoal não comercial; para trabalho de cliente, confirmar o plano aplicável antes de publicar. Não foi contratado nenhum plano nesta tarefa.

O Resend só é necessário para disparar e-mails reais. Até lá, o modo de captura permite conferir cadastro e mensagens na caixa de saída do banco. O teste local com SQLite continua disponível sem nenhuma dessas contas.

## 2. Preparar o banco de teste

No Supabase, criar um projeto exclusivo para esta prévia, conferir a região e guardar as credenciais no gerenciador do titular. Executar uma vez a migração `supabase/migrations/202611010001_forms.sql` no SQL Editor desse projeto novo. Conferir as tabelas `ea_submissions`, `ea_outbox`, `ea_rate_limits` e as funções `ea_submit`, `ea_claim`, `ea_finish`. O teste automatizado executa o mesmo SQL, mas ainda é necessário conferir no projeto real.

Copiar a URL do projeto e a chave de serviço somente para as variáveis privadas da Vercel. Não enviar a chave em chat, captura, repositório, `site.json` ou arquivo público. Usar preferencialmente a chave secreta moderna. A alternativa legada JWT `service_role` é aceita em `SUPABASE_SERVICE_ROLE_KEY`; as chaves anônima/publishable não servem para este backend. No painel, restringir colaboradores aos responsáveis, definir backup/retenção apropriados e evitar exportações com dados reais para o Git.

## 3. Preparar a hospedagem de teste

Na Vercel, importar o repositório `EricRLeao1311/instituto-entreatos-preview` como **um projeto novo de teste**. Manter as configurações de `vercel.json`: Node 24, instalação com `npm ci --ignore-scripts`, build `npm run build:vercel`, saída `dist-vercel`. O build executa o gerador e a suíte antes de preparar a publicação. Usar somente o endereço `.vercel.app` gerado; não adicionar o domínio da cliente.

O projeto de teste pode usar o alias que a Vercel chama de production, necessário para o cron. Esse nome interno não é autorização para substituir o site oficial. `APP_STAGE` continua `preview`; o domínio oficial é recusado pelo receptor.

## 4. Configurar as variáveis privadas

Usar `.env.example` como lista de nomes. Não publicar os valores. No início, manter `MAIL_MODE=capture`.

| Nome | Preencher com |
| --- | --- |
| `APP_STAGE` | `preview` |
| `APP_ORIGIN` | Origem HTTPS do endereço de teste, sem barra final ou caminho |
| `BACKEND_ENABLED` | `true` somente após banco e segredos configurados |
| `SUPABASE_URL` | URL HTTPS do novo projeto de teste |
| `SUPABASE_SECRET_KEY` | Chave secreta privada do projeto; usa o papel service_role |
| `FORM_HASH_SECRET` | Segredo aleatório forte, ao menos 32 caracteres; manter estável entre deploys |
| `CRON_SECRET` | Outro segredo aleatório forte, ao menos 32 caracteres |
| `MAIL_MODE` | `capture` inicialmente |
| `CONTACT_TO` | Destinatário confirmado, guardado só no servidor; o padrão do Webflow foi anotado no levantamento privado |
| `MAIL_FROM` | Endereço que o provedor autorize como remetente; não usar o remetente do Webflow |
| `MAIL_ALLOWED_RECIPIENTS` | Lista separada por vírgulas de e-mails autorizados para teste |
| `RESEND_API_KEY` | Chave privada de envio, quando o Resend estiver configurado |

O backend também aceita o hostname da própria implantação informado pela Vercel. Aplicar as variáveis somente ao projeto e aos ambientes de teste apropriados. Após alterar variáveis de build, republicar **esse projeto de teste** para que os endpoints sejam habilitados/desabilitados na configuração pública. Em outros domínios de teste, adaptar explicitamente os guardrails com registro e testes.

## 5. Conferir captura antes de enviar

Abrir Contato e Pesquisa no endereço de teste. Usar dados fictícios. Conferir nome, telefone, motivo, aceite e link do PDF. Após receber, a tela deve explicar que nenhum e-mail foi enviado. Conferir no painel do banco o cadastro e a mensagem correspondente com status `captured`. Repetir a mesma submissão e confirmar que não duplica durante dez minutos. Validar campos inválidos e testar em celular.

Verificar que uma pessoa sem acesso administrativo não consegue consultar as tabelas. Nenhuma URL pública de listagem dos cadastros foi implementada. Não alterar RLS nem conceder acesso anônimo para facilitar testes.

## 6. Habilitar um envio real de teste

No Resend, configurar um remetente permitido e criar uma chave de envio. Para a primeira validação, o remetente de teste oferecido pelo serviço pode ter restrições de destinatário; conferir no painel. Não adicionar registros de DNS ao domínio oficial nesta etapa. Se houver necessidade de verificar um domínio, usar um domínio de teste próprio autorizado ou deixar a verificação pendente.

Preencher as variáveis de envio e a lista de destinatários de teste. Somente então definir `MAIL_MODE=send` e publicar novamente o projeto de teste. Submeter dados para um endereço da lista; confirmar o ID de aceitação em `ea_outbox` e a chegada do e-mail na caixa real. Testar Contato e Pesquisa separadamente. Cadastro de endereço fora da lista deve ficar capturado sem disparo.

Não chamar uma mensagem de “entregue” apenas porque o endpoint retornou 202 ou o provedor aceitou. Falhas transitórias ficam em fila; `failed` e `review` exigem avaliação do operador. O cron é diário e não garante recuperação imediata. Consulte os limites de retry e idempotência em [BACKEND-CLOUD.md](BACKEND-CLOUD.md).

## 7. Registrar o resultado

Atualizar a tarefa com o endereço real de teste, serviço/projeto escolhido sem segredos, migração aplicada, testes executados, resultado de recebimento e pendências. Registrar também a pessoa/IA que fez a configuração. A próxima IA deve conseguir distinguir o que está codificado, configurado, publicado e efetivamente verificado.

Somente após aprovação futura do usuário será criado um plano separado para domínio e produção. Nenhum passo deste guia altera o site oficial.
