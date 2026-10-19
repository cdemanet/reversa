# Pricing and Size Agents

O Team **Pricing and Size Agents** responde duas perguntas diferentes. A primeira é quanto cobrar de um cliente para construir ou evoluir uma feature (serviço, por feature). A segunda é quanto cobrar de quem usa o software (produto: licença perpétua, aluguel, assinatura ou loja de apps). Serve para quem nunca precificou software, com caminho guiado e pesquisa na web, e para quem já sabe seus números e quer ir direto ao cálculo.

Marcado por padrão no instalador.

---

## Pipeline

```
/reversa-pricing                 orquestrador (porta de entrada, model-invoked, só roteia)
        │
        ▼
/reversa-pricing-advisor         obrigatório no caminho orquestrado: modelo de venda, grava advisor.json
        │
        ▼
/reversa-pricing-profile         perfil de cobrança; modo pesquisar chama o research para a taxa hora
        │
        ├── trilha PRODUTO ──▶ /reversa-pricing-product    calculadora de ponto de equilíbrio
        │
        └── trilha SERVIÇO ──▶ /reversa-pricing-size ──▶ /reversa-pricing-estimate   (por feature)

/reversa-pricing-research        pesquisa na web (único com internet), chamado por profile e product, ou direto
```

O `advisor` e o `profile` rodam uma vez por projeto e são reutilizados. O `product` roda uma vez por projeto quando o advisor marcou a trilha de produto. O `size` e o `estimate` rodam por feature, depois que a feature foi planejada pelo `/reversa-forward`.

---

## Para quem nunca precificou

Digite `/reversa-pricing`. O orquestrador lê o que já existe em `_pricing/`, diz onde você parou e sugere o próximo agente. Ele nunca escreve nada sozinho.

A ordem é simples:

1. O **advisor** faz seis perguntas sobre o software (tipo, quem encomendou, quem paga, quem hospeda, custo mensal, preferência de renda) e explica quais modelos de venda cabem, com motivo e riscos. Você pode escolher mais de um.
2. O **profile** pergunta se você sabe seus valores de cobrança ou prefere pesquisar. No modo pesquisar ele chama o **research** para achar uma faixa de taxa hora para o seu país, senioridade e região, com fontes e data. Você confirma o valor antes de ele ser gravado.
3. Na trilha de produto, o **product** monta uma escada de preços (pesquisada ou digitada por você) e mostra, para cada preço, quantos clientes pagantes cobrem o custo e quantos atingem a sua meta de renda.
4. Na trilha de serviço, o **size** mede a feature planejada e o **estimate** transforma isso em três cenários lado a lado.

Cada agente faz uma pergunta por vez, em linguagem leiga, e termina sugerindo o próximo passo.

---

## Para quem já sabe

Escolha o modo "sei informar" no profile e digite taxa hora, markup e regime tributário diretamente. Você também pode chamar qualquer agente direto, pulando o orquestrador: `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate`, `/reversa-pricing-product` ou `/reversa-pricing-research` com o tipo de pesquisa como argumento. O orquestrador existe para o iniciante digitar um único comando; ele não é obrigatório.

---

## Agentes

| Agente | Stage | Função |
|--------|-------|--------|
| `reversa-pricing` | orchestrator | Porta de entrada. Detecta o estágio pelos artefatos em `_pricing/` e roteia para o próximo agente (advisor, profile, product, size, estimate ou research). Só roteia, não escreve nada. |
| `reversa-pricing-advisor` | advisor | Entrevista de seis perguntas sobre o software e o jeito de vender. Aplica regras determinísticas de viabilidade e grava `advisor.json` com a lista ordenada de modelos de venda (serviço sob medida, licença perpétua, aluguel, assinatura, loja de apps), com motivo e riscos de cada um. Roda antes do profile. |
| `reversa-pricing-research` | research | Único agente com acesso à internet. Pesquisa taxa hora por senioridade e região, preços de produtos comparáveis e comissões de lojas de apps. Tenta cidade, depois estado, depois país, registra fontes e data e nunca preenche o profile ou o product sozinho. |
| `reversa-pricing-profile` | profile | Entrevista guiada que produz o perfil de cobrança: país, moeda, senioridade, taxa hora, markup, regime tributário, modelo de cobrança, perfil de cliente. Tem modo "sei informar" e modo "pesquisar". Cada campo registra a origem. |
| `reversa-pricing-size` | size | Lê requirements, dúvidas, plan e tasks da feature ativa e produz métricas estruturais determinísticas em `size.json` e `size.md` (T-shirt sizing baseado em tasks com ajuste de risco). |
| `reversa-pricing-estimate` | estimate | Cruza `profile.json` e `size.json` da feature ativa e produz três cenários educativos lado a lado: Esforço, Valor, Faixa de Mercado. Avisa quando valores do profile foram pesquisados ou vieram de padrão. Jamais entrega número único como resposta final. |
| `reversa-pricing-product` | product | Calculadora de ponto de equilíbrio para vender o software como produto. Lê `advisor.json` e `profile.json`, pede custo mensal, renda desejada e investimento a recuperar, monta uma escada de preços e mostra, por modelo e por preço, quantos pagantes cobrem o custo e quantos atingem a meta. |

