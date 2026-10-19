# Brainstorm: Time de precificação para quem não entende de precificação

> Sessão de brainstorm conceitual entre usuário e Claude, registrada em 2026-10-18. Sem código nesta etapa. A rodada multi-IA com Codex foi tentada e falhou por erro de API, então a mesa seguiu só entre usuário e Claude. Revisada no mesmo dia após reavaliação crítica.

## Contexto

O time "Pricing and Size Agents" (`agents/reversa-pricing-profile`, `reversa-pricing-size`, `reversa-pricing-estimate`, docs em `docs/pricing/`) assume que o usuário já sabe taxa hora, markup e regime tributário, e precifica apenas serviço por feature (horas x taxa + imposto + markup). Os três agentes proíbem consulta à internet. A faixa de mercado é uma tabela estática por país. Não há orientação sobre como vender o software (venda, aluguel, assinatura, loja de apps). O objetivo do dono do projeto é atender também o leigo, que criou um software com o Reversa e nunca precificou.

## Pergunta central

> Qual é o menor desenho de agentes que atende o leigo e o experiente sem inventar número e sem inflar o time?

## Achado central da reavaliação

O cenário que motivou a mesa (leigo que construiu um software e quer vendê-lo) é precificação de **produto**: quanto cobrar de quem usa. O time atual precifica **serviço por feature**: quanto cobrar de um cliente para construir. São dois problemas com entradas diferentes. O `size.json` de uma feature não informa preço de assinatura nem de licença. Por isso produto não cabe como "mais um cenário" dentro do estimate atual: precisa de estágio próprio, com entradas próprias (custo recorrente mensal, renda desejada, comissão da loja, preço de comparáveis).

## Decisões tomadas

1. **Orquestrador `reversa-pricing`.** Porta de entrada do time, no padrão de `reversa` e `reversa-forward`. Detecta o estágio por artefatos físicos em `_reversa_sdd/_pricing/` (advisor, profile, size, estimate) e roteia para o próximo. Só roteia, não escreve artefato. Valor principal: o leigo digita um único comando e, ao voltar depois, descobre onde parou.
2. **`reversa-pricing-advisor` obrigatório no caminho orquestrado.** Primeiro estágio. Entrevista sobre o modelo de venda e grava o resultado. Pode recomendar mais de um modelo quando houver viabilidade, com motivo e riscos de cada um, em lista ordenada. O usuário escolhe quais modelos quer precificar. A escolha define a trilha: serviço (pipeline atual) ou produto (estágio novo), ou ambas.
3. **`reversa-pricing-research` separado do advisor.** Pesquisa na web, com escopo restrito: taxa hora por senioridade e região, preço de produtos comparáveis, e atualização das tabelas estáticas quando estiverem velhas. Tenta cidade, depois estado, depois país, e mostra qual nível usou. Sem dado, pergunta ao usuário. Nunca preenche em silêncio.
4. **Modo leigo ou experiente, uma pergunta no início.** Em vez de "informar ou pesquisar" campo a campo, o profile pergunta uma vez: "você sabe seus valores ou quer que eu pesquise?". No modo leigo, o research cobre o que dá para pesquisar e o restante entra como padrão com origem registrada.
5. **Origem de cada valor.** Cada campo do profile registra se foi digitado, pesquisado ou padrão. Para o pesquisado, guarda fonte e data. O estimate usa isso para avisar o grau de confiança.
6. **Web só no research.** Os demais agentes continuam sem internet. O research mostra faixa com fonte e data, e o usuário confirma antes de o valor entrar no profile. O research declara o que faz quando o engine não oferece busca (Codex, Gemini CLI, Cursor): avisa e cai para o modo de informar.
7. **Trilha de produto: calculadora de ponto de equilíbrio, não previsão de receita.** Prever usuários, conversão e churn seria inventar número. O estágio de produto calcula, de forma determinística: dado o custo recorrente, a renda desejada e a comissão da loja, quantos pagantes são necessários em cada faixa de preço. Entrega tabela de preço versus pagantes necessários, com comparáveis do research ao lado. Sem número único, no mesmo princípio do estimate atual.
8. **Comissão de loja em tabela estática com fonte e data.** Mesmo padrão de `tax-regimes.md` e `market-benchmarks.md`. O research só atualiza se a tabela estiver desatualizada. Reverte a decisão anterior de "só depois do research", que era excesso de cautela e inconsistente com o padrão já existente.
9. **Quem quer pular etapas** ainda pode chamar cada agente direto.

