# Parecer de Arquitetura para Revisão do Reversa Bugs

**Destinatário:** Claude  
**Projeto:** Reversa Bugs  
**Objetivo:** revisar o plano atual antes de qualquer implementação  
**Base analisada:** `Reversa Bugs, Documento de Entendimento`, 15/07/2026  
**Decisão:** não implementar a versão 1.2.52 antes de incorporar e avaliar os pontos abaixo

---

## 1. Contexto

O desenho atual do Reversa Bugs está conceitualmente forte em quatro aspectos:

1. separa registro, diagnóstico, decisão e correção;
2. trata o bug como entidade de rastreabilidade entre `SPEC ↔ CODE ↔ TEST ↔ BUG`;
3. cria memória causal de defeitos dentro do próprio repositório;
4. propõe execução multi-engine e debate multiagente sem tornar um harness específico obrigatório.

A arquitetura, porém, ainda está excessivamente orientada ao seguinte modelo mental:

```text
reproduzir
    ↓
achar causa raiz
    ↓
criar teste
    ↓
corrigir código
    ↓
testes passam
    ↓
veredito de spec
    ↓
resolved
```

Esse fluxo representa bem **como um agente entende e corrige um defeito em código**.

Ele ainda não representa completamente **como uma equipe moderna leva um defeito desde a descoberta até a correção comprovada no sistema real**.

O objetivo desta revisão é aproximar o Reversa Bugs da prática diária de manutenção de software sem destruir sua principal virtude: a rastreabilidade causal orientada a agentes.

---

# 2. Nova premissa central

O Reversa Bugs não deve modelar apenas um processo de **program repair**.

Deve modelar o **ciclo de vida completo de um defeito**.

O modelo de referência deve passar a ser:

```text
INTAKE
   ↓
TRIAGE
   ↓
MITIGATE?
   ↓
REPRODUCE
   ↓
DIAGNOSE
   ↓
ROOT CAUSE
   ↓
PLAN
   ↓
CHANGE SET
   ↓
LOCAL VERIFY
   ↓
PR / REVIEW
   ↓
CI
   ↓
MERGE
   ↓
BACKPORT?
   ↓
RELEASE / DEPLOY
   ↓
OBSERVE
   ├── success → RESOLVED
   └── failure → REOPEN

POSTMORTEM?
```

Nem todo projeto terá todas essas etapas.

O Reversa deve detectar o contexto do repositório e adaptar o ciclo.

Exemplos:

```text
biblioteca local:
FIX → TEST → MERGE → RELEASE

serviço em produção:
FIX → TEST → PR → CI → MERGE → DEPLOY → OBSERVE

sistema legado sem CI:
FIX → TEST LOCAL → APROVAÇÃO HUMANA → ENTREGA

incidente crítico:
MITIGATE → RESTORE → INVESTIGATE → FIX → DEPLOY → OBSERVE
```

Portanto, o lifecycle precisa ser **configurável e contextual**, não um fluxo rígido único.

---

# 3. Mudança obrigatória: separar mitigação de correção

O plano atual parte quase imediatamente para reprodução e causa raiz.

Na prática, defeitos graves frequentemente exigem redução do dano antes da investigação.

Exemplo:

```text
BUG: cobrança duplicada de clientes
```

A ação operacional correta pode ser:

```text
1. preservar evidências
2. desligar a funcionalidade
3. reduzir o blast radius
4. aplicar rollback
5. restaurar o serviço
6. investigar a causa raiz
```

Mitigação não é correção.

O schema do bug deve comportar explicitamente:

```yaml
mitigation:
  required: true
  status: applied
  kind: feature-disable
  applied_at: 2026-07-15T14:32:00-03:00
  service_restored: true
  temporary: true
```

Tipos possíveis, inicialmente:

```text
rollback
feature-disable
configuration-change
traffic-reduction
dependency-pin
rate-limit
workaround
manual-procedure
other
```

O sistema deve distinguir:

```text
MITIGATED
≠
FIXED
≠
RESOLVED
```

O bug pode permanecer `active` mesmo depois de o serviço ser restaurado.

---

# 4. O fix não deve ser modelado como "code diff + spec diff"

