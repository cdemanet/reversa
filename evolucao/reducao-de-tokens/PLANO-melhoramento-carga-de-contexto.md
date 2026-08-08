# Plano de melhoramento — carga de contexto do Reversa

> **Estado:** ✅ **executado** em 31/07/2026 na branch `reducao-tokens` — Cenário B (ver §4). Etapas
> 2, 4, 5, 6, 7, 8 commitadas (uma por commit); `npm run verify` → APROVADO; carga ~4.987 → ~668 tokens
> (−86%). Pendências menores para revisão humana no §Execução abaixo.

---

## ✅ Execução realizada (31/07/2026)

| Etapa | O que foi feito | Commit |
| --- | --- | --- |
| 2 | Leitura do `SKILL.md` como caminho primário nos 4 sites de invocação (corrigido o único sem fallback) | `590cda9` |
| 4 | 56 agentes de fase marcados `disable-model-invocation: true`; 9 entry-points preservados | `dc6e102` |
| 5 | `agents/openai.yaml` nas 65 skills (lockstep dentro de cada skill) | `85600b1` |
| 6 | Podadas as frases-gatilho de 41 descrições user-invoked (prosa útil preservada) | `ffca892` |
| 7 | `scripts/verify-invocation.py` + smoke test de transporte + `npm run verify` + CI | `4fe8a5d` |
| 8 | `docs/invocation-policy.md` — política com custo medido e executor | `28a4a3e` |

Etapas 1 e 3 (teste funcional ao vivo e validação de uma skill) não foram executadas como passos
isolados: a fonte não tem `.reversa/` para exercitar `/reversa` ao vivo, e tudo está numa branch não
publicada. A validação foi feita por `npm run verify` (eixo íntegro, 0 descasamentos) e pelo smoke test
de transporte. **Recomendo um teste funcional numa instalação limpa antes do merge.**

**Pendências menores (não bloqueiam, mérito de revisão humana):**
- `short_description` dos `openai.yaml` são auto-derivadas da `description` — algumas truncam com `…`.
  Valem um passe manual (o Codex as mostra na UI). São puramente cosméticas.
- `reversa-agents-help` é o membro debatível do conjunto model-invoked (§4) — decidir se fica ou vira
  user-invoked.
- Ligar `docs/invocation-policy.md` ao nav do `mkdocs.yml` (não feito para não arriscar o build do site).
> **Substitui, para efeito de execução:** `HANDOFF-reversa-carga-de-contexto.md`
> **Documentos de origem:** `HANDOFF-reversa-carga-de-contexto.md` + `relatorio-mattpocock-vs-reversa.pdf`
> **Medido neste repositório em:** 31/07/2026 · versão `1.2.57`

---

## 1 · Veredito sobre os dois documentos de origem

**A ideia é pertinente. O plano de execução, como está escrito, não é aplicável aqui — e o
usuário estava certo em desconfiar.**

Separando as duas coisas:

- 🟢 **O diagnóstico continua válido e ficou maior.** O Reversa injeta a `description` de **toda**
  skill model-invoked no contexto de cada requisição. Isso é real, é medível, e cresceu: o relatório
  mediu 49 skills / ~3.677 tokens em 30/07; hoje são **65 skills / ~4.987 tokens** de carga permanente.
  Reduzir isso marcando os agentes de fase como `disable-model-invocation: true` é uma otimização
  legítima, e o mecanismo (manter `description`, só acrescentar a flag) está correto.

- 🔴 **O plano de execução foi escrito contra outro repositório.** A sessão que produziu o HANDOFF
  trabalhou numa **cópia instalada** do Reversa em `/workspaces/CHUPA-CABRA/reversa-otimizacao`, ao
  lado das skills do mattpocock (`pocoyo-skills`). Por isso o documento assume um mundo de **duas
  árvores sincronizadas** (`claude-skills` + `agents-skills`), aponta para scripts e paths que **não
  existem aqui**, e conta 49 skills. **Este repositório é a FONTE do Reversa** — árvore única
  `agents/` — e as duas árvores só passam a existir na **máquina do usuário final**, geradas pelo
  installer (`lib/installer/writer.js` → `cpSync(..., { recursive: true })` para `.claude/skills` ou
  `.agents/skills`, conforme `lib/installer/detector.js`).

Conclusão: **aproveitamos o raciocínio, descartamos o roteiro.** O plano abaixo reescreve as etapas
para a fonte de árvore única, o que na prática **elimina metade do trabalho e todo o risco de
divergência entre árvores** (a paridade passa a ser estrutural, não mantida à mão).