## Hipóteses descartadas

- Advisor absorvendo o research em um agente só: mistura conversa com coleta de dado e fica difícil de testar.
- Um único agente `reversa-pricing` que entrevista e conduz: quebra o padrão de orquestrador puro dos times core.
- Advisor opcional: o leigo precisa dele, então é obrigatório.
- Produto como cenário dentro do estimate por feature: entradas incompatíveis, ver achado central.
- "Informar ou pesquisar" por campo: dez perguntas viram vinte, cansa o leigo.
- Estimate de produto com previsão de receita: exige chutar demanda, viola o princípio de não inventar número.

## Alertas registrados

- Taxa hora por cidade tem dado escasso e ruidoso, e trabalho remoto reduz o sentido de recorte local. O fallback para país tende a ser a regra. O advisor deve dizer isso ao leigo para não criar expectativa de precisão.
- O desenho cresce de 3 para 6 agentes (pricing, advisor, research, profile, size, estimate) mais o estágio de produto. Vale conferir, na spec, se o estágio de produto é agente próprio ou um modo do estimate que lê entradas diferentes.
- Busca na web é dependente do engine. Compatibilidade declarada dos agentes inclui Codex, Cursor e Gemini CLI; o research precisa de comportamento definido em cada um.

## Decisões pendentes

- **DECISÃO PENDENTE, critérios de viabilidade.** O que torna um modelo de venda viável. Ponto de partida do Claude: tipo de software (app, sistema web, ferramenta interna), cliente pessoa ou empresa, custo recorrente (servidor, API, suporte) e preferência por renda recorrente ou pontual. Falta o dono validar e acrescentar regras (ex.: loja de apps só para mobile ou desktop).
- **DECISÃO PENDENTE, entradas da calculadora de produto.** Quais entradas o leigo precisa fornecer (custo recorrente mensal, renda desejada) e quais vêm do research (comparáveis) ou de tabela (comissão). Quais faixas de preço a tabela de ponto de equilíbrio deve mostrar.
- **DECISÃO PENDENTE, política de web do research.** Quais fontes são aceitas, como tratar divergência entre fontes, quando a faixa é considerada fraca demais para uso, e o que fazer sem busca disponível no engine.
- **DECISÃO PENDENTE, produto como agente ou como modo.** Ver alerta sobre o tamanho do time.

## Próximos passos (condicionados às decisões)

- Se os critérios de viabilidade forem validados, próximo passo: escrever a lista de perguntas do advisor e a regra de ranqueamento dos modelos, ainda em texto.
- Se as entradas da calculadora forem definidas, próximo passo: escrever a fórmula de ponto de equilíbrio em texto e validar com dois exemplos manuais (um app de assinatura numa loja, um sistema web vendido direto).
- Se a política de web for definida, próximo passo: listar as consultas que o research faz e o formato da saída com fonte, data e nível geográfico usado.
- Depois das decisões, próximo passo: especificar os contratos (`advisor.json`, campo de origem no `profile.json`, saída do research, saída da calculadora de produto) com a skill `sdd-spec`, antes de qualquer implementação.
- Retomar o roteiro do vídeo (`ROTEIRO_VIDEO_PRICING.md`) só quando o desenho estiver implementado.

## Restrições ativas respeitadas nesta mesa

- Versionamento só no patch (origem: memória do projeto).
- Sem travessão em texto gerado (origem: CLAUDE.md global).
- Brainstorm salvo em `BRAINSTORMING/` (origem: CLAUDE.md global).
- Agentes de pricing não modificam legado, Discovery nem Forward, e só escrevem em `_reversa_sdd/_pricing/` (origem: SKILL.md atuais).
- Sem aconselhamento financeiro, jurídico ou tributário formal, e nunca número único no estimate (origem: SKILL.md atuais).
- Docs em pt, en e es precisam ser atualizados com qualquer mudança no time (origem: `docs/pricing/`).

## Status

Convergido no desenho geral, aberto em 4 decisões pendentes. Última atualização: 2026-10-18.
