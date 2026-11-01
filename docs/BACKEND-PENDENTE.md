# Backend e materiais pendentes

Existe um backend **local de teste** com persistência SQLite e captura de e-mails, descrito em [BACKEND-TESTE.md](BACKEND-TESTE.md). Não envia e-mails e não está hospedado no GitHub Pages. A configuração estática `site.forms.contactEndpoint` e `researchEndpoint` permanece vazia. O site oficial não foi alterado. As configurações padrão do Webflow foram confirmadas pelo usuário, com destinatário guardado fora do Git; overrides por formulário ainda estão pendentes; consulte [LEVANTAMENTO-WEBFLOW.md](LEVANTAMENTO-WEBFLOW.md).

Para a pesquisa de 2025: hospedar receptor HTTPS e conectar um serviço de e-mail que envie o PDF ou seu link ao interessado. A validação e a gravação do cadastro/aceite já estão implementadas no receptor local de teste. O formulário preservado usa `Name`, `email`, `Phone` opcional, `checkbox` e `kind: research`. Registrar a edição 2025 e a referência aos termos aceitos no receptor. Não colocar chaves de envio no navegador. Configurar a URL pública somente quando o serviço estiver disponível e confirmar recebimento antes de anunciar envio funcionando.

Para Contato: hospedar o receptor já implementado e confirmar o destinatário e o serviço de envio. O receptor recebe `Name`, `Email`, `Subject` (telefone), `Message`, `Reason` e `kind: contact`. O motivo aceita `apresentar-contato`, `convidar-instituto`, `contar-historia` ou vazio. Sem receptor, o site oferece preparar a mensagem no aplicativo do visitante.

Validação, limite local de requisições e tratamento de falha de gravação estão implementados no teste. Antes de hospedar publicamente, definir origens autorizadas e proteção contra abuso adequada ao provedor. Uma resposta 2xx confirma aceitação pelo receptor, não a chegada à caixa de e-mail. O PDF atual é público e o cadastro não é controle de acesso ao arquivo.

Materiais: arquivo/URL do manifesto; fotos de Mari C. e Sônia P.; confirmação do canal de YouTube. Até receber, manter o conteúdo existente e as iniciais identificadas, sem inventar fotos, vídeos ou destinos.

Após a publicação, o responsável pelo domínio pode configurar/verificar Search Console e solicitar reindexação. Nenhuma conta externa foi acessada nesta etapa.

## Código de backend para hospedagem preparado

Além do receptor local, existe implementação para Vercel/Supabase/Resend, com validação compartilhada, migração SQL, RLS, quotas, fila e transporte de envio. Código testado não equivale a serviço ativado: o usuário não tem as três contas, portanto configuração, implantação de teste, política de retenção/backup e entrega real continuam pendentes. Consulte `BACKEND-CLOUD.md` e `ATIVAR-TESTE.md`. O modo de envio é limitado a destinatários de teste e o domínio oficial permanece fora do escopo.
