# HANDOFF — Otimização de contexto do Reversa

> **Para:** outra sessão do Claude Code
> **Natureza:** **otimização**, não refatoração. O comportamento do Reversa deve ficar **idêntico**.
> **Objetivo:** economizar tokens do usuário reduzindo a carga permanente de contexto das 49 skills
> **Origem:** relatório `mattpocock-skills × Reversa`, 30/07/2026
> **Esforço:** 1–2 h, quase todo scriptável
> **Autor do Reversa:** `sandeco` — é o próprio usuário desta sessão

---

## O que o usuário pediu

Duas **características** do `mattpocock-skills`, nomeadas por ele:

| Característica | O que significa |
|---|---|
| **Economia de contexto** | *"O eixo de invocação é tratado como decisão de engenharia, com custo medido e assumido"* |
| **Portabilidade real entre harnesses** | *"41 de 41 skills com marca dupla (Claude + Codex), 0 descasamentos"* |

⚠️ **Repare no que faz delas características, e não conquistas pontuais:** *"decisão de engenharia com
custo medido"* e *"0 descasamentos"* são propriedades que se **mantêm** — não estados que se alcança uma
vez. Marcar as 49 skills hoje entrega o estado; sem política escrita e sem verificador, o Reversa volta a
derivar na próxima skill adicionada.

Por isso a execução tem 8 etapas, não 5: as **etapas 1–5** produzem o estado, as **6–8** o tornam
permanente. E há um ponto em que o Reversa pode **superar** a referência — ver Etapa 7.

---

## ⚠️ Regra que governa esta tarefa

**O Reversa funcionando hoje vale mais do que qualquer economia de tokens.**

Isto é uma otimização de custo, não uma melhoria de funcionalidade. Se em qualquer ponto houver dúvida
entre "economiza mais" e "com certeza não quebra", **escolha não quebrar**. Uma economia de 85% que
introduza um bug intermitente no orquestrador é um prejuízo, não um ganho.

Por isso a §4 executa em **8 etapas, cada uma com commit próprio e o framework funcionando ao final**.
Não pule etapas nem agrupe commits.

---

## TL;DR — o que se ganha

O Reversa injeta **~3.677 tokens no contexto de toda requisição**, antes de qualquer trabalho começar,
porque as 49 skills são model-invoked e cada uma mantém sua `description` permanentemente carregada.

| | Hoje | Depois (Cenário B) |
|---|---:|---:|
| Skills que ocupam contexto | 49 | 8 |
| Caracteres injetados | 14.708 | 2.336 |
| Tokens permanentes | **~3.677** | **~584** |
| | | **−3.093 tokens (−85%)** |

**O que essa economia significa, honestamente:**

- 🟢 **Espaço de janela de contexto** — 3.093 tokens devolvidos ao trabalho real. Este é o ganho mais
  durável e não depende de cache. Numa análise longa, é espaço que deixa de ser desperdiçado.
- 🟢 **Qualidade de roteamento** — hoje o modelo escolhe entre 49 descrições concorrentes, muitas quase
  idênticas entre si (13 skills `specialist` de manutenção com fraseado parecido). Com 8, a escolha fica
  mais precisa. Este ganho é qualitativo e provavelmente maior que o de custo.
- 🟡 **Custo em tokens** — é real, mas parcialmente mitigado por prompt caching: depois da primeira
  requisição, boa parte vira leitura de cache, mais barata que input novo. **Não prometa ao usuário uma
  economia proporcional na fatura.** O ganho garantido é o de janela e o de precisão.

---

## §0 · LEIA ANTES DE TOCAR EM QUALQUER ARQUIVO

### ⛔ Armadilha 1 — `git branch` NÃO protege este trabalho

O usuário pediu um branch para esta remodelação. **Fazer isso do jeito óbvio não funciona**, e é
importante entender por quê antes de tentar:

```
pocoyo-skills/  →  é um repositório git
                   .claude/skills/  →  0 arquivos rastreados  (untracked)
                   .agents/skills/  →  0 arquivos rastreados  (untracked)
```

**Arquivos untracked não pertencem a branch nenhum.** Eles atravessam `git checkout` intactos. Criar um
branch em `pocoyo-skills`, editar as skills e depois voltar para `main` **não desfaz nada** — as
alterações continuam lá, e você fica sem rollback justamente na tarefa em que o rollback é o principal
mecanismo de segurança.

Pior: o `origin` deste repositório é **`https://github.com/mattpocock/skills.git`** — repositório de
outra pessoa. Ele não é o lugar do código do Reversa.

👉 **A solução está na §1.** Não improvise um branch aqui.

### ⛔ Armadilha 2 — Existem DUAS cópias de tudo, e não são links

```
pocoyo-skills/.claude/skills/   ← 49 skills, 108 arquivos
pocoyo-skills/.agents/skills/   ← 49 skills, 108 arquivos
```

