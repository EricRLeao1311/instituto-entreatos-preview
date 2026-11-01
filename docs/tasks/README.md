# Trabalhos futuros com IA

Cada tarefa deve definir resultado, limites de alteração e uma prova de conclusão. Copie `TAREFA.md` para um nome específico, como `2026-11-atualizar-biografia.md`, e preencha antes ou durante a execução. Uma tarefa pode ser curta; os campos existem para impedir que uma alteração local vire uma reformulação geral.

## Prompt inicial sugerido

```text
Leia AGENTS.md e docs/MAPA-DE-EDICAO.md. Faça a tarefa descrita em
docs/tasks/<arquivo>.md. Identifique os arquivos afetados, execute a
alteração e verifique o resultado. Preserve as páginas fora do escopo.
Ao terminar, registre no arquivo da tarefa os testes realmente executados
e as pendências. Não invente conteúdos, endpoints ou dados institucionais.
```

## Exemplos de escopo

**Biografia:** “Atualizar a biografia de member2 em team.json com o texto fornecido. Conferir Quem somos em desktop e celular. Preservar fotos e cargos.”

**Visual local:** “Aumentar o espaço entre o formulário e o texto na página Contato. Limitar a regra a body[data-page=contato]. Conferir Contato em 390 e 1440 pixels e verificar que a capa não mudou.”

**Publicação:** “Adicionar o artigo fornecido em /publicacoes/<slug> e o card na listagem. Atualizar metadados e mapa. Verificar rota direta, imagem, links e celular.”

**Integração:** “Configurar o endpoint fornecido para o contato seguindo INTEGRACOES.md. Usar o receptor de teste indicado. Demonstrar sucesso, erro e timeout; só declarar recebimento após a confirmação do destinatário.”

Documentação orienta o agente, mas não substitui a revisão do diff e a validação visual. O controle mais útil é um escopo explícito acompanhado de evidência de conclusão.