Esta é uma limitação importante do desenho atual.

Um defeito real pode ser corrigido por mudanças em:

```text
CODE
TEST
CONFIGURATION
DATABASE MIGRATION
DATA REPAIR
DEPENDENCY
INFRASTRUCTURE
FEATURE FLAG
API CONTRACT
CACHE
OBSERVABILITY
SPECIFICATION
DOCUMENTATION
```

Portanto, substituir o conceito estreito de:

```text
code_diff
spec_diff
```

por:

# `Correction Change Set`

Exemplo:

```yaml
change_set:
  - id: CHG-001
    kind: test
    artifact: tests/checkout/test_discount.py
    purpose: reproduce

  - id: CHG-002
    kind: code
    artifact: src/checkout/fechamento.py
    purpose: eliminate-root-cause

  - id: CHG-003
    kind: configuration
    artifact: config/payment.yaml
    purpose: reduce-retry-window

  - id: CHG-004
    kind: data-repair
    artifact: scripts/repair_duplicate_orders.py
    purpose: heal-historical-state

  - id: CHG-005
    kind: specification
    artifact: _reversa_sdd/addenda/bug-BUG-042-v001.md
    purpose: update-effective-spec
```

Cada item do `change_set` deve ser rastreável.

Tipos iniciais recomendados:

```text
test
code
configuration
migration
data-repair
dependency
infrastructure
feature-flag
api-contract
cache
observability
specification
documentation
other
```

O princípio é:

> Um bug não produz necessariamente um patch de código.  
> Um bug produz um conjunto de mudanças corretivas rastreáveis.

---

# 5. Adicionar impacto em dados e recuperação de estado

Corrigir a lógica futura não corrige automaticamente o estado histórico já afetado.

Exemplo:

```text
bug corrigido:
desconto duplicado

estado histórico:
38.421 pedidos armazenados com valor incorreto
```

O Reversa precisa perguntar:

```text
O sistema está corrigido daqui para frente?
Os dados antigos continuam incorretos?
Existe estado externo afetado?
Caches precisam ser invalidados?
Mensagens incorretas já foram publicadas?
```

Adicionar:

```yaml
data_impact:
  assessed: true
  historical_corruption: confirmed
  affected_records_estimate: 38421
  external_state_affected: false
```

E, quando aplicável:

```yaml
data_repair:
  required: true
  strategy: reconciliation-script
  dry_run: passed
  backup_verified: true
  idempotent: true
  rollback_available: true
  artifact: scripts/repair_duplicate_orders.py
```

Adicionar também uma visão de recuperação sistêmica:

```yaml
system_recovery:
  code: healed
  data: healed
  cache: unaffected
  external_state: verified
```

Regra conceitual:

```text
CODE HEALED
≠
SYSTEM HEALED
```

Um bug não deve ser fechado apenas porque o teste passou se o sistema ainda contém estado corrompido causado pelo defeito.

---

# 6. Adicionar uma Reproduction Capsule

Este é um requisito estrutural importante.

Hoje o bug aponta código, spec e testes, mas não descreve com precisão suficiente **em qual estado do mundo o defeito aconteceu**.

Criar uma entidade chamada:

# `Reproduction Capsule`

Exemplo:

```yaml
reproduction:
  status: confirmed

  repository:
    base_commit: a1b2c3d4
    branch: main
    dirty_tree_digest: sha256:xxxx

  environment:
    os: windows-11
    runtime: python-3.12.4
    lockfile_digest: sha256:yyyy
    container: null

  execution:
    command: pytest tests/checkout/test_discount.py -x
    exit_code: 1
    duration_ms: 1420

  fixture:
    refs:
      - evidence/BUG-007/order.json

  observed_failure:
    expected: 90.00
    actual: 81.00

  determinism:
    attempts: 5
    failures: 5
    reproduction_rate: 1.0
    classification: deterministic

  evidence:
    trace: evidence/BUG-007/run-001.trace.json
    stdout: evidence/BUG-007/run-001.stdout.log
```

A cápsula deve congelar o contexto mínimo necessário para reproduzir e interpretar o defeito.

Ela é especialmente importante para:

```text
bugs de ambiente
bugs regressivos
bugs intermitentes
bugs de dependência
bugs de concorrência
bugs sensíveis a configuração
```

---

# 7. Separar reproduction test de regression test

O plano atual aproxima os dois conceitos em excesso.

Eles podem coincidir, mas não são semanticamente equivalentes.

```text
REPRODUCTION TEST
"Consigo fazer o defeito relatado aparecer?"

REGRESSION TEST
"Consigo proteger o comportamento que não pode voltar a quebrar?"
```

Exemplo:

```text
Bug:
pagamento duplicado após timeout
```

Teste de reprodução:

```text
simular timeout HTTP
executar retry
observar duas cobranças
```

Teste de regressão:

```text
para qualquer retry com mesma idempotency_key
número de cobranças efetivadas deve ser exatamente 1
```

Schema recomendado:

```yaml
tests:
  reproduction_tests:
    - id: BRT-001
      artifact: tests/repro/test_bug_042.py
      proves: reported-manifestation

  regression_tests:
    - id: REG-001
      artifact: tests/payment/test_idempotency.py
      protects: SPEC-PAYMENT-0042
```

A correção pode exigir múltiplos regression tests para proteger propriedades distintas do comportamento.

---

# 8. Causa raiz precisa de estado epistemológico

O campo atual `root_cause_code` responde principalmente:

```text
onde?
```

Ele não responde adequadamente:

```text
por que acreditamos que esta é a causa?
quanto confiamos nisso?
qual evidência sustenta a afirmação?
```

Substituir ou complementar por:

```yaml
root_cause:
  status: confirmed
  confidence: 0.94

  hypothesis:
    "O cupom é reaplicado durante a fase de fechamento."

  causal_path:
    - cart.apply_coupon
    - order.close
    - apply_adjustments
    - apply_coupon

  evidence:
    - run: RUN-004
      observation: total 90 -> 81

    - trace: TRACE-002
      observation: apply_coupon called twice

  code_refs:
    - symbol: checkout.fechar_pedido
      file: src/checkout/fechamento.py
```

Estados recomendados:

```text
hypothesized
supported
confirmed
rejected
```

Regra:

> Uma memória causal precisa distinguir hipótese de fato confirmado.

Sem isso, relações incorretas podem contaminar:

```text
grafo
impact score
priorização
debates futuros
diagnósticos posteriores
```

---

# 9. Relações BUG ↔ BUG também precisam de evidência

Hoje relações tipadas são uma boa ideia, mas não devem ser tratadas automaticamente como fatos.

Exemplo:

```yaml
relationships:
  - type: caused-by
    target: BUG-003
    status: confirmed
    confidence: 0.91
    evidence:
      - TRACE-044
    asserted_by: reversa-correlator
```

Estados:

```text
proposed
supported
confirmed
rejected
```

Aplicar pesos diferentes nas views e no impact score.

Exemplo:

```text
confirmed caused-by: peso total
supported caused-by: peso parcial
proposed caused-by: não entra em priorização automática
```

Uma relação proposta não pode alterar automaticamente a prioridade operacional de outros bugs.

---

# 10. O debate deve ter três modos

O debate não deve servir apenas para escolher estratégia de correção.

Criar:

```yaml
debate_mode:
  - diagnosis
  - repair
  - spec
```

## 10.1 `diagnosis`

Usado quando há múltiplas hipóteses causais.

```text
H1: cache inconsistente
H2: retry não idempotente
H3: mensagem duplicada na fila
```

Objetivo:

```text
comparar hipóteses
avaliar evidências
propor probes discriminativos
consolidar diagnóstico
```

## 10.2 `repair`

Usado quando a causa está suficientemente confirmada, mas existem estratégias concorrentes de correção.

Objetivo:

```text
menor mudança coerente
menor risco de regressão
melhor alinhamento com a spec
melhor reversibilidade
menor blast radius
```

## 10.3 `spec`

Usado quando código, testes e spec divergem e não está claro qual representa o comportamento correto.

Objetivo:

```text
avaliar comportamento observado
avaliar spec efetiva
avaliar evidência histórica
avaliar contratos e consumidores
propor veredito de spec
```

