# Desempenho sem alterar a apresentação

Revisão local em 01/11/2026. O objetivo desta etapa é reduzir transferência e permitir revalidação, mantendo imagens, HTML editorial, CSS visual, runtime e todas as ações de animação.

## Decisões

- As 11 fontes originais foram convertidas integralmente para WOFF2. Não houve remoção de caracteres, pesos, hinting ou recursos de composição. O conversor confere cmap, avanços, contornos de todos os glifos e tabelas de layout/variação/hinting. As fontes originais permanecem em `public/assets/` para rastreabilidade e URLs existentes. As folhas de estilo apontam às novas fontes.
- Não reduzir automaticamente CSS nem filtrar eventos IX2: seletores dinâmicos, hover, elementos repetidos e referências entre ações tornam essas alterações arriscadas sem uma tarefa específica.
- Não alterar imagens nem adiar arbitrariamente os retratos do carrossel: os próximos retratos precisam estar disponíveis quando entram na tela. Esta revisão não modifica resolução, cores, compressão das imagens ou comportamento de lazy loading.
- O build gera variantes `.br` e `.gz` para arquivos textuais com pelo menos 1 KB, apenas se a variante for menor. O arquivo original permanece intacto. São variantes de transporte, nunca novos arquivos de conteúdo para edição.
- O servidor local negocia `Accept-Encoding`, informa `Vary`, conserva MIME original e atende HEAD sem corpo. ETags por representação permitem respostas 304. O cache exige revalidação, evitando versões antigas em URLs editáveis. O módulo `http.mjs` isola a entrega HTTP do observador de desenvolvimento.

## Resultados medidos

| Recurso | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| Inventário de 11 fontes | 1.899.852 bytes | 713.392 bytes | 62,4% |
| Conjunto de JS e CSS, gzip | 1.262.166 bytes sem compressão | 172.340 bytes | 86,3% |
| Conjunto de JS e CSS, Brotli | 1.262.166 bytes sem compressão | 155.967 bytes | 87,6% |
| Configuração integral de animações, Brotli | 593.325 bytes | 23.741 bytes | 96,0% |

O conjunto de JS/CSS é o inventário desses diretórios, não uma medição de tempo de carregamento de uma página específica. A compressão reduz transferência, não o trabalho de interpretar os dados descomprimidos. O tamanho total da pasta cresce porque preserva originais e variantes. Não declarar que o site ficou 87,6% mais rápido nem usar esses números como nota de Lighthouse ou Core Web Vitals.

## Publicação e manutenção

O build continua exigindo somente Node.js, sem instalação de pacotes. WOFF2 já está versionado. `scripts/convert-fonts.py` é opcional para futuras mudanças de fonte e requer `fonttools[woff]`; o build comum não executa Python. O relatório da conversão está em `reference/font-optimization.json`.

Gzip/Brotli estão ativos no servidor local. Em hospedagem externa, habilite compressão automática ou configure negociação das variantes pré-comprimidas preservando `Content-Type`, `Content-Encoding` e `Vary: Accept-Encoding`. Copiar arquivos `.br`/`.gz` sozinho não configura um provedor. Se não houver negociação, os originais continuam funcionando. Nunca substitua o conteúdo de um `.js` por bytes Brotli sem o cabeçalho correto. Não aplique cache `immutable` a URLs que continuam editáveis; configure revalidação por ETag no provedor.

Edite arquivos de origem; nunca edite variantes de `dist/`. Preserve as fontes originais e os registros históricos. Ao trocar uma fonte, repita as verificações de glifos e de layout. Não atualize baselines de animações para acomodar uma regressão de desempenho.

## Verificação desta revisão

- Build concluído; 14 testes aprovados, incluindo identidade das ações e hashes do runtime original.
- Cada variante comprimida foi descomprimida e comparada byte a byte ao original.
- Servidor testado por HTTP real: Brotli, gzip, qualidade/prioridade de negociação, identidade, fallback, HEAD, ETag/304, 406, 404, 405 e caminhos inválidos.
- Home, Quem somos, Contato e Publicações comparadas com a cópia anterior em 1440 × 1000 e 390 × 844, após carregar o rodapé. Altura total e dimensões das seções iguais; textos, famílias e dimensões dos títulos iguais com tolerância de 0,01 pixel para arredondamento de transformações. Registros em `reference/optimization/visual-comparisons.json`.
- Captura da home após a entrada animada em `reference/optimization/home-desktop.png`.

Não foi executado Lighthouse nem uma medição de velocidade em rede móvel. A comparação desta revisão cobre quatro páginas nos dois tamanhos; o teste de integridade cobre as 21 rotas. A pendência de integração dos formulários permanece a descrita em `INTEGRACOES.md`.