Cópias **independentes** (inodes diferentes), hoje byte a byte idênticas (verificado com `diff -rq`).

**Toda alteração vai nas duas.** Se você mudar só uma, o Reversa passa a se comportar diferente conforme
a engine que o carregou — um bug quase irrastreável depois. Confira ao final:

```bash
diff -rq pocoyo-skills/.claude/skills pocoyo-skills/.agents/skills   # precisa sair VAZIO
```

### ⛔ Armadilha 3 — Não confunda o que é do Reversa com o que é do legado

`pocoyo-skills/` é um **repositório alheio** (`mattpocock/skills`) que foi alvo de engenharia reversa. O
Reversa está apenas instalado dentro dele.

| Caminho | De quem é | Pode mexer? |
|---|---|---|
| `.claude/skills/reversa*` | Instalação do Reversa, untracked | ✅ é o alvo |
| `.agents/skills/reversa*` | Instalação do Reversa, untracked | ✅ é o alvo |
| `.agents/adr/`, `.agents/invocation.md`, `.agents/writing-docs.md` | **Do legado**, rastreados | ⛔ **NÃO** |
| `skills/`, `docs/`, `CLAUDE.md`, `README.md`, `package.json` | **Do legado**, rastreados | ⛔ **NÃO** |
| `_reversa_sdd/`, `.reversa/` | Artefatos da extração, concluída | ⛔ fora do escopo |

⚠️ `.agents/` tem conteúdo dos **dois**: `.agents/skills/` é do Reversa; `.agents/adr/` e
`.agents/invocation.md` são do legado e estão versionados.

### ⛔ Armadilha 4 — `git status` mente neste repositório

167 arquivos aparecem modificados desde 26/07, **antes** de qualquer trabalho. É conversão CRLF do mount
Windows. Um `git diff` mostra `-node_modules` / `+node_modules` — texto idêntico, só o `\r`.

- **Não use `git status`/`git diff` de `pocoyo-skills`** para conferir seu trabalho.
- **Os arquivos têm CRLF.** `sed -n '/^---$/,/^---$/p'` **não casa**, porque a linha é `---\r`. Todo
  script precisa normalizar (`.replace("\r\n","\n")`) e **restaurar o CRLF ao gravar**. O script da §4.3
  já faz isso.

### ⛔ Armadilha 5 — `npx reversa update` desfaz tudo

Versão instalada: `1.2.56`, do pacote npm `reversa`. **Não existe repositório-fonte do Reversa nesta
máquina** — procurei.

Como o usuário é o autor do Reversa, a correção provavelmente precisa subir para o fonte. O repositório
da §1 serve exatamente como o patch a ser aplicado lá.

👉 **Pergunte a ele:** essa otimização deve ir para o repositório-fonte do Reversa? Se sim, peça o
caminho. Não rode `npx reversa update` durante a tarefa.

---

## §1 · Estratégia de git — faça um repositório dedicado

Como a Armadilha 1 mostra, branch em `pocoyo-skills` não dá rollback. A solução dá **rollback real,
diff real e um patch aproveitável no fonte**:

```bash
cd /workspaces/CHUPA-CABRA
mkdir -p reversa-otimizacao && cd reversa-otimizacao

# a instalação vira um repositório de verdade
cp -r ../pocoyo-skills/.claude/skills claude-skills
cp -r ../pocoyo-skills/.agents/skills agents-skills

git init
git add -A
git commit -m "baseline: Reversa 1.2.56 como instalado, sem alterações"
git tag baseline

git switch -c otimizacao/carga-de-contexto
```

A partir daqui você tem o que o usuário pediu: **um branch onde a remodelação acontece**, com `baseline`
intocado para comparar e voltar.

**Ao final**, depois de todas as verificações da §6 passarem, sincronize de volta:

```bash
cd /workspaces/CHUPA-CABRA/reversa-otimizacao
rsync -a --delete claude-skills/ ../pocoyo-skills/.claude/skills/
rsync -a --delete agents-skills/ ../pocoyo-skills/.agents/skills/
```

**Rollback a qualquer momento**, mesmo depois de sincronizar:

```bash
cd /workspaces/CHUPA-CABRA/reversa-otimizacao
git checkout baseline -- .
rsync -a --delete claude-skills/ ../pocoyo-skills/.claude/skills/
rsync -a --delete agents-skills/ ../pocoyo-skills/.agents/skills/
```

> ℹ️ A identidade do git já está configurada (`sandeco` / `physialtda@gmail.com`), não precisa pedir.

---

## §2 · O problema

`description` existe para o **modelo** descobrir a skill sozinho. Uma skill que o humano invoca digitando
`/nome` não precisa ser descoberta — já foi escolhida. É para isso que existe
`disable-model-invocation: true`: a skill continua alcançável pelo humano e some do contexto do modelo.