O debate de `spec` deve terminar em **recomendação**, nunca decisão automática.

A decisão final continua humana.

---

# 11. Referências de spec não podem depender apenas de path#anchor

O formato:

```yaml
specs:
  - _reversa_sdd/domain.md#regras-de-desconto
```

é um locator, não uma identidade estável.

Após reextração:

```text
domain.md
```

pode virar:

```text
business-rules.md
```

O heading pode ser alterado.

Criar IDs estáveis de spec:

```yaml
spec_refs:
  - id: SPEC-DOMAIN-0042
```

E um catálogo:

```yaml
id: SPEC-DOMAIN-0042
kind: business-rule
title: Limite máximo de desconto

current_location:
  file: _reversa_sdd/domain.md
  anchor: regras-de-desconto
```

O bug aponta para:

```text
SPEC ID
```

As views resolvem:

```text
SPEC ID → localização atual
```

A identidade não deve ser o caminho físico.

---

# 12. Referências de código também precisam ser mais fortes

Um arquivo isolado é pouco para rastreabilidade temporal.

Exemplo:

```yaml
code_refs:
  - file: src/checkout/fechamento.py
    symbol: checkout.fechar_pedido
    blob_sha: 718f...
    captured_at_commit: a1b2c3
```

Quando possível, registrar:

```text
file
symbol
commit
blob sha
line range apenas como locator auxiliar
```

Line number nunca deve ser identidade canônica.

O objetivo é distinguir:

```text
onde o código está hoje
```

de:

```text
qual versão do código participou do defeito
```

---

# 13. O BUG ID precisa ser merge-safe

Um registrador central resolve colisões dentro de uma execução coordenada.

Não resolve necessariamente:

```text
Codex worktree A
Claude worktree B
```

ambos lendo o mesmo último número e criando `BUG-042`.

Não usar sequência global simples como identidade canônica.

Sugestão:

```text
BUG-20260715-A7K3
BUG-20260715-P9M2
```

ou ULID.

A interface pode manter um número humano opcional:

```yaml
id: BUG-20260715-A7K3
display_number: 42
```

A identidade precisa ser globalmente única e tolerante a branches e worktrees concorrentes.

---

# 14. Não mover arquivos de bug entre pastas de status

O desenho atual mantém:

```text
open/
active/
resolved/
```

e também:

```yaml
status: active
```

Isso duplica o mesmo fato.

A necessidade de detectar:

```text
arquivo em active/
status: open
```

é evidência de redundância arquitetural.

Recomendação:

```text
_reversa_bugs/
├── bugs/
├── evidence/
├── debates/
├── inspections/
├── postmortems/
└── generated/
```

Todos os bugs ficam em:

```text
_reversa_bugs/bugs/
```

Status:

```yaml
status: active
phase: diagnosing
```

Status recomendados:

```text
open
active
resolved
```

Fases recomendadas:

```text
triaging
mitigating
reproducing
localizing
diagnosing
planning
testing
patching
reviewing
ci-verifying
merging
backporting
releasing
deploying
observing
awaiting-human
```

As views geradas podem materializar:

```text
generated/open.md
generated/active.md
generated/resolved.md
```

A pasta não deve ser fonte de estado.

---

# 15. Adicionar PR, review, CI e merge ao ciclo

A correção local não é necessariamente a entrega da correção.

O lifecycle deve suportar:

```text
branch/worktree
commits
pull request
review
CI
merge
```

Exemplo:

```yaml
delivery:
  workspace:
    kind: worktree
    path: .worktrees/BUG-A7K3

  branch:
    name: fix/BUG-A7K3-discount

  commits:
    - a82c91f

  pull_request:
    provider: github
    number: 142
    status: open

  review:
    required: true
    requested:
      - checkout-team

  ci:
    run_id: 1827731
    commit_sha: a82c91f
    status: passed

  merge:
    commit: null
```

O Reversa não deve depender de GitHub.

Detectar:

```text
GitHub
GitLab
outro remote
Git sem remote
sem Git
```

E adaptar o workflow.

A integração deve ser opcional, mas o schema do lifecycle precisa comportá-la.

---

# 16. `resolved` precisa depender de uma closure policy