---

## Trilha de produto: ponto de equilíbrio, não previsão

O product calcula, para cada preço da escada, o líquido por cliente depois da comissão da loja e da reserva de imposto, e divide o custo mensal (mais o investimento diluído no horizonte de recuperação, mais a meta de renda) por esse líquido. O resultado é uma contagem de pagantes ou de licenças, sempre arredondada para cima.

Ele não modela churn, conversão, taxa de gateway de pagamento, descontos, trial, imposto específico de produto nem câmbio. Ele diz o que cada preço exige; não diz quantos clientes você vai conseguir. A escada tem sempre de três a cinco preços, e o agente nunca escolhe um por você.

---

## Pesquisa na web

Só o `reversa-pricing-research` acessa a web. Todos os outros agentes trabalham offline.

- Fontes aceitas: portais de salário, plataformas freelance, estatística oficial, documentação oficial das lojas de apps e páginas de preço de produtos. Fóruns sem número, páginas sem data e fontes em moeda diferente são descartados e listados com o motivo.
- Para taxa hora a busca vai por cidade, depois estado, depois país, e o resultado informa qual nível foi usado. Dado por cidade é escasso; o país costuma ser o nível que funciona.
- A confiança é alta, média ou baixa conforme o quanto as fontes discordam. Menos de duas fontes marca o resultado como fraco.
- O resultado é uma faixa com fontes e data. Nada entra no profile ou no product até você confirmar no agente que chamou.
- Se o engine não tiver ferramenta de busca na web, o research avisa e o agente chamador volta a pedir o valor para você.

---

## Onde os artefatos vão parar

```
_reversa_sdd/_pricing/
├── advisor.json / advisor.md              (uma vez por projeto, /reversa-pricing-advisor)
├── profile.json / profile.md              (uma vez, /reversa-pricing-profile)
├── research/
│   ├── hourly_rate.json / .md             (/reversa-pricing-research, chamado pelo profile em modo pesquisar)
│   ├── comparables.json / .md             (chamado pelo product)
│   └── store_commission.json / .md        (opcional, quando a tabela estática estiver velha)
├── product/
│   └── product.json / product.md          (/reversa-pricing-product)
└── <feature>/
    ├── size.json / size.md                (/reversa-pricing-size)
    └── estimate.json / estimate.md        (/reversa-pricing-estimate)
```

Quando um artefato já existe, o agente mostra um resumo e pergunta antes de recalcular. O arquivo antigo é mantido como cópia `.bak`.

---

## Origem dos valores

Cada campo de cobrança do profile registra a origem: `digitado` (você informou), `pesquisado` (veio do research, com fonte e data) ou `padrao` (sugestão do framework, como o markup de 35% ou o regime tributário padrão do país). O estimate lista cada campo que não foi digitado e avisa que valores pesquisados ou padrão reduzem a confiança, para você revisar taxa hora, markup e regime antes de enviar proposta.

Os Pricing and Size Agents jamais modificam código legado, artefatos do Discovery ou do Forward. Apenas leem esses e escrevem dentro de `_pricing/`.

Estes agentes oferecem referências e cálculos educativos, não aconselhamento financeiro, jurídico ou tributário. Valide os números com seu contador antes de decidir.