O mattpocock aplica em **24 das 41** skills. O Reversa, em **0 de 49**.

### ⚠️ Correção a um erro do relatório de origem

O PDF, seção 7, afirma que *"a maioria dos agentes reversa-* nunca precisa ser descoberta por ninguém…
são chamados pelo orquestrador"* e propõe marcar "os outros ~43".

**Está errado.** A medição mostra que **34 das 49 declaram um comando `/nome` que o usuário digita** na
própria `description`. Só 15 são exclusivamente do orquestrador.

Mas a conclusão prática fica **mais forte**:

- As **34 que o usuário digita** são o caso canônico de user-invoked — é literalmente para isso que a
  marca existe.
- As **15 do orquestrador** também não precisam de `description`: quem as alcança é outra skill lendo o
  arquivo, não o modelo escolhendo (ver §4.2).

Use os números deste documento, não os do PDF.

---

## §3 · A decisão

| | Skills model-invoked | Chars | Tokens | Economia |
|---|---:|---:|---:|---:|
| Hoje | 49 | 14.708 | ~3.677 | — |
| **Cenário A** — só `reversa` | 1 | 291 | ~72 | −99% |
| **Cenário B** — 8 orquestradores ✅ | 8 | 2.336 | ~584 | **−85%** |

**Cenário B mantém model-invoked:** `reversa`, `reversa-new`, `reversa-forward`, `reversa-migrate`,
`reversa-autonomous`, `reversa-agents-help`, `reversa-debugger`, `reversa-refactor`.

**Recomendo B, e a razão é a regra do topo deste documento.** O `CLAUDE.md` declara que o Reversa ativa
*"quando o usuário digitar `/reversa` **ou a palavra `reversa` sozinha em uma mensagem**"*. Reconhecer
linguagem natural exige que o modelo veja a skill. O Cenário A economiza mais 512 tokens e **muda o
comportamento do produto** — o usuário perde o roteamento por linguagem natural para os fluxos. Isso
é regressão disfarçada de otimização.

👉 **Confirme A ou B com o usuário antes de executar.**

---

## §4 · Execução — 8 etapas, framework funcionando em cada uma

> **Etapas 1–5** produzem o *estado* certo. **Etapas 6–8** transformam esse estado em **característica
> permanente** — sem elas o Reversa volta a derivar na próxima skill que alguém adicionar.

### 4.1 · Etapa 1 — baseline e teste funcional ANTES

Faça o repositório da §1. Depois, **antes de mudar qualquer coisa**, estabeleça que o framework funciona
hoje e registre como:

- Numa sessão limpa, digite `/reversa` → precisa carregar e ler `.reversa/state.json`
- Digite `/reversa-agents-help` → o catálogo precisa aparecer
- Anote o que aconteceu

Sem esse "antes", você não tem como saber se um problema no "depois" foi você quem causou.

⚠️ `.reversa/state.json` está com `phase: concluido` — a extração foi encerrada. Para testar o caminho do
Scout sem sujar esse estado, faça backup de `.reversa/` ou aponte o Reversa para outro diretório.

```bash
git commit --allow-empty -m "etapa 1: baseline validado, framework funcionando"
```

### 4.2 · Etapa 2 — corrigir os sites de invocação (ANTES das marcas)

**Esta é a etapa que pode quebrar o framework, e por isso vem primeiro e sozinha.**

Uma skill user-invoked **não pode ser invocada por outra skill** — sem `description`, nada além do humano
a alcança. Isso colide com o modo de operar do orquestrador.

🟢 **A boa notícia:** o caminho alternativo **já existe** em 3 dos 4 sites — ler o `SKILL.md` e executar
no contexto atual, que funciona independentemente de qualquer marca. A correção é **inverter a
precedência**: o que hoje é fallback vira o caminho primário.

**Os 4 sites, mapeados por grep:**

| # | Arquivo | Linha | Fallback de leitura? |
|---|---|---|---|
| 1 | `reversa/SKILL.md` | 26 | ✅ sim |
| 2 | `reversa-migrate/SKILL.md` | 102 | ✅ sim |
| 3 | `reversa-new/SKILL.md` | 195 | ✅ sim |
| 4 | `reversa/references/step-01-first-run.md` | 63 | 🔴 **NÃO** |
| 5 | `reversa-autonomous/SKILL.md` | 98 | 🟡 indireto — *"exatamente como o `reversa` faz"* |

🔴 **O site 4 é o que quebra.** Texto atual: *"Após confirmação, ative o skill `reversa-scout`."* — manda
ativar por nome, sem alternativa, e o `reversa-scout` é justamente uma das que ficarão user-invoked.

Redação sugerida para o site 1 (aplique o mesmo padrão nos outros):

