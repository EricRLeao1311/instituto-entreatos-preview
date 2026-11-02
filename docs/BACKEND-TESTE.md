# Backend do ambiente de teste

Implementado em 01/11/2026, somente para teste local. Nenhum formulário é enviado ao Webflow ou a um serviço externo de e-mail. O site oficial, seu domínio, DNS, destinatários e automações não são alterados.

## Usar

Com Node.js 22.13 ou superior (recomendado 24):

```sh
node backend/preview.mjs
```

Abra `http://127.0.0.1:4287/`. O comando gera o mesmo site e inicia um receptor local. O servidor comum na porta 4173 continua sendo a prévia estática. Para outra porta, use `--port 4175`. O endereço só funciona neste computador.

Os formulários mantêm a aparência e a abertura originais. Depois de salvar, mostram que receberam os dados no ambiente de teste e que nenhum e-mail foi enviado. O formulário de pesquisa libera o mesmo PDF público. Não apresente essa captura de e-mail como entrega à caixa de entrada.

## O que funciona

| Função | Estado real |
| --- | --- |
| Receber contato, motivo, nome, e-mail, organização opcional e mensagem | Implementado e salvo em SQLite |
| Receber cadastro para a pesquisa | Implementado e salvo em SQLite |
| Registrar aceite | Texto existente, links dos termos/privacidade, edição 2025 e data registrados; não é consentimento de newsletter |
| Persistir após reiniciar | Implementado |
| Evitar duplicação por repetição imediata | Mesmo conteúdo nos dez minutos seguintes reutiliza o registro e não cria outra mensagem |
| Preparar e-mail de contato | Capturado para o destino público solicitado; sem envio |
| Preparar e-mail de pesquisa ao interessado | Capturado com o link do PDF; não é disparado |
| Conferir dados e caixa de saída | Comando local, sem rota pública de leitura |
| Validar campos, origem, host, tamanho e quantidade de requisições | Implementado no receptor local |
| Enviar e-mail real | Pendente: serviço de envio, configuração confirmada e credenciais |
| Receber formulários na prévia pública do GitHub Pages | Pendente: hospedagem pública própria para o receptor |

## Dados e conferência

O banco fica em `.local-data/forms.sqlite`, fora de `dist/`. Banco, arquivos auxiliares e diretório são ignorados pelo Git. Não inclua essa pasta em ZIPs, capturas, registros de teste ou publicação. Para conferir os vinte registros mais recentes e os e-mails preparados, execute localmente:

```sh
node backend/inspect.mjs
```

Esse comando pode exibir dados pessoais: sua saída não deve ser colada no repositório público. O receptor não expõe leitura, listagem, exportação nem administração por HTTP. Testes automatizados usam dados fictícios e banco temporário próprio.

O destinatário padrão do Webflow foi confirmado por texto do usuário e registrado fora do Git; overrides por formulário ainda não foram conferidos. O DOCX novo solicita explicitamente o destino público de contato; a captura agora usa esse endereço. `PREVIEW_CONTACT_TO` permite override privado somente para teste e não ativa envio real. O e-mail público do Instituto continua sendo `contato@institutoentreatos.com.br`.

## Separação da prévia pública

O servidor local fornece `/scripts/config.js` com endpoints `/api/contact`, `/api/research`, `/api/publications` e `/api/unsubscribe`. O código estático gerado conserva endpoints vazios; não recebe URL de localhost. No navegador, `forms.js` usa o endpoint explícito do formulário ou a configuração opcional oferecida pelo servidor local. Nenhum HTML, componente, CSS, estado inicial ou dado de animação foi substituído.

GitHub Pages continua servindo arquivos estáticos. Os cadastros feitos no endereço público ainda não chegam a este banco local. O repositório contém o código do receptor, mas não o executa. Não adicionar endpoint local ou credenciais a `site.json` para tentar contornar esse limite.

## Contrato HTTP

- `POST /api/contact`: `Name`, `Email`, `Organization` opcional, `Message`, `Reason` obrigatório entre seis motivos, `kind: "contact"`.
- `POST /api/research`: `Name`, `email`, `Phone` opcional, `checkbox` obrigatório, `Updates` opcional, `kind: "research"`.
- `POST /api/publications`: `Name`, `email`, `checkbox` obrigatórios, `kind: "publications"`.
- `POST /api/unsubscribe`: `token` do link privado; retorna 200 após cancelamento, sem revelar dados. Não modifica nada por GET.
- Retorno 202 após transação: `{id, duplicate, mode: "preview", email: "captured"}`. Cadastro e captura são gravados juntos ou nenhum é gravado.
- Erros: 400 para JSON inválido; 403 para host/origem não autorizados; 405 para método; 413 acima de 16 KiB; 415 para tipo de conteúdo; 422 para campos; 429 acima de dez requisições por endereço em dez minutos; 503 quando não foi possível gravar. Sem dados pessoais ou detalhes internos nos erros.

Somente loopback é utilizado. A origem é limitada ao mesmo servidor local. O limite de requisições é local e não substitui proteção apropriada para publicação pública; não foi implementada uma API pronta para exposição irrestrita na internet.

## Para o backend público e o envio real

Confirmar destinatário dos contatos, comportamento desejado da pesquisa, serviço de envio e acesso administrativo correspondente. Conhecer e-mail ou MX do domínio não fornece credenciais SMTP/OAuth. O plugin Webflow não concede automaticamente acesso à conta Google.

Escolher hospedagem de teste para processo Node com volume persistente (ou adaptar a persistência ao banco do provedor), HTTPS, configuração de origem e proteção contra abuso. Conectar envio por serviço autorizado, tratar tentativas/falhas e confirmar entrega. Depois informar apenas as URLs públicas dos receptores na configuração da prévia. Segredos ficam no servidor e dados pessoais fora do Git. Nenhuma dessas etapas exige substituir o site oficial.

## Referência técnica

SQLite usa o módulo integrado [`node:sqlite`](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html), sem instalar dependências. A transação associa cadastro e caixa de saída. O módulo pode emitir aviso experimental em versões de Node 22/24; o teste local utiliza Node 24.22.1. Não alterar baselines de apresentação para acomodar mudanças do receptor.

## Evolução para hospedagem

A validação e a composição das mensagens agora são compartilhadas por `backend/forms.mjs`. SQLite continua sendo a opção local sem contas. A opção hospedável, com Postgres e transporte de e-mail, está em `BACKEND-CLOUD.md`; a dependência de desenvolvimento PGlite serve apenas para testar o SQL e não entra no runtime.

Lista, histórico, cancelamento, persistência de segredo e comandos de exportação: [PUBLICACOES-EMAIL.md](PUBLICACOES-EMAIL.md). Toda exportação fica privada em `.local-data/`, nunca na pasta pública ou no Git.
