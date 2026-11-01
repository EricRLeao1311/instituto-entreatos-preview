# Backend e materiais pendentes

Esta etapa continua restrita ao front-end. `site.forms.contactEndpoint` e `researchEndpoint` permanecem vazios.

Para a pesquisa de 2025: criar receptor HTTPS, validar nome/e-mail/aceite, salvar o cadastro e conectar um serviço de e-mail que envie o PDF ou seu link ao interessado. O formulário preservado usa `Name`, `email`, `Phone` opcional, `checkbox` e `kind: research`. Registrar a edição 2025 e a referência aos termos aceitos no receptor. Não colocar chaves de envio no navegador. Configurar a URL pública somente quando o serviço estiver disponível e confirmar recebimento antes de anunciar envio funcionando.

Para Contato: conectar o receptor com `Name`, `Email`, `Subject` (telefone), `Message`, `Reason` e `kind: contact`. O motivo aceita `apresentar-contato`, `convidar-instituto`, `contar-historia` ou vazio. Sem receptor, o site oferece preparar a mensagem no aplicativo do visitante.

Configurar validação no servidor, controle de abuso, tratamento de falhas e CORS se necessário. Uma resposta 2xx confirma aceitação pelo receptor, não a chegada à caixa de e-mail. O PDF atual é público e o cadastro não é controle de acesso ao arquivo.

Materiais: arquivo/URL do manifesto; fotos de Mari C. e Sônia P.; confirmação do canal de YouTube. Até receber, manter o conteúdo existente e as iniciais identificadas, sem inventar fotos, vídeos ou destinos.

Após a publicação, o responsável pelo domínio pode configurar/verificar Search Console e solicitar reindexação. Nenhuma conta externa foi acessada nesta etapa.
