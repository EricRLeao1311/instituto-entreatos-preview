# O que os formulários do site original faziam

## Evidência consultada

Foram examinados o HTML público e o módulo de formulários carregado pelo site em 30/10/2026. Nenhum cadastro ou mensagem de teste foi enviado ao Instituto. Sem acesso ao painel e à caixa de entrada, não se pode confirmar recebimento, listas existentes ou automações privadas.

| Elemento | Encontrado na origem | O que está confirmado |
| --- | --- | --- |
| Contato | Formulário `wf-form-Contact`, nome interno `Contact`, sem `action` personalizado | O script padrão do Webflow associa esse formulário ao receptor de formulários do site |
| Pesquisa na capa e em Publicações | Formulário `wf-form-Name-Form`, com nome, e-mail, telefone e checkbox | Usa o mesmo processamento padrão e possui redirecionamento configurado para o PDF da pesquisa |
| Newsletter | Título “Inscreva-se na nossa newsletter” acima do formulário `Contact` | O convite existia, mas é o mesmo formulário com telefone e mensagem; não foi encontrado um receptor separado de newsletter |

O módulo original monta o destino a partir de `https://webflow.com/api/v1/form/` e do identificador público do site `69ca8fb4411afd539109a0e0`. O HTML não expôs destinatários, listas ou uma conta de provedor de e-mail. Ter o formulário configurado no código não prova que o plano, a entrega e uma automação estavam funcionando em produção.

Os atributos e campos capturados estão em `reference/original-forms.json`. O PDF indicado no redirecionamento foi baixado e está incluído no projeto. Sua origem e hash estão em `reference/assets.json`.

## Correção da explicação anterior

Contato e cadastro para a pesquisa não eram apenas ideias de integração: seus formulários e o processamento pelo Webflow já estavam configurados no site publicado. A primeira migração não transferiu esse receptor hospedado e usou um fluxo de preparação de e-mail e acesso ao PDF sem salvar dados.

Já uma integração independente de newsletter não foi comprovada. A ausência dessa comprovação não deve ser apresentada como perda de uma automação conhecida. Para transferir o recebimento com equivalência, o responsável precisa confirmar o destino dos contatos/cadastros e o que acontecia com eles no painel original.

## Estado da cópia local

A revisão de fidelidade mantém os rótulos e a apresentação originais. O motor local de animações não inicializa o módulo de formulários hospedados, evitando envios involuntários ao site de produção. O envio é tratado somente por `src/scripts/forms.js` e pelos endpoints públicos explicitamente configurados em `site.json`.

Os endpoints ainda estão vazios. O contato oferece preparar um e-mail após validar os campos; a pesquisa oferece o PDF local e informa que os dados não foram enviados. Para conectar um receptor próprio, siga `INTEGRACOES.md`. A restauração visual não equivale à migração da caixa de entrada do Webflow.