> `2. Leia `.agents/skills/reversa-[agente]/SKILL.md` na íntegra e execute as instruções no contexto atual. (Se a sua engine suportar ativação direta por nome e o agente estiver acessível, ativá-lo diretamente é equivalente.)`

Para o site 4:

> `Após confirmação, leia `.agents/skills/reversa-scout/SKILL.md` na íntegra e execute no contexto atual.`

**Ao final desta etapa, o framework precisa estar funcionando exatamente como antes** — nenhuma marca foi
adicionada ainda, só a ordem de precedência mudou. Repita o teste da Etapa 1.

```bash
git commit -am "etapa 2: leitura direta do SKILL.md como caminho primário nos 4 sites de invocação"
```

### 4.3 · Etapa 3 — marcar UMA skill e validar de ponta a ponta

**Não marque as 41 de uma vez.** Marque **uma** e prove que a abordagem funciona.

Escolha `reversa-scout`: é a mais crítica das user-invoked (é a primeira que o orquestrador chama, e é
o alvo do site 4). Se funcionar com ela, funciona com todas.

Adicione **uma linha** ao frontmatter, nas duas árvores:

```yaml
---
name: reversa-scout
description: Mapeia a superfície do projeto legado — ...
disable-model-invocation: true          # ← só isto
license: MIT
...
---
```

✅ **MANTENHA a `description`.** Não remova. Verifiquei as 24 user-invoked do mattpocock: **todas as 24
mantêm a `description`** e só acrescentam a flag. A `description` continua servindo à listagem de
comandos que o humano vê; é a **flag** que tira a skill do contexto do modelo.

**Teste agora, numa sessão nova:**
- `/reversa` consegue chegar ao Scout e executá-lo? (é o site 4 sendo exercitado)
- `/reversa-scout` digitado direto ainda funciona?

**Se qualquer um falhar, PARE.** Volte com `git checkout baseline -- .` e reporte ao usuário. Não siga
para a Etapa 4 com dúvida.

```bash
git commit -am "etapa 3: reversa-scout como user-invoked, validado ponta a ponta"
```

### 4.4 · Etapa 4 — marcar as 40 restantes

Script validado em sandbox: **82 arquivos alterados** (41 skills × 2 árvores), inserção no lugar certo,
skills de controle intactas, idempotente.

```python
#!/usr/bin/env python3
import re, pathlib

BASE = pathlib.Path("/workspaces/CHUPA-CABRA/reversa-otimizacao")
ARVORES = [BASE/"claude-skills", BASE/"agents-skills"]

# Cenário B — permanecem model-invoked
MANTER = {
    "reversa", "reversa-new", "reversa-forward", "reversa-migrate",
    "reversa-autonomous", "reversa-agents-help", "reversa-debugger", "reversa-refactor",
}

alterados = 0
for arvore in ARVORES:
    for p in sorted(arvore.glob("*/SKILL.md")):
        if p.parent.name in MANTER:
            continue
        bruto = p.read_text(encoding="utf-8")
        crlf = "\r\n" in bruto
        t = bruto.replace("\r\n", "\n")
        if re.search(r"^disable-model-invocation:", t, re.M):
            continue                                   # idempotente
        m = re.match(r"^---\n(.*?)\n---\n", t, re.S)
        if not m:
            print(f"  !! sem frontmatter: {p}"); continue
        fm = m.group(1)
        novo_fm, n = re.subn(
            r"(^description:\s*(?:.+?)(?=\n[a-zA-Z_-]+:|\Z))",
            r"\1\ndisable-model-invocation: true",
            fm, count=1, flags=re.S | re.M)
        if n != 1:
            print(f"  !! description não localizada: {p}"); continue
        t = t[:m.start(1)] + novo_fm + t[m.end(1):]
        if crlf:
            t = t.replace("\n", "\r\n")
        p.write_text(t, encoding="utf-8")
        alterados += 1

print(f"{alterados} arquivos alterados (esperado: 82)")
```

⚠️ **Se o número não for 82, pare e investigue.** (80 se a Etapa 3 já marcou o Scout — confira qual é o
seu caso antes de concluir que houve erro.)

```bash
git diff --stat            # revise antes de commitar
git commit -am "etapa 4: 41 skills como user-invoked (cenário B)"
```

### 4.5 · Etapa 5 — a marca do Codex

Toda skill do Reversa declara `compatibility: Claude Code, Codex, Cursor, Gemini CLI...`, mas existem
**0 arquivos `agents/openai.yaml` em 49 skills**. A política de invocação não atravessa para o Codex.

Isso **ganha urgência com a Etapa 4**: sem o `openai.yaml`, a economia de contexto vale só no Claude
Code — no Codex as 49 continuam implicitamente invocáveis.