Hoje o plano tende a fechar o bug após correção, teste e veredito de spec.

Isso é cedo demais para vários tipos de sistema.

Exemplo:

```text
teste local passou
CI passou
merge foi feito
deploy ocorreu
produção voltou a apresentar o problema
```

O bug não estava resolvido.

Criar:

```yaml
closure_policy:
  type: production-service
  requires:
    - merged
    - deployed
    - observation-window-passed
```

Outros exemplos:

```yaml
closure_policy:
  type: package
  requires:
    - merged
    - fixed-version-published
```

```yaml
closure_policy:
  type: local-software
  requires:
    - regression-tests-passed
```

O bug permanece:

```yaml
status: active
phase: observing
```

até a política de fechamento ser satisfeita.

`resolved` deve significar:

> A condição de fechamento definida para este projeto foi comprovadamente satisfeita.

---

# 17. Adicionar observação pós-correção

O Reversa registra evidências do defeito.

Também precisa registrar evidências de não recorrência.

Criar:

```yaml
post_fix_observation:
  window:
    started_at: 2026-07-15T16:00:00-03:00
    duration: 2h

  signals:
    - metric: checkout.discount_violation
      before: 8.2%
      after: 0.0%

    - metric: checkout.error_rate
      before: 0.3%
      after: 0.31%

  traces:
    sampled: 1000
    recurrence: 0

  verdict: verified
```

As evidências podem vir de:

```text
testes
logs
métricas
traces
queries
health checks
smoke tests
telemetria externa
procedimento manual
```

A ideia é registrar:

```text
BEFORE FIX
    ↓
CHANGE
    ↓
AFTER FIX
```

e não apenas:

```text
test failed
    ↓
test passed
```

---

# 18. Bugs intermitentes devem ser cidadãos de primeira classe

Não limitar reprodução a:

```yaml
reproducible: always
```

Modelar:

```yaml
reproduction:
  classification: intermittent

  attempts: 100
  failures: 7
  reproduction_rate: 0.07

  suspected_triggers:
    - concurrent-request
    - cache-warm
    - timezone-transition

  controlled_variables:
    random_seed: 4242
    timezone: America/Sao_Paulo
    clock: real
    load: 200-rps
```

Classificações iniciais:

```text
deterministic
intermittent
environment-dependent
not-reproduced
unknown
```

Quando não houver reprodução, o fluxo deve poder concluir:

```yaml
resolution_kind: instrumentation-required
```

Nesse caso, o resultado da investigação pode ser:

```text
adicionar logs
adicionar métricas
adicionar trace
adicionar correlation id
adicionar probe temporário
```

O objetivo é capturar evidência na próxima ocorrência.

Instrumentação pode ser uma ação corretiva válida mesmo sem causa raiz confirmada.

---

# 19. Tornar git bisect um mecanismo formal

O documento atual trata histórico Git principalmente como fonte auxiliar.

Para suspeita de regressão, formalizar:

```yaml
regression_analysis:
  suspected: true

  last_known_good: 718ac31
  first_known_bad: ff82d14

  bisect:
    attempted: true
    automated: true
    test_command: pytest tests/repro_bug_42.py
    culprit_commit: b921af2

  introduced_by:
    commit: b921af2
    pull_request: 118
```

Quando houver:

```text
um commit bom conhecido
um commit ruim conhecido
um comando reproduzível
```

o Reversa deve sugerir ou executar `git bisect` dentro das restrições de segurança definidas.

Isso combina diretamente com a proposta de memória causal:

```text
BUG
 ↓
CULPRIT COMMIT
 ↓
PR
 ↓
CHANGE
 ↓
SPEC IMPACT
```

---

# 20. Adicionar versões afetadas, fixed versions e backports

Projetos reais frequentemente mantêm múltiplas linhas de versão.

Adicionar:

```yaml
versions:
  affected:
    - ">=2.3.0 <2.5.4"

  unaffected:
    - "<2.3.0"

  fixed:
    - 2.5.4
    - 2.4.9
    - 2.3.17
```

E:

```yaml
backports:
  - branch: release/2.4
    status: merged
    commit: a7c31ff

  - branch: release/2.3
    status: conflict
    requires_manual_adaptation: true
```