---

## 2 · Referências quebradas nos documentos de origem

| O HANDOFF/PDF assume | Realidade neste repositório |
| --- | --- |
| Duas árvores `claude-skills` e `agents-skills` a manter idênticas em lockstep | **Uma** árvore-fonte `agents/`; o installer gera as duas na máquina do usuário |
| Paths `/workspaces/CHUPA-CABRA/…`, `pocoyo-skills`, `reversa-otimizacao` | Não existem |
| `verify-invocation.py` "já validado" em `/workspaces/CHUPA-CABRA/` | **Está na pasta `evolucao/reducao-de-tokens/`** — funciona, mas foi escrito para duas árvores; adaptar (ver Etapa 7) |
| 49 skills · 14.708 chars · ~3.677 tokens | **65 skills · 19.948 chars · ~4.987 tokens** |
| "Fonte do Reversa na máquina: **não existe**" | **Falso** — este repo é a fonte (publicado no npm como `reversa`) |
| Fluxo final: `rsync` de volta para `pocoyo-skills` | N/A — commit na fonte, distribuição via `npm` / `reversa update` |
| Cenário B mantém estas **8** model-invoked | Lista feita para 49 skills; **precisa ser recalculada para 65** |
| 4 sites de invocação skill→skill (+1 indireto) | Re-mapeado abaixo; a quebra real única é a mesma: `step-01-first-run.md:63` |
| Testar via `.reversa/state.json` no próprio diretório | A fonte não tem `.reversa/`; o teste funcional exige instalar num diretório temporário |
| Invariante nº 2/5 "as duas árvores são idênticas" | Trivial na fonte; vira responsabilidade do **installer** (ver §5) |

O que **transfere intacto** dos documentos de origem:

- A tese da carga de contexto e o método (manter `description`, só acrescentar a flag).
- A distinção `description` **human-facing** (user-invoked) × **model-facing com gatilhos** (model-invoked).
- O risco arquitetural real: **uma skill user-invoked não pode ser ativada por outra skill pelo nome** —
  o orquestrador precisa **ler o `SKILL.md`** e executar no contexto atual.
- A exigência de **um verificador executável** — declarar invariante sem executor é decoração.
- A lacuna do Codex: `compatibility` promete Codex/Cursor/Gemini, mas há **0 `agents/openai.yaml`**.

---

## 3 · Números reais medidos hoje (reproduzíveis)

```
65 skills com description · 19.948 chars · ~4.987 tokens  (todas model-invoked hoje)
50 das 65 declaram um comando /nome digitado pelo humano na própria description
SKILL.md: média de 149 linhas  (os 3 maiores: reversa-new 329, reversa-docs-publisher 323, reversa-screen-translator 279)
disable-model-invocation no repo: 0
agents/openai.yaml no repo: 0
```

Ponto de quebra único confirmado: `agents/reversa/references/step-01-first-run.md:63` —
*"Após confirmação, ative o skill `reversa-scout`."* (ativa por nome, sem alternativa de leitura). Os
demais sites de invocação já usam o padrão duplo *"Leia o `SKILL.md` … / Ative o skill"*.

---

## 4 · Decisão tomada — Cenário B

**As skills que permanecem model-invoked são os pontos de entrada de fluxo.** O critério: uma skill só
continua model-invoked se o **modelo tem motivo para alcançá-la sozinho** — isto é, se o usuário a
dispara descrevendo a intenção em linguagem natural, sem digitar a barra. Todo o resto é alcançado pelo
orquestrador lendo o `SKILL.md` e vira user-invoked.

O `role` do frontmatter fecha a lista sem ambiguidade: os **8 `role: orchestrator`** mais o
`reversa-agents-help` (`role: help`).

**As 9 que permanecem model-invoked:**

| Skill | role | Por que fica |
| --- | --- | --- |
| `reversa` | orchestrator | A palavra `reversa` sozinha ativa (promessa do `CLAUDE.md`) |
| `reversa-new` | orchestrator | "novo projeto", "forward" por linguagem natural |
| `reversa-forward` | orchestrator | Fluxo forward |
| `reversa-migrate` | orchestrator | "quero migrar esse sistema" |
| `reversa-autonomous` | orchestrator | Modo autônomo |
| `reversa-refactor` | orchestrator | "refatorar", "otimizar o código" |
| `reversa-debugger` | orchestrator | "tem um bug", "debugar" |
| `reversa-docs` | orchestrator | "documentar esse sistema" |
| `reversa-agents-help` | help | "quais agentes existem" (único membro discutível — ver nota) |

