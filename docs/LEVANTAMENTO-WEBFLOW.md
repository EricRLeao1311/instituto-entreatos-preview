# Levantamento de configurações existentes

Consulta iniciada em 01/11/2026. Estado: parcial; configurações padrão confirmadas por textos fornecidos pelo usuário, overrides por formulário ainda não conferidos. Falha de acesso não significa configuração ausente.

## Evidências disponíveis

| Item | Evidência e conclusão |
| --- | --- |
| E-mail público | `contato@institutoentreatos.com.br`, informado na página de contato original e centralizado em `site.json`; não comprova destinatário privado dos formulários |
| Processamento original | HTML e runtime público examinados anteriormente: Contact e Name Form processados pelo Webflow; pesquisa redireciona ao PDF. Ver `FORMULARIOS-ORIGINAIS.md` |
| Serviço de recebimento do domínio | DNS em 01/11/2026: MX `smtp.google.com`, prioridade 1; recebimento aponta ao Google. Não confirma caixa, credenciais, encaminhamentos ou entrega |
| Hospedagem original | `www.institutoentreatos.com.br` tem CNAME `cdn.webflow.com`; DNS não foi alterado |
| Integração do Webflow | Catálogo confirmou instalação habilitada. Ferramentas passaram a ser listadas neste chat, mas chamadas de guia e listagem de sites retornaram erro de ferramenta desconhecida. Não houve leitura privada bem-sucedida |
| Configuração padrão de notificações | Confirmada pelo usuário na aba Forms: destinatário privado anotado fora do Git, remetente e template nativos do Webflow. Overrides por formulário ainda não confirmados |
| Integrações e código | Na aba Apps & Integrations fornecida pelo usuário, sem Connected Apps, integrações de marketing, webhooks ou tokens; usuário informou Custom code vazio. Não é auditoria de embeds ou código específico de páginas |
| Proteção de formulários | Filtro de spam ativo, bloqueio de bots e reCAPTCHA desligados nas telas consultadas; nenhuma opção foi alterada |

## O que ainda precisa ser conferido

1. Identificar o site Instituto Entre Atos entre os sites autorizados.
2. Conferir destinatários, reply-to, notificações, armazenamento, integrações e redirecionamentos de Contact e Name Form.
3. Distinguir notificação ao Instituto, redirecionamento ao PDF e eventual e-mail automático ao visitante. Somente o redirecionamento está comprovado até agora.
4. Conferir webhooks, serviços conectados, limites/plano, domínio principal e código de integração relevante, sem mudanças.
5. Registrar o que pode ser reutilizado na hospedagem de teste. Não copiar tokens, credenciais, cadastros pessoais nem URLs com segredos para este repositório público.

## Limites

O backend local pode ser usado sem credenciais externas, conforme `BACKEND-TESTE.md`. Envio real e receptor público dependem de configuração e hospedagem próprias. A autorização concedida é para o ambiente de teste. Não publicar, atualizar, redirecionar ou modificar o site oficial no Webflow.

O novo backend usa configuração própria e não depende de copiar as credenciais do Webflow. Consulte `BACKEND-CLOUD.md`; remetente de Webflow não deve ser usado para envio fora daquele serviço. O cadastro da pesquisa já era um formulário com redirecionamento ao PDF; envio automático do PDF ao visitante é uma função solicitada para a nova versão, não um serviço antigo comprovado.