O bug pode estar corrigido em `main` e continuar ativo para uma release suportada.

A closure policy precisa considerar isso quando o projeto possuir branches mantidas.

---

# 21. Adicionar ownership

Os campos:

```text
area
module
feature
```

não dizem quem responde pela parte afetada.

Adicionar:

```yaml
ownership:
  owning_team: checkout

  codeowners:
    - "@empresa/payments"

  assignees:
    - sandeco

  reviewers:
    - "@maria"

  stakeholders:
    - finance
```

Quando possível, inferir ownership de:

```text
CODEOWNERS
histórico Git
estrutura do repositório
configuração do projeto
```

Não inventar ownership.

Se não houver evidência:

```yaml
owning_team: unclassified
```

---

# 22. A origem do bug pode ser externa

O `/reversa-bug` continua válido como intake conversacional.

Mas bugs também chegam por:

```text
GitHub Issue
GitLab Issue
CI failure
alert
log
trace
Sentry
suporte
cliente
security advisory
```

Adicionar:

```yaml
origin:
  type: github-issue

  external_ref:
    provider: github
    id: "#317"
```

Ou:

```yaml
origin:
  type: telemetry

  external_ref:
    provider: sentry
    id: EVENT-82828
```

Tipos iniciais:

```text
manual-report
github-issue
gitlab-issue
ci-failure
telemetry
alert
support
customer
security-advisory
inspection
other
```

O `BUG-XXX.md` continua sendo a source of truth do Reversa.

A origem externa apenas registra de onde o defeito entrou no lifecycle.

---

# 23. Adicionar fluxo especial para bugs de segurança

O Reversa não pode registrar vulnerabilidades exploráveis em artefatos públicos sem considerar confidencialidade.

Adicionar:

```yaml
visibility:
  classification: restricted
```

Classificações:

```text
normal
internal
restricted
embargoed
```

Ao detectar indícios de segurança:

```text
authentication bypass
authorization bypass
secret exposure
remote code execution
injection
privilege escalation
cryptographic failure
sensitive data exposure
```

o protocolo deve mudar.

Regras mínimas:

```text
não escrever detalhes exploráveis em artefatos públicos
não enviar material a harness externo sem aprovação
não incluir o bug em views públicas
não publicar causa raiz detalhada automaticamente
não expor evidência sensível em debates
```

A classificação de segurança não deve ser atribuída silenciosamente como fato definitivo.

O agente pode marcar:

```yaml
security_suspected: true
```

e solicitar confirmação quando necessário.

---

# 24. Separar impacto do bug de risco da correção

O `impact score` responde:

```text
qual a importância ou propagação do defeito?
```

Ele não responde:

```text
qual o risco de mexer no sistema para corrigir?
```

Criar:

# `change_risk`

Exemplo:

```yaml
change_risk:
  score: 87
  classification: critical

  blast_radius:
    affected_symbols: 12
    transitive_callers: 147
    modules: 8

  public_api_change: false
  database_change: true
  external_contract_change: false
```

Dimensões possíveis:

```text
blast radius
transitive callers
public API
database
external contract
security surface
concurrency
migration
irreversibility
critical path
test coverage
```

A política de execução deve considerar:

```text
BUG IMPACT
     +
DIAGNOSTIC UNCERTAINTY
     +
CHANGE RISK
     ↓
EXECUTION POLICY
```

Exemplo:

```text
baixo risco + causa confirmada
→ direct fix

alta incerteza diagnóstica
→ diagnosis debate

alto change risk
→ repair debate + review obrigatório

mudança de spec
→ aprovação humana obrigatória

mudança crítica em produção
→ rollout controlado + observation gate
```

---

# 25. Reduzir approval fatigue

O princípio atual de handoff manual em toda etapa é seguro, mas pode tornar a aprovação mecânica e sem leitura.

Não exigir `CONTINUAR` após toda ação de leitura ou diagnóstico.

Criar modos de controle:

```yaml
control_mode: gated
```

Valores:

```text
supervised
gated
autonomous
```

Sugestão de comportamento:

## `supervised`

Aprovação frequente.

