# Backend local de teste e levantamento do Webflow

Status: implementação local concluída; levantamento privado do Webflow pendente

## Resultado esperado e escopo

Pedido: “faça o que dá” do backend com as configurações existentes; “tudo coloque no nosso sistema de teste por enquanto”. Consultar Webflow somente para leitura, sem alterar o site oficial, formulários, automações, destinatários, publicação ou DNS. Preparar o recebimento possível sem alegar acesso privado ainda não confirmado.

Arquivos previstos: `backend/{store,server,preview,inspect}.mjs`, `tests/backend.test.mjs`, `.gitignore`, `src/scripts/forms.js` (seleção opcional de endpoint local, confirmação honesta e sincronização do checkbox após reset), `docs/BACKEND-TESTE.md`, `docs/BACKEND-PENDENTE.md`, `docs/INTEGRACOES.md`, `docs/ARQUITETURA.md`, `docs/LEVANTAMENTO-WEBFLOW.md`, `README.md` e esta tarefa. Nenhum HTML, componente, CSS ou dado de animação precisa mudar. O build estático e os endpoints vazios de `site.json` permanecem como estão.

## Critérios de aceite

- Salvar contato e pesquisa com data, edição e referência do aceite em SQLite fora da pasta pública.
- Capturar mensagens de e-mail localmente, sem enviar ao Instituto nem aos visitantes.
- Validar campos, origem, host, tamanho do corpo e limite de requisições no servidor; nenhuma API de leitura dos cadastros.
- Preservar os nomes de campos existentes e os componentes de apresentação.
- Conferir persistência após reinício, duplicação por repetição, rejeições e integração no navegador.
- Não conectar a prévia pública a um backend local; GitHub Pages permanece sem receptor público até existir hospedagem própria.
- Registrar a capacidade real do plugin Webflow e diferenciar ausência de acesso de ausência de configuração.

## Execução

O receptor é isolado, sem dependências novas e limitado a loopback. O servidor fornece configuração de endpoints apenas em sua própria resposta de `config.js`; não modifica a configuração estática publicada. O contato não recebe destinatário presumido: sem confirmação, o destinatário da mensagem capturada fica vazio. Pesquisa prepara o link do PDF na prévia GitHub e registra o aceite do texto existente, sem criar consentimento de newsletter.

## Verificação e pendências

Build e 30 testes aprovados, incluindo seis testes reais do receptor HTTP/SQLite. Após alinhar a obrigatoriedade do telefone do contato com o HTML original, os seis testes do receptor foram executados novamente e passaram. Os contratos de apresentação continuam aprovados.

Verificado no navegador em largura CSS 1280 e 390: contato com motivo preenchido pela URL, cadastro de pesquisa com telefone opcional, aceite, confirmação de recebimento local, link correto do PDF e reset do checkbox nativo/customizado. Em 390, sem overflow horizontal. Dados usados foram fictícios; nenhum e-mail foi disparado. A captura em desktop fica no diretório privado de trabalho, fora do repositório. O servidor está em `http://127.0.0.1:4287/`, com dados persistidos em `.local-data/` e excluídos do Git. As portas 4174/4175 estavam ocupadas; o padrão do novo receptor é 4287.

Revisão do diff: nenhuma alteração em HTML, CSS, cabeçalho, carrossel, vendor ou interações; somente o módulo de envio reconhece configuração local, explica captura e sincroniza o checkbox no reset. O build público não recebeu endpoint local.

O plugin foi reconhecido como instalado e passou a oferecer ferramentas, mas o guia (duas tentativas) e a listagem de sites falharam com ferramenta desconhecida. Não houve consulta privada bem-sucedida nem alteração no Webflow. E-mail público, MX e CNAME previamente consultados foram registrados em `LEVANTAMENTO-WEBFLOW.md` sem confundi-los com destinatários/automação confirmados.

Credenciais de envio, destinatário privado e hospedagem pública própria continuam pendências. Não marcar envio real ou conexão de formulário público como concluídos. O usuário não precisa repetir sua autorização para consulta: quando o serviço Webflow responder, retomar o levantamento sem alterações na produção.

## Registro no GitHub

Código enviado no commit `e4d66110c4bca970c6dad5a1dc1e71a380811761`. A [verificação dos 30 testes](https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41346712990) e a [publicação da prévia estática](https://github.com/EricRLeao1311/instituto-entreatos-preview/actions/runs/41346712992) foram aprovadas. O módulo publicado de formulários foi comparado com a fonte, e a configuração pública foi conferida sem endpoints locais. O banco de teste contém um contato e um cadastro de pesquisa fictícios, com duas mensagens capturadas e nenhum envio; repetição no navegador não duplicou os dados.
