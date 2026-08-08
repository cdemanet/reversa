# Brainstorm: /reversa-add

> Registrado em 2026-07-29, decidido em 2026-07-30. Sem código nesta etapa.

## O problema

Para um ajuste de minuto ("aumenta esse título", "põe um loading aqui"), o pipeline forward inteiro é caro demais. Na prática o usuário pede direto no chat, o código muda, e nenhum artefato registra. A spec fica atrás do código.

## A solução

Um comando novo no time forward: `/reversa-add`. Registra a emenda na spec e implementa, no mesmo passo.

Nome fica `/reversa-add`, não `/add`: a regra de namespace da spec exige `reversa-<verbo>`, e `/add` colide com o `/add-dir` nativo e com comandos do próprio usuário nas outras engines.

## Como funciona

1. Lê `.reversa/active-requirements.json`. Sem feature ativa, aborta e aponta `/reversa-requirements`.
2. Recusa e manda para `/reversa-requirements` se o pedido exigir dependência nova, mudança de schema ou contrato, API nova, ou mexer em auth e pagamento.
3. Escreve a emenda em `## Emendas` no `requirements.md` da feature.
4. Implementa.
5. Acrescenta a ação já fechada `[X]` no `actions.md`, atualiza `legacy-impact.md`, apenda no `progress.jsonl`.
6. Sugere o próximo passo e espera CONTINUAR.

Ordem importa: spec antes do código. O inverso recria o problema que o comando resolve.

Só mexe no que é da feature ativa. Fora disso, `/reversa-requirements`.

## Por que os passos 5 são obrigatórios

O `/reversa-sync` aborta quando falta `legacy-impact.md`, e exibe menu quando acha ação `[ ]` aberta no `actions.md`. Sem esses três arquivos, o que o `/reversa-add` fizer nunca converge para `_reversa_sdd/addenda/` e a extração deriva em silêncio.

## O que precisa mudar no Reversa

- `specs/reversa-forward/01-comandos-forward.md`: catálogo, regra do conjunto fixo de comandos, RFs
- `specs/reversa-forward/03-estrutura-saidas.md`: tabela de dono e atualizador dos artefatos, `requirements.md` e `actions.md` ganham um segundo atualizador
- `agents/reversa-add/SKILL.md`
- `FORWARD_TEAM` em `lib/installer/prompts.js`
- `before-add` e `after-add` em `templates/forward/hooks.yml`
- docs, README e homepages en, pt, es
- `package.json`, 1.2.56 para 1.2.57

## A verificar antes de implementar

De onde o installer lê os comandos forward. A spec cita `templates/commands-forward/`, o repositório tem `templates/forward/` sem diretório de comandos. Usar o `/reversa-sync` como referência, é o membro mais recente do time.

## Dívida de passagem

A spec chama de `/reversa-doubt` o que o installer instala como `reversa-clarify`. Corrigir quando essa spec for aberta.

## Status

Decidido. Pronto para implementar.
