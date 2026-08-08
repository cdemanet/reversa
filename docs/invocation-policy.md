# Política do eixo de invocação

> Regra que governa como cada skill do Reversa é alcançada — pelo humano ou pelo modelo.
> Verificada por `scripts/verify-invocation.py` (gate de CI). Escreva a próxima skill já conforme.

## O eixo

Toda skill é **user-invoked** ou **model-invoked** — não há terceiro estado.

- **Model-invoked** — o modelo pode alcançá-la sozinho, reconhecendo a intenção do usuário em
  linguagem natural. Para isso, a `description` fica **permanentemente carregada no contexto de toda
  requisição**. Custa contexto mesmo quando a skill não é usada.
- **User-invoked** — só é alcançada quando o humano digita `/nome`, ou quando um orquestrador lê o seu
  `SKILL.md`. Não é carregada no contexto do modelo. Marcada com `disable-model-invocation: true`.

## O teste de decisão

> *O modelo teria motivo para alcançar esta skill sozinho, a partir de uma frase em linguagem natural,
> sem o usuário digitar o comando?*

No Reversa a resposta é **sim apenas para os 9 pontos de entrada de fluxo**: os 8 orquestradores
(`role: orchestrator`) mais `reversa-agents-help`. Todos os agentes de fase — Scout, Architect,
Reviewer, os `pricing-*`, os `debugger-*`, os `docs-*`, os especialistas de refactor e os
renderizadores — são alcançados pelo **orquestrador lendo o `SKILL.md`**, nunca pelo modelo adivinhando.
Logo, são user-invoked.

**As 9 model-invoked:** `reversa`, `reversa-new`, `reversa-forward`, `reversa-migrate`,
`reversa-autonomous`, `reversa-refactor`, `reversa-debugger`, `reversa-docs`, `reversa-agents-help`.

## As duas marcas, em lockstep

Uma skill é user-invoked **nos dois harnesses ou em nenhum**:

| Estado | Claude Code (`SKILL.md`) | Codex (`agents/openai.yaml`) |
| --- | --- | --- |
| Model-invoked | ausência da flag | só o bloco `interface:` |
| User-invoked | `disable-model-invocation: true` | `interface:` **+** `policy.allow_implicit_invocation: false` |

O verificador reprova qualquer descasamento entre as duas marcas.

## A regra de alcance

Uma skill user-invoked **não pode ser invocada por outra skill pelo nome** — sem `description`, o
modelo não a vê. Por isso o orquestrador **lê o `SKILL.md`** do sub-agente (pasta irmã, no mesmo
diretório de skills) e executa as instruções no contexto atual, em vez de ativar por nome. Ao escrever
um orquestrador novo, use sempre esse padrão de leitura.

## A regra da `description`

- **User-invoked** — human-facing: um resumo do que a skill faz, mais dicas de uso em prosa
  (*"Use quando \<condição\>"*, *"Ativação: /x (invocado por /y)"*, fase do ciclo). **Sem listas de
  gatilho de modelo** — nada de `Use com "/x", "frase"`, `digitar "..."`, `Ative com /x, ...`,
  `pedir "..."`. Elas não servem a ninguém (o humano lê ruído; o modelo não vê mais a skill).
- **Model-invoked** — model-facing: mantém o fraseado rico de gatilhos, porque é o que dispara a
  auto-invocação. **Não mexa nelas.**

## O custo, medido (31/07/2026, v1.2.57)

A carga permanente de contexto das `description` model-invoked:

| | Skills model-invoked | Chars | Tokens |
| --- | ---: | ---: | ---: |
| Antes (todas) | 65 | 19.948 | ~4.987 |
| Depois (Cenário B) | 9 | 2.336 | ~668 |
| | | | **−4.319 tokens (−86%)** |

É isto que torna o eixo *"decisão de engenharia com custo medido e assumido"* — não convenção tácita.
A economia é de janela de contexto e de precisão de roteamento (o modelo escolhe entre 9 descrições, não
65). Em tokens de fatura, o ganho é parcialmente mitigado por prompt caching — não prometa economia
proporcional na conta.

## O executor

```bash
npm run verify
# ou, separadamente:
python3 scripts/verify-invocation.py            # eixo, lockstep, higiene de description
node   scripts/test-installer-transport.mjs     # marcas atravessam a cópia do installer
```

Roda automaticamente no CI (`.github/workflows/verify-invocation.yml`) a cada mudança em `agents/`.
Sai com código 1 em qualquer violação. **Ao adicionar uma skill, rode `npm run verify` antes de
commitar** — é o que impede o eixo de derivar na próxima skill.