O mattpocock resolve com um eixo conceitual e **duas marcas físicas em lockstep**: 41 de 41 skills
marcadas nos dois formatos, **zero descasamentos**.

| Estado | Claude Code (`SKILL.md`) | Codex (`agents/openai.yaml`) |
|---|---|---|
| Model-invoked | ausência da flag | só o bloco `interface:` |
| User-invoked | `disable-model-invocation: true` | `interface:` **+** `policy.allow_implicit_invocation: false` |

Crie `<skill>/agents/openai.yaml` nas **duas** árvores.

**Para as 41 user-invoked:**
```yaml
interface:
  display_name: "Reversa Scout"
  short_description: "Mapeia estrutura, stack e entry points do projeto"
policy:
  allow_implicit_invocation: false
```

**Para as 8 model-invoked:**
```yaml
interface:
  display_name: "Reversa"
  short_description: "Orquestra a análise de um sistema legado"
```

`display_name` em Title Case. `short_description` curta — nos exemplos do mattpocock, 25 a 45 caracteres.
Pode derivar da primeira oração da `description`, mas **revise à mão**: as do Reversa começam com frases
longas que não cabem bem aqui.

```bash
git commit -am "etapa 5: agents/openai.yaml nas 49 skills, marcas em lockstep"
```

---

### 4.6 · Etapa 6 — reescrever as `description` das user-invoked

⚠️ **Isto não é cosmético e não é opcional.** É metade de uma das duas características pedidas.

A política do mattpocock (`.agents/invocation.md`) define que o **conteúdo** da `description` muda
conforme o lado do eixo:

> - **User-invoked** — a `description` é **human-facing**: um resumo de uma linha lido por uma pessoa
>   navegando os slash-commands. **Strip trigger lists** (*"Use when the user says…"*).
> - **Model-invoked** — a `description` é **model-facing** e mantém o fraseado rico de gatilhos
>   (*"Use when the user wants…, mentions…, asks for…"*) para que a auto-invocação dispare.

As `description` do Reversa têm média de **300 chars** porque estão cheias de gatilhos de modelo:
*"Use quando o usuário digitar /X, 'fazer Y' ou 'iniciar Z'"*. Numa skill user-invoked esses gatilhos
não servem para nada — ninguém os lê, o modelo não vê mais a skill, e o humano lê ruído.

Referência das user-invoked do mattpocock: ~50 chars
(`"A relentless interview to sharpen a plan or design."`).

**Regra:** nas 41 user-invoked, reduza a `description` a um resumo humano de uma linha, sem gatilhos.
Nas 8 model-invoked, **não mexa** — lá os gatilhos são o mecanismo.

O verificador da Etapa 7 reprova `description` de user-invoked que ainda contenha `Use quando`,
`Use when` ou `digitar "/`.

```bash
git commit -am "etapa 6: description das user-invoked reescrita como resumo humano"
```

### 4.7 · Etapa 7 — o verificador (é aqui que o Reversa supera o mattpocock)

**Esta etapa é o que transforma as duas mudanças em características permanentes.**

Sem ela, o Reversa fica com o *estado* certo hoje e volta a derivar na próxima skill que alguém
adicionar. Com ela, o eixo de invocação vira invariante executável.

🔴 **O mattpocock não tem isso, e paga o preço.** Ele declara 12 invariantes estruturais e **não
verifica nenhuma** — o único CI é o de release. Duas estão quebradas neste momento, e ambas são
exatamente do tipo que uma verificação de trinta linhas pegaria. **Copie a declaração, não a ausência
de executor.**

Prova de que o verificador faz trabalho real: rodado contra as 41 skills do mattpocock, ele confirma
**0 descasamentos** — e ainda assim encontra **2 desvios** de higiene de `description` que a política
deles prescreve e ninguém aplicou (`personal/edit-article`, `deprecated/ubiquitous-language`, ambas em
buckets não promovidos).

**O script já existe e está validado:** `/workspaces/CHUPA-CABRA/verify-invocation.py`

Ele checa cinco coisas:

| # | Checagem |
|---|---|
| 1 | Toda skill tem `agents/openai.yaml` |
| 2 | `openai.yaml` tem `interface.display_name` e `interface.short_description` |
| 3 | **Lockstep:** `disable-model-invocation: true` ⟺ `allow_implicit_invocation: false` — user-invoked nas duas marcas ou em nenhuma |
| 4 | `description` de user-invoked não contém gatilho de modelo |
| 5 | As duas árvores (`.claude/skills`, `.agents/skills`) são idênticas |

Sai com código **1** se houver qualquer violação, então serve como gate.

```bash
# estado atual (antes do trabalho): 98 violações, todas por openai.yaml ausente
python3 /workspaces/CHUPA-CABRA/verify-invocation.py claude-skills agents-skills

# alvo ao final: RESULTADO ✓ APROVADO
```