Adequado para:

```text
ambientes sensíveis
onboarding
investigação exploratória
```

## `gated`

Padrão recomendado.

Automático:

```text
leitura
localização
reprodução isolada
diagnóstico
coleta de evidências
geração de views
```

Gate obrigatório:

```text
aplicar teste que altera o projeto
aplicar correction change set
alterar spec efetiva
usar harness externo com acesso ao projeto
executar operação destrutiva
deploy
```

## `autonomous`

Somente quando explicitamente habilitado e limitado por políticas do projeto.

Mesmo em modo autônomo, certas operações podem continuar obrigatoriamente gated.

Exemplo:

```text
mudança de spec
security
produção
dados irreversíveis
```

---

# 26. Adicionar postmortem seletivo

Não gerar postmortem para qualquer bug.

Criar política:

```yaml
postmortem_policy:
  required_when:
    - severity: critical
    - data_corruption: true
    - security: true
    - recurrence_count: ">=2"
```

Outros gatilhos possíveis:

```text
customer outage
major incident
regression recurrence
large financial impact
SLA breach
```

O Reversa já terá os dados necessários:

```text
BUG RECORD
+
TIMELINE
+
ROOT CAUSE
+
MITIGATION
+
CHANGE SET
+
OBSERVATION
=
POSTMORTEM
```

Salvar, quando exigido:

```text
_reversa_bugs/postmortems/BUG-XXXX.md
```

O postmortem deve ser derivado do registro existente e não uma segunda source of truth.

---

# 27. Revisão da arquitetura conceitual

A arquitetura não deve ser pensada como:

```text
BUG FILE
   ↓
AGENTS
   ↓
FIX
```

Adotar o seguinte modelo mental:

```text
                 BUG RECORD
                     │
                     ▼
              BUG STATE MACHINE
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
 REPOSITORY      EXECUTION      EFFECTIVE SPEC
   GRAPH           EVIDENCE          GRAPH
       │             │             │
       └─────────────┼─────────────┘
                     ▼
               BUG ORCHESTRATOR
                     │
           ┌─────────┼─────────┐
           ▼         ▼         ▼
        SOLVERS   CRITICS   VERIFIERS
                     │
                     ▼
              APPROVAL GATES
                     │
                     ▼
           CORRECTION CHANGE SET
                     │
                     ▼
               DELIVERY LIFECYCLE
                     │
                     ▼
              CLOSURE POLICY
```

Ponto central:

> Os agentes não são a arquitetura.  
> Os agentes são workers efêmeros de uma arquitetura governada por estado, evidência, políticas e rastreabilidade.

---

# 28. Os cinco comandos atuais podem continuar

Não criar dez ou quinze novos comandos.

Manter:

```text
/reversa-bug
/reversa-bug-fix
/reversa-bug-debate
/reversa-depth-inspection
/reversa-bug-graph
```

O ganho deve entrar principalmente na máquina interna de estados e nos schemas.

## `/reversa-bug`

Responsável por:

```text
intake
triage inicial
origem
dedupe
traceability inicial
classificação
security suspicion
registro
```

## `/reversa-bug-fix`

Deve se tornar o orquestrador principal do lifecycle:

```text
mitigation
reproduction
diagnosis
root cause
planning
change set
local verification
delivery
observation
closure
```

Não significa que execute todas as etapas em todos os projetos.

A closure policy e o contexto definem o fluxo.

## `/reversa-bug-debate`

Recebe:

```text
mode: diagnosis | repair | spec
```

## `/reversa-depth-inspection`

Continua diagnóstico-only.

Achados confirmados entram no registrador central.

Deve avaliar também sinais de:

```text
data corruption
operational risk
security
intermittency
configuration drift
version-specific behavior
```

## `/reversa-bug-graph`

Gera views derivadas.

Não usar matriz NxN global como armazenamento.

Preferir catálogo e arestas esparsas.

---

# 29. Requisitos de implementação derivados deste parecer

Antes de implementar, revisar `specs/reversa-bugs/` e incorporar, no mínimo:

- [ ] lifecycle completo de defeito;
- [ ] `phase` separada de `status`;
- [ ] bug path estável;
- [ ] mitigation;
- [ ] Reproduction Capsule;
- [ ] reproduction tests separados de regression tests;
- [ ] root cause com status epistemológico e evidências;
- [ ] relationships com status, confiança e evidência;
- [ ] `Correction Change Set`;
- [ ] data impact e data repair;
- [ ] IDs estáveis de spec;
- [ ] code refs temporais e simbólicas;
- [ ] IDs de bug merge-safe;
- [ ] debate `diagnosis | repair | spec`;
- [ ] delivery lifecycle;
- [ ] PR/review/CI/merge opcionais;
- [ ] versions, fixed versions e backports;
- [ ] closure policy;
- [ ] post-fix observation;
- [ ] tratamento explícito de intermittent bugs;
- [ ] `instrumentation-required`;
- [ ] git bisect como mecanismo formal de regressão;
- [ ] ownership;
- [ ] external origins;
- [ ] visibility e security flow;
- [ ] `change_risk`;
- [ ] control modes e gates por risco;
- [ ] postmortem policy.

---

# 30. Critérios de aceitação da nova spec

A revisão estará pronta quando o desenho conseguir responder claramente aos cenários abaixo.

## Cenário A: bug simples local

```text
teste reproduz
causa confirmada
patch pequeno
regression test passa
sem CI
```

O Reversa deve conseguir fechar o bug sem burocracia excessiva.

## Cenário B: incidente de produção

```text
pagamento duplicado
impacto financeiro
mitigação imediata
rollback
investigação posterior
deploy controlado
observação em produção
```

O bug não pode ser marcado `resolved` após apenas um teste local.

## Cenário C: corrupção de dados

```text
código corrigido
dados históricos continuam errados
```

O sistema deve distinguir `code healed` de `system healed`.

## Cenário D: bug intermitente

```text
7 falhas em 100 execuções
causa não confirmada
```

O fluxo deve permitir instrumentação adicional sem inventar causa raiz.

## Cenário E: regressão

```text
há um commit bom
há um commit ruim
teste reproduzível
```

O sistema deve comportar `git bisect` e ligar o bug ao culprit commit.

## Cenário F: múltiplas versões

```text
main corrigida
release/2.4 ainda afetada
```

O bug deve permanecer operacionalmente aberto quando a closure policy exigir backport.

## Cenário G: divergência de spec

```text
código, teste e spec discordam
não está claro quem representa a regra correta
```

O Reversa deve poder abrir debate de `spec` e exigir decisão humana.

## Cenário H: vulnerabilidade

```text
authentication bypass
repositório público
```

O Reversa não pode publicar detalhes exploráveis em views ou debates externos.

## Cenário I: dois harnesses em worktrees

```text
Claude registra um bug
Codex registra outro ao mesmo tempo
```

Os IDs não podem colidir.

## Cenário J: fix de alto risco

```text
bug médio
mudança em middleware usado por 147 callers
```

A execução deve considerar `change_risk`, e não apenas impacto do bug.

---

# 31. Diretriz final para a revisão

Não implementar ainda.

Primeiro:

```text
1. revisar requirements.md
2. revisar design.md
3. revisar tasks.md
4. atualizar schemas e invariantes
5. simular os 10 cenários de aceitação
6. submeter novamente para revisão
```

Não adicionar complexidade apenas por adicionar.

O objetivo não é transformar o Reversa Bugs em Jira, Sentry, GitHub Actions ou uma plataforma de observabilidade.

O objetivo é:

> Criar uma memória causal, repository-native e orientada a agentes que acompanha o defeito desde sua descoberta até a comprovação de recuperação do sistema.

A formulação arquitetural recomendada é:

> **Reversa Bugs is a repository-native causal defect memory and orchestration layer that continuously reconciles specifications, implementation, tests, runtime evidence, delivery state, and defect history for agentic software maintenance.**

A principal tese do projeto não deve ser:

> "vários agentes corrigem bugs".

Deve ser:

> **O sistema mantém uma memória causal verificável do defeito e usa agentes especializados como workers efêmeros para investigar, decidir, corrigir e comprovar a recuperação do software.**

Esse é o norte para redesenhar a spec.
