# Levantamento de configurações existentes

Consulta iniciada em 01/11/2026. Estado: parcial; configurações privadas ainda não recuperadas. Falha de acesso não significa configuração ausente.

## Evidências disponíveis

| Item | Evidência e conclusão |
| --- | --- |
| E-mail público | `contato@institutoentreatos.com.br`, informado na página de contato original e centralizado em `site.json`; não comprova destinatário privado dos formulários |
| Processamento original | HTML e runtime público examinados anteriormente: Contact e Name Form processados pelo Webflow; pesquisa redireciona ao PDF. Ver `FORMULARIOS-ORIGINAIS.md` |
| Serviço de recebimento do domínio | DNS em 01/11/2026: MX `smtp.google.com`, prioridade 1; recebimento aponta ao Google. Não confirma caixa, credenciais, encaminhamentos ou entrega |
| Hospedagem original | `www.institutoentreatos.com.br` tem CNAME `cdn.webflow.com`; DNS não foi alterado |
| Integração do Webflow | Catálogo confirmou instalação habilitada. Ferramentas passaram a ser listadas neste chat, mas chamadas de guia e listagem de sites retornaram erro de ferramenta desconhecida. Não houve leitura privada bem-sucedida |
| Destinatários, automações e serviços privados | Não confirmados; nenhum valor presumido foi usado no receptor |

## Consultar quando a conexão responder

1. Identificar o site Instituto Entre Atos entre os sites autorizados.
2. Conferir destinatários, reply-to, notificações, armazenamento, integrações e redirecionamentos de Contact e Name Form.
3. Distinguir notificação ao Instituto, redirecionamento ao PDF e eventual e-mail automático ao visitante. Somente o redirecionamento está comprovado até agora.
4. Conferir webhooks, serviços conectados, limites/plano, domínio principal e código de integração relevante, sem mudanças.
5. Registrar o que pode ser reutilizado na hospedagem de teste. Não copiar tokens, credenciais, cadastros pessoais nem URLs com segredos para este repositório público.

## Limites

O backend local pode ser usado sem credenciais externas, conforme `BACKEND-TESTE.md`. Envio real e receptor público dependem de configuração e hospedagem próprias. A autorização concedida é para o ambiente de teste. Não publicar, atualizar, redirecionar ou modificar o site oficial no Webflow.