**Copie o verificador para dentro do Reversa** — ele precisa viajar junto com o framework, não ficar
solto nesta máquina. Sugestão: `scripts/verify-invocation.py` no repositório-fonte, citado no
documento da Etapa 8.

```bash
git commit -am "etapa 7: verificador do eixo de invocação, com gate de lockstep"
```

### 4.8 · Etapa 8 — a política escrita

A última peça da característica: um documento que declara a regra, para que a próxima skill nasça
certa em vez de ser corrigida depois.

O modelo a seguir é `pocoyo-skills/.agents/invocation.md` — **leia-o antes de escrever**. Ele é curto e
resolve exatamente este problema. Adapte para o Reversa cobrindo:

- **O eixo** — toda skill é user-invoked ou model-invoked, sem terceiro estado.
- **As duas marcas** — `disable-model-invocation: true` (Claude Code) **e**
  `policy.allow_implicit_invocation: false` (Codex). *"Uma skill é user-invoked nos dois harnesses ou
  em nenhum."*
- **O teste de decisão** — *o modelo teria motivo para alcançar esta skill sozinho?* No Reversa a
  resposta é sim só para os 8 orquestradores de fluxo; os agentes de fase são alcançados pelo
  orquestrador lendo o `SKILL.md`.
- **A regra da `description`** — human-facing e curta nas user-invoked; model-facing e com gatilhos nas
  model-invoked.
- **A regra de alcance** — uma skill user-invoked não pode ser invocada por outra skill; por isso o
  orquestrador **lê o `SKILL.md`** em vez de ativar por nome (Etapa 2).
- **O custo, medido** — registre os números: 14.708 → 2.336 chars, ~3.677 → ~584 tokens. É isto que
  torna o eixo *"decisão de engenharia com custo medido e assumido"* em vez de convenção tácita.
- **O executor** — aponte para `verify-invocation.py` e diga quando rodá-lo.

```bash
git commit -am "etapa 8: política do eixo de invocação, com custo medido e executor"
```

---

## §6 · Verificação, definição de "quebrado" e rollback

### 6.1 · O verificador — a checagem principal

```bash
cd /workspaces/CHUPA-CABRA/reversa-otimizacao
python3 /workspaces/CHUPA-CABRA/verify-invocation.py claude-skills agents-skills
```

**Alvo:** `RESULTADO: ✓ APROVADO` e código de saída 0.

Ele cobre lockstep, presença do `openai.yaml`, metadados de UI, higiene de `description` e igualdade
entre as duas árvores. Para referência, o mesmo script rodado **hoje**, antes do trabalho, reporta
**98 violações** (49 por árvore, todas por `openai.yaml` ausente) — use isso para confirmar que você
está medindo a coisa certa.

### 6.2 · Checagens complementares

```bash
cd /workspaces/CHUPA-CABRA/reversa-otimizacao

# contagem das marcas  → 41 e 41
grep -rl "disable-model-invocation: true" claude-skills --include=SKILL.md | wc -l
find claude-skills -name openai.yaml | xargs grep -l "allow_implicit_invocation: false" | wc -l

# openai.yaml em todas  → 49
find claude-skills -name openai.yaml | wc -l

# nada do legado foi tocado  → VAZIO
cd /workspaces/CHUPA-CABRA/pocoyo-skills
find . -newermt "2026-07-30" -type f \
  -not -path "./.claude/*" -not -path "./.agents/skills/*" -not -path "./.git/*"
```

### 6.2 · A economia, medida

```python
import re, pathlib
tot = n = 0
for p in pathlib.Path("claude-skills").rglob("SKILL.md"):
    t = p.read_text(encoding="utf-8").replace("\r\n", "\n")
    fm = re.match(r"^---\n(.*?)\n---", t, re.S).group(1)
    if re.search(r"^disable-model-invocation:\s*true", fm, re.M):
        continue
    d = re.search(r"^description:\s*(.+?)(?=\n\w+:|\Z)", fm, re.S | re.M)
    tot += len(" ".join(d.group(1).split())); n += 1
print(f"{n} skills · {tot:,} chars · ~{tot//4:,} tokens")
# ANTES:  49 skills · 14.708 chars · ~3.677 tokens
# ALVO B:  8 skills ·  2.336 chars ·   ~584 tokens
```

### 6.3 · Teste funcional — obrigatório, não pule

Nenhuma checagem acima prova que o Reversa funciona. Numa sessão nova, depois do `rsync` da §1:

| # | Teste | Esperado |
|---|---|---|
| 1 | Digitar `/reversa` | Orquestrador carrega e lê `.reversa/state.json` |
| 2 | Escrever só a palavra `reversa` numa mensagem | Ativa (só no Cenário B — é o que A sacrifica) |
| 3 | `/reversa` chegando ao Scout | Executa via leitura direta (exercita o site 4) |
| 4 | `/reversa-scout` digitado direto | Funciona |
| 5 | `/reversa-agents-help` | Catálogo aparece |
| 6 | `/reversa-forward` | Fluxo carrega |