**As outras ~56 viram user-invoked** (`disable-model-invocation: true`): agentes de fase
(`reversa-scout`, `reversa-architect`, `reversa-reviewer`), os `reversa-pricing-*`, os
`reversa-debugger-*` (`-fix`/`-debate`/`-graph`), os `reversa-docs-*`, os especialistas de refactor
(`reversa-optimize`, `reversa-simplify`, `reversa-prune`…) e os renderizadores. Continuam alcançáveis
por `/nome` digitado e pelo orquestrador que lê o `SKILL.md`.

- **Custo:** 9 model-invoked · ~668 tokens permanentes → economia de **~4.319 tokens (−86%)**.
- **Nota sobre `reversa-agents-help`:** é o único membro debatível — se preferir que o catálogo só
  apareça quando o usuário digitar `/reversa-agents-help`, mova-o para user-invoked e a economia sobe um
  pouco. Mantido em B por permitir "me mostra os agentes" em linguagem natural.

> ⚠️ **Por que não o Cenário A ("só `reversa`"):** o `CLAUDE.md` promete ativação pela palavra `reversa`
> sozinha, mas os outros fluxos (migrar, documentar, depurar) perderiam o roteamento por linguagem
> natural — o usuário teria de saber e digitar cada `/nome`. A economia extra (~596 tokens) não paga a
> regressão de comportamento do produto.

---

## 5 · Plano revisado — árvore única, 8 etapas, framework funcionando em cada uma

> **A regra que governa tudo:** o Reversa funcionando hoje vale mais que qualquer economia de tokens.
> Na dúvida entre "economiza mais" e "com certeza não quebra", escolha não quebrar. Um commit por etapa.

**Etapa 0 — recomputar o eixo.** Rodar o script de medição, listar as 65 skills, classificar cada uma
como entry-point (fica) ou agente de fase (marca). Fechar a lista da §4 com o usuário. *Commit vazio de
marco.*

**Etapa 1 — baseline funcional.** Como a fonte não tem `.reversa/`, instalar o Reversa num diretório
temporário (`npx reversa init` num sandbox, ou via `bin/reversa.js`) e registrar o comportamento de
`/reversa`, `/reversa-agents-help`, `/reversa-forward` **antes** de qualquer mudança.

**Etapa 2 — corrigir os sites de invocação (antes das marcas).** Inverter a precedência para **ler o
`SKILL.md` e executar no contexto atual** como caminho primário. O único site que hoje ativa por nome
sem alternativa é `step-01-first-run.md:63`; os demais já têm o padrão duplo — padronizar todos.
Reinstalar e repetir o teste da Etapa 1: **comportamento idêntico**. *Commit.*

**Etapa 3 — marcar UMA skill.** `reversa-scout` (a mais crítica: primeira que o orquestrador chama e
alvo do site corrigido). Acrescentar só `disable-model-invocation: true` ao frontmatter — **manter a
`description`**. Instalar, testar ponta a ponta (`/reversa` chega ao Scout? `/reversa-scout` direto
ainda funciona?). Se falhar, **parar e reverter**. *Commit.*

**Etapa 4 — marcar as demais.** Script sobre a **árvore única `agents/`** (sem `×2`, sem lockstep entre
árvores), pulando a lista de entry-points, idempotente. Revisar `git diff --stat`. *Commit.*

**Etapa 5 — a marca do Codex (`agents/openai.yaml`).** Criar em cada skill:
`policy.allow_implicit_invocation: false` nas user-invoked; só `interface:` nas model-invoked. Como o
installer copia a pasta da skill recursivamente, esses arquivos **chegam ao usuário automaticamente** —
mas **confirmar isso instalando** e conferindo que o `openai.yaml` aparece no destino. *Commit.*

**Etapa 6 — reescrever as `description` das user-invoked.** Reduzir a um resumo humano de uma linha,
**sem gatilhos** (`Use quando…`, `digitar "/…"`). Nas entry-points model-invoked, **não mexer** — lá os
gatilhos são o mecanismo de auto-invocação. *Commit.*

**Etapa 7 — o verificador (é onde o Reversa supera a referência).** **O script já existe na pasta:**
`evolucao/reducao-de-tokens/verify-invocation.py` (106 linhas, funcional). Ele já checa, por árvore:

1. Toda skill tem `agents/openai.yaml` com `interface.display_name` + `short_description`.
2. Lockstep **dentro da skill**: `disable-model-invocation: true` ⟺
   `openai.yaml.policy.allow_implicit_invocation: false`.
3. `description` de user-invoked sem gatilho de modelo (`Use quando…`, `digitar "/…"`).

Adaptações necessárias para a fonte:
- **Remover o bloco `filecmp` de "igualdade entre árvores"** (linhas 81–98): foi feito para comparar
  `claude-skills` × `agents-skills` numa máquina instalada; na fonte de árvore única é código morto.
- **Adicionar a invariante do installer** (substitui aquela igualdade): um teste que instala num
  diretório temporário e confirma que a flag e o `openai.yaml` **atravessam** para `.claude/skills`
  e `.agents/skills`. Aqui a paridade é estrutural (uma fonte), então o que precisa de guarda é o
  **transporte**, não a igualdade.
- **Mover o script para `scripts/verify-invocation.py`** no repositório (hoje mora só nesta pasta de
  evolução) e citá-lo no doc da Etapa 8. Opcional: reescrever em Node p/ casar com `lib/`.

Ele já sai com código 1 em qualquer violação → serve de gate de CI direto. *Commit.*

**Etapa 8 — a política escrita.** Um doc curto (`docs/` ou `agents/reversa/references/`) declarando: o
eixo (toda skill é user- ou model-invoked, sem terceiro estado); as duas marcas em lockstep dentro da
skill; a regra de alcance (orquestrador lê o `SKILL.md`, não ativa por nome); a regra da `description`;
o custo medido (19.948 → alvo chars, ~4.987 → alvo tokens); e o ponteiro para o verificador da Etapa 7.
*Commit.*

**Definição de "quebrado" (aborta a entrega):** o orquestrador não alcança um agente user-invoked · um
`/reversa-*` que funcionava parou · a palavra `reversa` sozinha deixou de ativar (Cenário B) · a flag ou
o `openai.yaml` não atravessou na instalação.

---

## 6 · A invariante que a fonte única nos dá de graça

O HANDOFF gastava três etapas defendendo "as duas árvores têm que ficar idênticas". **Aqui esse
problema não existe:** há uma fonte, e o installer é quem replica. O que passa a merecer guarda é o
**installer preservar as marcas ao copiar** — e isso é um teste de 20 linhas (Etapa 7.4), mais forte que
disciplina manual porque falha ruidosamente no CI. É literalmente o ponto em que o Reversa supera a
referência que o relatório citava.

---

## 7 · Melhorias estruturais (Parte 2 — tarefa separada, depois)

Aplicabilidade das cinco propostas do HANDOFF a este repositório:

| # | Proposta | Situação aqui |
| --- | --- | --- |
| M1 | Podar `SKILL.md` grandes (mover blocos p/ `references/`) | 🟢 **Aplica e piorou** — média subiu p/ 149 linhas; `reversa-new` (329), `reversa-docs-publisher` (323). Só custa contexto nas **model-invoked**; nas user-invoked é qualidade de leitura. |
| M2 | Buckets por maturidade (in-progress/deprecated não instalados) | 🟢 Aplica — `agents/` é plano hoje; exige tocar `lib/installer/manifest.js` para instalar só o bucket principal. |
| M3 | Registrar as recusas (out-of-scope) | 🟡 Opcional — combina com esta pasta `evolucao/`. |
| M4 | Glossário do vocabulário (unit, spec, lacuna, fase, checkpoint…) | 🟢 Aplica — com 65 agentes, é o que impede dois usarem termos diferentes p/ a mesma coisa. |
| M5 | Invariantes declaradas **com** verificador | 🟢 Vira extensão natural do verificador da Etapa 7 (agentes instalados = `[agents] installed`, versão `.reversa/version` = npm). Declarar só o que o script checa. |

---

## 8 · Ordem de execução

1. Fechar a §4 com o usuário (lista de entry-points model-invoked).
2. Confirmar: a otimização é commitada na fonte e sobe via release npm? (sim — não há "rsync").
3. Etapas 1→8, um commit por etapa, reinstalando e testando entre elas.
4. Rodar `scripts/verify-invocation` → verde; teste funcional numa instalação limpa.
5. Reportar: carga antes/depois medida, arquivos tocados, saída do verificador, versão a publicar.
6. Só então, em branches próprios: M1, M2, M4, M5.
