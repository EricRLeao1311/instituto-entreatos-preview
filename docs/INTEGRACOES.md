# Integrações e formulários

## O que a migração pública permite

O navegador expõe o HTML dos formulários, mas não a caixa de entrada, automações, cadastros ou configurações privadas do Webflow. Esses serviços não podem ser recuperados por download do site. A reconstrução oferece uma interface de integração explícita em `src/content/site.json`.

```json
{
  "forms": {
    "contactEndpoint": "",
    "researchEndpoint": "",
    "publicationsEndpoint": "",
    "unsubscribeEndpoint": ""
  },
  "research": {
    "documentUrl": "/assets/panorama-retorno-profissional-2025.pdf"
  }
}
```

Os endpoints vazios são pendências reais. O PDF público foi recuperado do redirecionamento do formulário de origem e está incluído localmente. A configuração distribuída não contém chaves de API, tokens ou destinatários inventados.

## Contato sem servidor

O rótulo original do botão é preservado. Sem `contactEndpoint`, o formulário valida os campos e oferece um link `mailto:` com a mensagem preenchida. O visitante abre o próprio aplicativo e conclui o envio. O site não apresenta uma confirmação de recebimento nesse fluxo.

O e-mail público foi centralizado como `contato@institutoentreatos.com.br`, que aparece no contato do site de origem. O rodapé original tinha `intitutoentreatos.com.br`, sem a primeira letra “s”; essa inconsistência foi corrigida para usar o endereço da página de contato.

## Envio direto

Informe uma URL HTTPS de um receptor controlado pelo Instituto. O navegador envia `POST` com `Content-Type: application/json` e espera uma resposta HTTP 2xx. O payload do contato é:

```json
{
  "Name": "Nome do visitante",
  "Email": "email@exemplo.com",
  "Organization": "Organização opcional",
  "Message": "Mensagem",
  "Reason": "convidar-instituto",
  "kind": "contact"
}
```

Contato agora exige nome, e-mail, motivo e mensagem; organização é opcional e não há telefone no formulário. A mudança é autorizada pelo DOCX de Contato e coordenada nos dois receptores. `Subject` antigo é tolerado opcionalmente para compatibilidade, sem ser salvo. O formulário atual da pesquisa fica na Biblioteca e usa `Name`, `email`, `checkbox` obrigatório, `ConsentVersion: biblioteca-2026-11-01` e `kind: "research"`. Não inscreve em novidades. A API preserva Phone/Updates somente para compatibilidade com os diálogos antigos. Os nomes são sensíveis a maiúsculas e minúsculas. Contrato completo dos três fluxos: [PUBLICACOES-EMAIL.md](PUBLICACOES-EMAIL.md).

O receptor precisa validar os dados, verificar consentimento quando aplicável, limitar abuso e enviar a mensagem ou salvar o cadastro. Para um domínio diferente, deve aceitar o preflight CORS e a origem pública do site. Um segredo de envio de e-mail fica no receptor; qualquer valor neste repositório e no JavaScript é público.

Os módulos desativam o botão durante o envio, impõem limite de 15 segundos e exibem erro se não houver confirmação HTTP. Uma resposta 2xx confirma aceitação pelo receptor, não prova entrega de e-mail na caixa final. A integração precisa ser validada ponta a ponta pelo responsável pelo receptor antes da troca do domínio.

## Pesquisa

A aparência e a abertura do diálogo são as originais exportadas; a validação dos campos é nativa. Informe o endereço confirmado do documento em `research.documentUrl`. Esse campo é público e não serve como controle de acesso: se o documento for restrito, use autenticação e autorização no backend.

Sem endpoint e com documento configurado, o formulário oferece o documento e informa que os dados não foram enviados. Sem endpoint e sem documento, oferece solicitar a pesquisa por e-mail. Com endpoint configurado, apresenta o link do documento somente após uma resposta 2xx. O arquivo distribuído já aponta para o PDF público recuperado; a URL e o hash estão no manifesto de recursos.

## Publicações do Instituto

A inscrição fica na Biblioteca e usa finalidade própria; Contato não inscreve. Há lista única, origens pesquisa/biblioteca, aceite separado para novidades, boas-vindas, cancelamento e exportação privada. O botão fica desabilitado no build estático sem endpoint; no teste local recebe e captura a mensagem sem enviá-la. A observação sobre “newsletter” do site antigo é evidência histórica em `FORMULARIOS-ORIGINAIS.md`, não o contrato atual. Ativação e campos: [PUBLICACOES-EMAIL.md](PUBLICACOES-EMAIL.md).

## Vídeos e documentos externos

A revisão 2 restaura os iframes originais do Embedly/YouTube para manter sua apresentação e seus controles. Esses serviços continuam necessários para reprodução, como eram no site de origem. Os vídeos de fundo visíveis foram baixados e servidos localmente. Documentos do Drive, matérias de imprensa, WhatsApp e redes sociais continuam externos.

## Critério de conclusão de uma integração

Use um receptor de teste ou um ambiente autorizado. Verifique um sucesso real, uma rejeição, um timeout, campos inválidos e o comportamento em celular. Só registre “envio funcionando” depois de o responsável confirmar o recebimento. Registre a URL pública do receptor e as condições do teste, sem dados pessoais ou segredos.

## Receptor local de teste

`node backend/preview.mjs` abre a versão com recebimento local em `http://127.0.0.1:4287/`. O banco e a caixa de saída ficam em `.local-data/`, nunca na pasta pública. Sem envio externo. A resposta 202 com `mode: "preview"` faz o navegador explicar que recebeu no ambiente de teste e não enviou e-mail. O checkbox original acompanha o reset após o sucesso. A prévia estática publicada conserva os endpoints vazios e o fluxo alternativo existente. Contratos, limites e próximos passos: [BACKEND-TESTE.md](BACKEND-TESTE.md). Levantamento das configurações privadas: [LEVANTAMENTO-WEBFLOW.md](LEVANTAMENTO-WEBFLOW.md).

## Backend de teste hospedável

A nova opção usa `api/` e `backend/cloud/`, mantendo os mesmos campos e apresentação. O recibo 202 separa captura (`captured`), fila (`pending`) e aceite do provedor (`accepted`); nenhum deles prova entrega à caixa final. Não há envio aberto ao público nesta etapa: remetente, destinatários de teste e credenciais são configuração privada. Consulte `BACKEND-CLOUD.md` e `ATIVAR-TESTE.md`. GitHub Pages e o build padrão conservam endpoints vazios. A opção Vercel habilita os endpoints relativos no módulo público de configuração somente após ativação explícita.

Revisão de 01/11: a Biblioteca contém dois formulários separados. O novo pedido de pesquisa não exige telefone e não oferece inscrição em novidades. Sem backend, os dois botões ficam desabilitados com aviso honesto; o fallback dos diálogos legados continua preservado. `/pesquisas` leva ao bloco da Biblioteca, e análises abrem o LinkedIn confirmado. Ver `PUBLICACOES-EMAIL.md`.