### 6.4 · Definição de "quebrado" — qualquer um destes aborta a entrega

- 🔴 O orquestrador não consegue alcançar um agente user-invoked
- 🔴 Um comando `/reversa-*` que funcionava parou de funcionar
- 🔴 As duas árvores divergiram
- 🔴 Qualquer arquivo do legado foi modificado
- 🔴 O Cenário B foi escolhido e a palavra `reversa` sozinha deixou de ativar

**Ao encontrar qualquer um: pare, faça rollback (§1), reporte ao usuário.** Não tente consertar por cima.

---

## §7 · O que NÃO fazer

- ⛔ **Não crie branch em `pocoyo-skills`.** Não protege nada (Armadilha 1) e o `origin` é repositório
  de outra pessoa.
- ⛔ **Não remova a `description`.** O mattpocock mantém as 24; é a flag que corta o custo.
- ⛔ **Não altere `skills/`, `docs/`, `CLAUDE.md`, `README.md`, `.agents/adr/`, `.agents/invocation.md`,
  `.agents/writing-docs.md`** — tudo do legado.
- ⛔ **Não mexa em `_reversa_sdd/` nem em `.reversa/`.**
- ⛔ **Não confie em `git status` de `pocoyo-skills`** (Armadilha 4).
- ⛔ **Não aplique só numa das duas árvores.**
- ⛔ **Não rode `npx reversa update`** durante a tarefa.
- ⛔ **Não agrupe as 8 etapas num commit só.** O valor está em ter um ponto de retorno por etapa.
- ⛔ **Não mude comportamento "de brinde".** Se notar outra coisa a melhorar, anote e reporte — não
  inclua nesta tarefa.
- 🟡 **Não copie invariante sem executor.** Se for tentador declarar essas regras num documento de
  governança do Reversa: o mattpocock declara 12 invariantes, não verifica nenhuma, e **duas estão
  quebradas agora**. Se declarar, declare com um verificador.

---

## §8 · Fatos de referência

Medidos em 30/07/2026, reproduzíveis.

| Fato | Valor |
|---|---|
| Skills do Reversa | 49 |
| Arquivos por árvore | 108 |
| Árvores independentes | 2 (`.claude/skills`, `.agents/skills`) |
| Skills com `disable-model-invocation` | **0** |
| Arquivos `agents/openai.yaml` | **0** |
| Skills com `/nome` na `description` | 34 |
| Skills só do orquestrador | 15 |
| Sites de invocação skill→skill | 4 (+1 indireto) |
| `description` somadas | 14.708 chars · ~3.677 tokens |
| Média por `description` | 300 chars |
| Média de linhas por `SKILL.md` | 133 (vs 69 do mattpocock) |
| Maior `SKILL.md` | `reversa-new`, 328 linhas |
| Versão instalada | 1.2.56 |
| Fonte do Reversa na máquina | **não existe** |
| Identidade git | `sandeco` / `physialtda@gmail.com` (configurada) |

**Padrão a copiar:** `pocoyo-skills/skills/` (as 41 skills do mattpocock). Bons exemplos de user-invoked:
`skills/productivity/grill-me/` (7 linhas), `skills/engineering/ask-matt/`, `skills/engineering/wayfinder/`.
O racional do eixo está em `skills/productivity/writing-great-skills/GLOSSARY.md`, verbetes
**Model-Invoked**, **User-Invoked**, **Description**, **Context Load**, **Cognitive Load**.

**Análise de origem:** `/workspaces/CHUPA-CABRA/relatorio-mattpocock-vs-reversa.pdf` — seção 7, sugestões
1 e 2. **Veja a correção da §2 antes de seguir o PDF.**

---

## §9 · Ordem de execução

1. Ler §0 inteira.
2. **Confirmar com o usuário:** Cenário **A ou B**? (recomendado B) · a otimização sobe para o fonte do
   Reversa? (Armadilha 5)
3. Montar o repositório dedicado e o branch (§1).
4. **Etapa 1** — teste funcional ANTES, registrado (§4.1).
5. **Etapa 2** — corrigir os 4 sites de invocação. Testar. Commit. (§4.2)
6. **Etapa 3** — marcar só `reversa-scout`. Testar ponta a ponta. Commit. (§4.3)
7. **Etapa 4** — marcar as 40 restantes. Conferir 82 (ou 80). Commit. (§4.4)
8. **Etapa 5** — criar os 98 `openai.yaml`. Commit. (§4.5)

> Até aqui o **estado** está certo. As três etapas seguintes são o que o torna **característica**.

