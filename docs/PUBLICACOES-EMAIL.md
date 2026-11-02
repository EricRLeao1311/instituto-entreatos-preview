# Publicações, pesquisa e consentimento

Contrato atualizado pelos documentos Contato e Biblioteca de 31/10/2026. Implementado somente no ambiente de teste. Não substituir o site oficial nem anunciar envio real sem configuração e validação externa. Registro: [tarefa](tasks/2026-11-contato-biblioteca.md).

## Três finalidades distintas

| Fluxo | Campos | Efeito |
| --- | --- | --- |
| `/api/contact` | `Name`, `Email`, `Reason`, `Message` obrigatórios; `Organization` opcional; `kind: contact` | Mensagem ao Instituto; não inscreve na lista |
| `/api/research` | `Name`, `email`, `checkbox` obrigatórios; `ConsentVersion: biblioteca-2026-11-01`; `kind: research` | Formulário na Biblioteca: pedido do PDF, origem `pesquisa`, sem inscrição em novidades |
| `/api/publications` | `Name`, `email`, `checkbox` obrigatórios; `kind: publications` | Origem `biblioteca`, aceite explícito para publicações e mensagem de boas-vindas |

O checkbox da pesquisa registra somente os termos/privacidade. A inscrição em publicações fica em outro formulário; os dois aceites começam desmarcados. No formulário novo não há telefone nem escolha Updates. A API mantém compatibilidade com os diálogos antigos, que podem ter Phone/Updates opcionais; com a versão nova do aceite, Updates é sempre ignorado, mesmo se injetado na requisição. O aceite da Biblioteca inclui termos, privacidade e cancelamento. O backend salva texto dos aceites, URLs legais, origem, edição e data; mantém histórico separado de escolhas. Não preencher escolhas em nome do visitante.

O texto editorial dos motivos de contato está em `src/content/contact.json`, emitido pelo build como `contact-data.js` e também importado pela validação do servidor. Os seis motivos são obrigatórios; URL válida pode pré-selecionar um, mas o visitante pode mudar. Sem parâmetro ou com valor desconhecido, começa vazio. Organização não é telefone. `Subject` antigo é aceito opcionalmente para compatibilidade e não é salvo no novo contato.

## Persistência, cancelamento e exportação

SQLite local usa `audience`, `audience_events` e `local_meta`; Postgres usa `ea_audience` e `ea_audience_events`. Uma linha por e-mail normalizado acumula as origens. Um pedido de pesquisa sem novidades não cancela nem reativa uma escolha anterior. O cancelamento desativa a inscrição; uma nova escolha explícita pode reativá-la. Histórico e caixa de saída ficam privados. A deduplicação de dez minutos não bloqueia uma reinscrição explícita após cancelamento.

O link de cancelamento abre `/cancelar-inscricao#token=…`. A visita não altera dados: é necessário confirmar pelo botão, que faz `POST /api/unsubscribe`. O token é HMAC com segredo privado; o banco de audiência guarda seu hash. O endereço do visitante não fica no link. O segredo local é persistido no banco; em hospedagem manter `FORM_HASH_SECRET` estável. Sua rotação invalida links anteriores e exige plano registrado. Tokens constam das mensagens privadas da caixa de saída e devem ser tratados como acesso ao cancelamento.

O endpoint de cancelamento não revela se o e-mail existe e não abre leitura da lista. No Postgres, usa cota persistente própria e bloqueia boas-vindas ainda pendentes para o endereço cancelado. Mensagens já em envio/aceitas pelo provedor não podem ser recolhidas; conciliar eventuais corridas antes de iniciar campanhas. Cancelamento não apaga automaticamente contatos ou pedidos de pesquisa: a política de retenção e pedidos de exclusão ainda precisa ser definida pelo responsável.

Exportação exclusiva do operador:

```sh
node backend/audience-export.mjs
node backend/audience-export.mjs --events
node --env-file=.env backend/audience-export.mjs --cloud
node --env-file=.env backend/audience-export.mjs --cloud --events
```

Saída em `.local-data/audience.csv` ou `audience-events.csv`, ignorada no Git e fora da pasta pública. Inclui estado/origens/aceite; o histórico traz datas das escolhas. CSV neutraliza prefixos de fórmulas. A opção cloud exige credenciais privadas do servidor e lê todas as páginas do banco. Exportação não dispara campanhas. Nunca anexar dados reais a documentação pública.

## E-mails e ativação

Contato usa o destino público solicitado `contato@institutoentreatos.com.br`, identifica o motivo no assunto e usa o endereço do visitante em Reply-To. Isso atualiza o destinatário para este código de teste, sem alterar as configurações do Webflow.

Boas-vindas usa assunto e texto do documento, nome do remetente Instituto Entre Atos, resposta para o e-mail público e link obrigatório de cancelamento. O link LinkedIn foi corrigido para o artigo “A lacuna que a empresa aceita por dentro e recusa por fora”, confirmado nos cinco documentos revisados. É o mesmo destino dos botões da Home, Nossa atuação e Biblioteca. A antiga página interna redireciona ao LinkedIn; não publicar o texto de referência como outro artigo.

A pesquisa prepara mensagem com o link do PDF público. Isso atende ao acesso completo por e-mail, sem anexo pesado. Se a cliente exigir anexo, registrar uma mudança específica no transporte. Não há disparador de campanhas em massa: a lista é exportável para ferramenta autorizada; novas publicações continuam sendo editadas no código, sem CMS novo.

Aplicar **as duas migrações, em ordem**, no projeto Supabase de teste: `202611010001_forms.sql`, depois `202611020001_publications.sql`. Não reexecutar nem editar migração já aplicada. A segunda amplia o contrato e adiciona audiência, eventos, trigger transacional e cancelamento; as novas tabelas também têm RLS e acesso público revogado.

Sem backend, os botões de pesquisa e inscrição da Biblioteca ficam desabilitados e a página informa a configuração pendente. Com o receptor local, é possível testar captura sem envio. Em hospedagem, `MAIL_MODE=capture` continua padrão; envio só para a lista autorizada de teste. Não transformar recibo de captura em confirmação de entrega.

Ainda faltam contas/projetos, banco online, segredos privados, remetente autorizado e teste de entrega/resposta/cancelamento reais. O remetente solicitado `contato@institutoentreatos.com.br` depende de autorização do provedor e, normalmente, verificação do domínio; DNS oficial permanece fora do escopo atual. Não ativar o texto “Pesquisa completa enviada por e-mail” nem promover Biblioteca/Pesquisas ao domínio oficial antes desse teste. Consulte [ATIVAR-TESTE.md](ATIVAR-TESTE.md).

## Regra de manutenção com IA

Toda alteração futura precisa de registro em `docs/tasks/` no mesmo commit: responsável/IA, pedido, ambiente, decisão, arquivos e verificações reais. Atualizar este contrato e testes ao mudar campos, aceites, origens, destinatário, cancelamento ou exportação. Preservar o componente visual e as animações; não usar integração como autorização de redesenho. `AGENTS.md` continua sendo a fonte obrigatória dessas regras.

A versão do aceite da pesquisa é calculada no servidor a partir do identificador permitido `biblioteca-2026-11-01`; o texto salvo é “Li e aceito os Termos de uso e a Política de privacidade.”. Identificador desconhecido é recusado. Não aceitar texto legal arbitrário do navegador. O recibo da prévia continua identificando captura/pendência/aceite do provedor; não mostra a promessa de envio da versão definitiva. O novo texto de sucesso/falha está preparado em `forms.js` para o contrato de envio futuro, sem ativá-lo.