9. **Etapa 6** — reescrever as `description` das 41 user-invoked. Commit. (§4.6)
10. **Etapa 7** — rodar e embarcar o verificador. Commit. (§4.7)
11. **Etapa 8** — escrever a política do eixo de invocação. Commit. (§4.8)
12. Verificador §6.1 → `✓ APROVADO`. Checagens §6.2. Teste funcional §6.3.
13. `rsync` de volta para `pocoyo-skills` (§1).
14. Reportar: carga antes/depois, arquivos tocados, testes executados, saída do verificador, e se precisa
    subir para o fonte.

---
---

# PARTE 2 — Melhorias estruturais (depois, tarefa separada)

> ⚠️ **Não misture com a Parte 1.** A Parte 1 é otimização de custo, com risco controlado e rollback por
> etapa. Estas 5 são melhorias de organização, sem urgência. Faça só **depois** da Parte 1 estar
> validada e sincronizada. Cada uma é um branch próprio.
>
> Aprovadas pelo usuário em 30/07/2026.

## M1 · Podar as skills grandes

`SKILL.md` do Reversa tem **133 linhas em média**, contra 69 do mattpocock. Texto longo demais o modelo
lê pior — a parte do meio é a que ele mais ignora.

As 8 maiores:

| Skill | Linhas |
|---|---:|
| `reversa-new` | 328 |
| `reversa-screen-translator` | 278 |
| `reversa-spec-sdd` | 277 |
| `reversa-migrate` | 272 |
| `reversa-reconstructor` | 242 |
| `reversa-forward` | 231 |
| `reversa-requirements` | 216 |
| `reversa-designer` | 216 |

**O que fazer:** mover blocos de referência (formatos, exemplos, tabelas longas) para
`<skill>/references/`, deixando no `SKILL.md` só o fluxo e um ponteiro em prosa. O Reversa **já faz
isso** em 17 skills — é aplicar o padrão da casa nas que ficaram para trás.

⚠️ Só o `SKILL.md` de skill **model-invoked** custa contexto permanente. Nas user-invoked a poda é por
qualidade de leitura, não por token.

## M2 · Buckets por maturidade

Os 49 agentes estão todos no mesmo nível, todos implicitamente prontos. Não há onde colocar um rascunho
nem um aposentado.

**O que fazer:** separar em pastas por maturidade, e instalar só a principal. Modelo do mattpocock:
`engineering/` + `productivity/` (vão), `in-progress/` (rascunho, não vai), `deprecated/` (aposentado,
guardado como histórico, não vai).

Ganho: dá para escrever um agente novo dentro do repositório sem que ele chegue ao usuário, e aposentar
um sem apagar o histórico dele.

## M3 · Registrar as recusas

Uma pasta com o que o projeto decidiu **não** fazer, com o argumento e o pedido que originou a discussão.
O mattpocock tem 3 documentos em `.out-of-scope/`.

Evita rediscutir o mesmo pedido a cada trimestre, e permite responder com uma página em vez de uma
conversa. O valor não está na recusa, está no argumento preservado.

## M4 · Glossário do vocabulário do Reversa

Termos próprios — **unit, spec, lacuna, fase, checkpoint, doc_level, granularity, agente independente,
escala de confiança** — hoje vivem espalhados entre o `SKILL.md` do orquestrador, os `references/` e o
`config.toml`.

Com 49 agentes escritos ao longo do tempo, é o que impede dois deles de usarem palavras diferentes para a
mesma coisa.

**Modelo:** `pocoyo-skills/skills/productivity/writing-great-skills/GLOSSARY.md` — definição opinativa e
uma linha `_Avoid_:` com os termos rejeitados.

## M5 · Invariantes declaradas — com verificador

Invariante é uma regra de "essas coisas têm que estar sempre de acordo". O Reversa já tem várias,
implícitas. As conhecidas:

| # | Invariante | Estado em 30/07/2026 |
|---|---|---|
| 1 | Todo agente em `config.toml [agents] installed` tem pasta em `.claude/skills/` | 🟢 íntegra (49 = 49) |
| 2 | `.claude/skills/` e `.agents/skills/` são idênticas | 🟢 íntegra |
| 3 | Toda skill tem as duas marcas de invocação em lockstep | 🔴 quebrada — é a Parte 1 |
| 4 | `.reversa/version` bate com a versão do pacote npm | não verificada |

🔴 **A regra que governa esta melhoria:** declare **só** o que você for verificar por script.

O mattpocock declarou 12 invariantes e não checa nenhuma. Duas estão quebradas agora — e uma delas viola
uma regra que ele mesmo publicou num ADR (*"bump both together on release"*). Lista sem executor é
decoração que envelhece em silêncio.

O `verify-invocation.py` já cobre a nº 2 e a nº 3. Estenda-o para as outras, em vez de criar um documento
novo sem script.
