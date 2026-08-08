# Reversa, Meta-Harness, Diff e Handoff

## Documento de evolução conceitual e arquitetural

Este documento consolida a discussão sobre o uso de **diff** e **handoff** em desenvolvimento de software orientado por agentes de IA e propõe sua incorporação ao **Reversa** dentro de uma arquitetura de **meta-harness**.

A ideia central é tratar a execução de agentes não como uma sequência informal de prompts, mas como um sistema de trabalho coordenado, verificável, rastreável e capaz de transferir estado entre diferentes harnesses, agentes e sessões.

---

# 1. O que é diff no desenvolvimento de software

Em desenvolvimento de software, **diff** é a representação das diferenças entre duas versões de um código ou conjunto de arquivos.

Ele mostra, normalmente linha a linha:

- o que foi adicionado;
- o que foi removido;
- o que foi alterado.

Exemplo:

```diff
- total = preco * quantidade
+ total = preco * quantidade * desconto
```

Neste caso:

- `-` representa uma linha removida;
- `+` representa uma linha adicionada.

Na prática, a linha antiga foi substituída pela nova.

## 1.1 Diff como representação da mudança

O diff não precisa reapresentar o sistema inteiro.

Seu objetivo é responder:

> O que mudou entre o estado anterior e o estado atual?

Essa característica torna o diff especialmente importante em manutenção de software.

Um sistema pode conter milhares ou milhões de linhas de código. Em uma atividade de manutenção, normalmente não é necessário revisar todo o sistema. O interesse está concentrado na mudança produzida.

Por isso, o diff pode ser entendido como:

> A unidade visual e estrutural da mudança no código.

---

# 2. Onde o diff é utilizado

| Contexto | Uso do diff |
|---|---|
| Manutenção de software | Identificar o código alterado durante uma correção |
| Git e versionamento | Comparar versões, commits e branches |
| Code review | Revisar apenas as mudanças feitas |
| Correção de bugs | Identificar quais linhas foram modificadas |
| Pull Request | Mostrar alterações propostas antes da integração |
| Auditoria | Rastrear mudanças no sistema |
| Refatoração | Avaliar a extensão das alterações estruturais |
| Desenvolvimento com IA | Verificar exatamente o que um agente modificou |

No Git, por exemplo:

```bash
git diff
```

Esse comando mostra alterações locais ainda não commitadas.

Também é possível comparar dois commits:

```bash
git diff commitA commitB
```

Ou comparar duas branches:

```bash
git diff main feature-login
```

---

# 3. Diff no desenvolvimento com agentes de IA

Com agentes como Claude Code, Codex e outros harnesses de programação, o diff ganha uma importância ainda maior.

Um agente pode:

- criar arquivos;
- remover código;
- alterar APIs;
- modificar testes;
- alterar configurações;
- introduzir mudanças fora do escopo solicitado.

A resposta textual do agente não é suficiente para determinar com precisão o que aconteceu.

O agente pode afirmar:

> Corrigi o login.

Mas o repositório pode mostrar:

```text
18 files changed
1,842 insertions
763 deletions
```

Neste cenário, existe uma diferença entre:

- a **declaração do agente**;
- a **mudança material observável no código**.

O diff funciona como evidência objetiva da execução.

Podemos resumir:

> O agente descreve o que acredita ter feito.

> O diff mostra o que efetivamente mudou.

---

# 4. O que é handoff

**Handoff** significa passagem de responsabilidade, contexto e trabalho de uma pessoa, equipe, processo ou agente para outro.

No desenvolvimento de software, o conceito pode ser resumido como:

> Eu executei minha parte. Este é o estado atual. A continuidade começa daqui.

Handoffs aparecem em vários contextos tradicionais da engenharia de software.

| Artefato ou processo | Tipo de handoff |
|---|---|
| Pull Request | Desenvolvedor para revisor |
| Issue | Produto ou suporte para desenvolvimento |
| ADR | Arquiteto para desenvolvedores atuais e futuros |
| Runbook | Engenharia para operações |
| Incident report | Um turno de plantão para outro |
| README | Autor para usuários e mantenedores |
| Ticket | Uma equipe para outra |
| Change Request | Solicitante para equipe responsável |

Portanto, **handoff não é apenas uma gíria de desenvolvedor**.

É um conceito profissional consolidado em engenharia, operações, SRE, incident response, suporte e gestão de projetos.

Entretanto, existe uma distinção importante:

> Existe um conceito consolidado de handoff, mas não existe um formato universal obrigatório de arquivo de handoff.

---

# 5. Handoff em Claude Code, Codex e agentes

Quando Claude Code ou Codex fala em salvar um handoff para outra sessão, o termo está sendo utilizado como uma forma de **persistência operacional de contexto**.

Uma sessão pode terminar.

Outro agente pode assumir o trabalho.

Outro modelo pode ser utilizado.

O contexto original da LLM pode não existir mais.

O handoff registra informações suficientes para permitir continuidade.

Exemplo:

```text
HANDOFF.md

Objetivo:
Implementar autenticação OAuth.

Estado atual:
Backend concluído.

Arquivos alterados:
- src/auth/oauth.py
- src/routes/login.py

Decisões:
Usamos OAuth 2.0 com PKCE.

Problemas conhecidos:
Callback falha no ambiente Windows.

Próximo passo:
Corrigir callback e executar os testes de integração.
```

O objetivo não é simplesmente documentar o trabalho.

O objetivo é permitir que outro executor continue sem precisar reconstruir todo o raciocínio anterior.

Podemos definir o handoff para agentes como:

> Um checkpoint estruturado do estado operacional do trabalho.

---

# 6. O handoff como memória operacional

Existe uma diferença entre documentação tradicional e handoff.

Uma documentação pode explicar:

- como o sistema funciona;
- por que uma arquitetura foi escolhida;
- quais APIs existem;
- como instalar o projeto.

O handoff responde a perguntas diferentes:

- qual era o objetivo atual?
- o que já foi executado?
- qual é o estado neste momento?
- quais decisões foram tomadas?
- quais arquivos foram afetados?
- o que foi comprovado?
- quais riscos permanecem?
- o que ainda falta?
- quem ou qual harness deveria continuar?

Por isso, o handoff pode ser visto como **memória operacional de curto e médio prazo do processo de desenvolvimento**.

Em sistemas multiagente, ele funciona como uma forma de persistência de estado entre execuções.

---

# 7. Meta-harness

Um **meta-harness** é um harness responsável por coordenar outros harnesses.

Em vez de executar diretamente todas as atividades de desenvolvimento, o meta-harness atua como controlador.

Ele pode:

- interpretar objetivos;
- selecionar harnesses especializados;
- delegar tarefas;
- acompanhar resultados;
- verificar evidências;
- avaliar inconsistências;
- decidir o próximo passo;
- interromper loops;
- solicitar correções;
- transferir trabalho entre agentes.

Exemplo conceitual:

```text
                    META-HARNESS
                         │
                         ▼
               HARNESS IMPLEMENTADOR
                         │
                         ▼
                 HARNESS DE TESTES
                         │
                         ▼
                HARNESS DE AUDITORIA
                         │
                         ▼
                HARNESS DE CORREÇÃO
```

O problema fundamental dessa arquitetura é:

> Como transferir o estado do trabalho de um harness para outro?

A resposta proposta é:

> Handoff.

---

# 8. Handoff como contrato entre harnesses

O handoff pode ser transformado em um **contrato de comunicação entre harnesses**.

Um harness não deveria simplesmente retornar:

```text
done
```

Ou:

```text
finished
```

Ou:

```text
task completed
```

Essas respostas são insuficientes para um meta-harness.

O harness deveria produzir um pacote estruturado contendo o estado da execução.

Exemplo:

```yaml
objective: Corrigir BUG-042

status: implemented

summary:
  O login comparava a senha diretamente.
  A validação foi alterada para usar o hash armazenado.

reason:
  A implementação anterior era incompatível com
  o fluxo definido na SPEC-AUTH-003.

files_touched:
  - src/auth/login.py
  - tests/auth/test_login.py

specs:
  - SPEC-AUTH-003

verification:
  command: pytest tests/auth/test_login.py
  result: passed
  evidence: 12 tests passed

remaining_risks:
  - OAuth ainda não foi validado

unresolved_items:
  - executar regressão completa da autenticação

recommended_next_step:
  Executar regressão completa de autenticação

recommended_harness:
  regression-testing
```

O handoff deixa de ser uma anotação informal.

Ele passa a ser um artefato processável por máquina.

---

# 9. Handoff e diff possuem funções diferentes

O handoff e o diff não são concorrentes.

Eles representam dimensões diferentes da execução.

## Diff

O diff é:

- mecânico;
- objetivo;
- observável;
- reproduzível;
- verificável.

Ele responde:

> O que mudou?

## Handoff

O handoff é:

- semântico;
- contextual;
- operacional;
- interpretativo;
- orientado à continuidade.

Ele responde:

> O que aconteceu e como continuar?

A relação pode ser sintetizada assim:

> Diff mostra o que mudou.

> Handoff explica o que aconteceu e como continuar.

---

# 10. A combinação central: handoff + diff

A combinação dos dois conceitos é especialmente poderosa em um meta-harness.

O harness executa uma atividade.

Após a execução:

1. o sistema captura o diff;
2. o harness gera o handoff;
3. o meta-harness recebe os dois;
4. o meta-harness compara declaração e evidência;
5. o meta-harness decide a continuidade.

Arquitetura:

```text
                    META-HARNESS CHEFE
                           │
                    delega objetivo
                           │
                           ▼
                 HARNESS IMPLEMENTADOR
                           │
                    executa trabalho
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                  DIFF         HANDOFF
             "o que mudou"   "o que aconteceu"
                    │             │
                    └──────┬──────┘
                           ▼
                    META-HARNESS
                           │
                    toma decisão
                           ▼
              próximo harness especializado
```

---

# 11. O diff audita o handoff

Esta é uma das ideias mais importantes da discussão.

Um agente pode produzir o seguinte handoff:

```yaml
status: completed
summary: Corrigido o problema de login
```

Entretanto, o diff pode mostrar:

```text
src/auth/login.py
src/database/models.py
src/api/users.py
src/config.py
src/payment/stripe.py
README.md
```

Existe uma inconsistência.

O escopo descrito pelo agente não explica as alterações observadas.

O meta-harness pode identificar:

```yaml
decision: REJECT_HANDOFF

reason:
  O escopo declarado no handoff não explica
  as alterações observadas no diff.

next_harness: diff-auditor
```

Assim:

> O diff audita o handoff.

O handoff é uma declaração produzida pelo agente.

O diff é evidência material coletada diretamente do repositório.

---

# 12. O handoff explica o diff

A relação também funciona no sentido contrário.

Considere o diff:

```diff
- if user.password == password:
+ if verify_password(password, user.password_hash):
```

O diff mostra uma mudança.

Mas não explica necessariamente:

- por que ela foi necessária;
- qual bug estava relacionado;
- qual especificação exigia a mudança;
- quais riscos foram considerados;
- o que ainda precisa ser testado.

O handoff pode registrar:

```yaml
objective: Corrigir BUG-042

summary:
  A autenticação comparava a senha em texto direto.
  A implementação foi ajustada para validar o hash armazenado.

reason:
  O comportamento anterior violava a SPEC-AUTH-003.

verification:
  - pytest tests/auth/test_login.py
  - 12 tests passed

remaining_risks:
  - OAuth não foi validado
```

Assim:

> O handoff explica o diff.

---

# 13. Declaração versus evidência

A combinação handoff + diff cria uma distinção conceitual importante.

## Handoff

Representa a declaração do executor.

```text
O agente afirma que fez X.
```

## Diff

Representa a evidência material de alteração.

```text
O repositório mostra que Y mudou.
```

## Meta-harness

Atua como juiz.

```text
X é consistente com Y?
```

A ideia pode ser sintetizada como:

> O handoff é a declaração do agente.

> O diff é a evidência material.

> O meta-harness verifica se declaração e evidência são consistentes.

---

# 14. Fluxo sugerido para o meta-harness

Um fluxo inicial pode ser estruturado da seguinte maneira:

```text
1. DELEGATE
   │
   ▼
2. EXECUTE
   │
   ▼
3. CAPTURE DIFF
   │
   ▼
4. GENERATE HANDOFF
   │
   ▼
5. CROSS-VALIDATE
   │
   ├── handoff condiz com diff?
   ├── diff condiz com objetivo?
   ├── arquivos alterados fazem sentido?
   ├── specs relacionadas foram respeitadas?
   ├── verificações realmente passaram?
   └── riscos foram identificados?
   │
   ▼
6. DECIDE NEXT HARNESS
```

O passo 5 pode ser denominado:

```text
Handoff-Diff Consistency Check
```

Ou:

```text
Cross-Evidence Validation
```

---

# 15. As quatro camadas de evidência

A arquitetura pode evoluir para uma comparação entre quatro componentes:

```text
INTENÇÃO
   ↕
HANDOFF
   ↕
DIFF
   ↕
VERIFICAÇÃO
```

## 15.1 Intenção

Representa o objetivo original.

Exemplo:

```yaml
objective:
  Corrigir BUG-042
```

## 15.2 Handoff

Representa a interpretação e declaração do agente.

```yaml
status: completed
summary: Login corrigido
```

## 15.3 Diff

Representa as mudanças materiais no repositório.

```text
src/auth/login.py
tests/auth/test_login.py
```

## 15.4 Verificação

Representa evidências de funcionamento.

```text
12 tests passed
```

O meta-harness deve verificar a consistência entre essas quatro dimensões.

---

# 16. Exemplo de aceitação

Objetivo:

```yaml
objective:
  Corrigir BUG-042
```

Handoff:

```yaml
status: completed

summary:
  Login corrigido por meio da substituição
  da comparação direta de senha pela validação
  do hash armazenado.
```

Diff:

```text
src/auth/login.py
tests/auth/test_login.py
```

Verificação:

```text
12 passed
```

Decisão:

```yaml
decision: ACCEPT

next_harness: regression-auditor

reason:
  Diff consistente com o objetivo.
  Handoff consistente com as alterações.
  Verificação local passou.
  Regressão global ainda não executada.
```

---

# 17. Exemplo de rejeição

Objetivo:

```yaml
objective:
  Corrigir BUG-042 relacionado ao login
```

Handoff:

```yaml
status: completed
summary: Corrigido login
```

Diff:

```text
src/auth/login.py
src/database/models.py
src/api/users.py
src/config.py
src/payment/stripe.py
README.md
```

Decisão:

```yaml
decision: REJECT_HANDOFF

reason:
  O escopo declarado no handoff não explica
  as alterações observadas no diff.

next_harness: diff-auditor
```

O meta-harness pode encaminhar o trabalho para um harness especializado em auditoria de mudanças.

---

# 18. Handoff Package

Todo harness filho pode ser obrigado a devolver um **Handoff Package**.

Estrutura conceitual:

```text
HANDOFF PACKAGE
├── objective
├── task_id
├── status
├── summary
├── decisions
├── assumptions
├── diff_reference
├── files_touched
├── specs_affected
├── bugs_related
├── verification
├── risks
├── unresolved_items
├── recommended_next_step
└── recommended_next_harness
```

Uma possível representação YAML:

```yaml
handoff:
  version: "1.0"

  task_id: BUG-042

  objective:
    Corrigir falha de autenticação no login local.

  status:
    implemented

  summary:
    A comparação direta de senha foi removida.
    A autenticação agora utiliza o hash armazenado.

  decisions:
    - id: DEC-001
      description: Utilizar verify_password existente.
      reason: Evitar duplicação de lógica criptográfica.

  assumptions:
    - O formato atual do password_hash é válido.

  diff_reference:
    base: abc123
    head: def456

  files_touched:
    - src/auth/login.py
    - tests/auth/test_login.py

  specs_affected:
    - SPEC-AUTH-003

  bugs_related:
    - BUG-042

  verification:
    commands:
      - pytest tests/auth/test_login.py
    results:
      - 12 passed

  risks:
    - Fluxo OAuth não foi validado.

  unresolved_items:
    - Executar regressão completa de autenticação.

  recommended_next_step:
    Executar testes de regressão.

  recommended_next_harness:
    regression-testing
```

---

# 19. Handoff como artefato de primeira classe

No Reversa, o handoff deveria ser tratado como um **artefato de primeira classe**.

Isso significa que ele não deve ser apenas texto gerado livremente pela LLM.

Ele deve possuir:

- schema;
- identificador;
- versão;
- validação;
- persistência;
- rastreabilidade;
- referências;
- histórico.

Exemplo:

```text
.reversa/
├── specs/
├── bugs/
├── traceability/
├── handoffs/
│   ├── BUG-042/
│   │   ├── HO-0001.yaml
│   │   ├── HO-0002.yaml
│   │   └── HO-0003.yaml
│   └── FEATURE-AUTH/
├── decisions/
└── meta-harness/
```

Entretanto, deve-se tomar cuidado para não criar uma árvore excessivamente profunda.

Uma alternativa mais simples:

```text
.reversa/
├── specs/
├── bugs/
├── handoffs/
├── traceability/
└── state/
```

Arquivos:

```text
handoffs/
├── HO-000001-BUG-042.yaml
├── HO-000002-BUG-042.yaml
├── HO-000003-FEATURE-AUTH.yaml
└── HO-000004-SPEC-AUTH-003.yaml
```

A relação entre entidades pode ser mantida por IDs e por uma matriz ou grafo de rastreabilidade.

---

# 20. Relação com rastreabilidade no Reversa

A discussão anterior sobre o Reversa já apontava a necessidade de ligar:

- código;
- SPECs;
- bugs;
- features;
- subsistemas;
- módulos.

Com handoff e diff, novas relações podem ser adicionadas.

Exemplo:

```text
BUG-042
   │
   ├── afetado_por ──> SPEC-AUTH-003
   │
   ├── corrigido_por ──> HO-000142
   │
   ├── altera ──> src/auth/login.py
   │
   └── verificado_por ──> TEST-AUTH-019
```

O handoff pode funcionar como a entidade que registra uma transição de estado.

Exemplo:

```text
BUG-042
   │
   ▼
HO-000142
   │
   ├── DIFF-000931
   ├── SPEC-AUTH-003
   ├── TEST-AUTH-019
   └── HARNESS-IMPLEMENTER
```

O meta-harness pode consultar essas relações antes de tomar decisões.

---

# 21. O handoff como evento de transição

Uma evolução conceitual importante é tratar o handoff não apenas como documento.

Ele pode representar um **evento de transição de responsabilidade e estado**.

Exemplo:

```text
IMPLEMENTATION
      │
      │ HO-000142
      ▼
REGRESSION TESTING
```

O handoff registra:

- origem;
- destino;
- estado anterior;
- estado produzido;
- evidências;
- pendências.

Exemplo:

```yaml
transition:
  from_harness: implementation
  to_harness: regression-testing

  previous_state: bug_confirmed
  resulting_state: fix_implemented
```

Isso aproxima o meta-harness de uma máquina de estados.

---

# 22. Meta-harness como máquina de estados

O Reversa pode estruturar o meta-harness como uma máquina de estados orientada por evidências.

Exemplo:

```text
BUG_IDENTIFIED
      │
      ▼
SPEC_LINKED
      │
      ▼
IMPLEMENTATION_REQUESTED
      │
      ▼
IMPLEMENTED
      │
      ▼
DIFF_VALIDATED
      │
      ▼
TESTED
      │
      ▼
AUDITED
      │
      ▼
CLOSED
```

Os handoffs são responsáveis por propor transições.

O meta-harness valida a evidência antes de aceitar a mudança de estado.

Exemplo:

```yaml
requested_transition:
  from: IMPLEMENTATION_REQUESTED
  to: IMPLEMENTED
```

O meta-harness verifica:

```text
Existe diff?
O diff possui arquivos?
Os arquivos estão relacionados ao objetivo?
O handoff explica as mudanças?
Existe referência à SPEC?
O comando de verificação foi executado?
```

Somente após a validação:

```yaml
transition:
  accepted: true
```

---

# 23. O meta-harness não deve confiar na narrativa do agente

Uma regra arquitetural importante:

> O meta-harness não deve tomar decisões apenas com base na resposta textual do agente executor.

LLMs são sistemas geradores de linguagem.

Uma declaração como:

```text
Todos os testes passaram.
```

Não deve ser automaticamente aceita como evidência.

O handoff pode registrar a declaração.

A evidência deve ser coletada separadamente.

Exemplo:

```yaml
verification:
  claimed:
    tests_passed: true

  observed:
    command: pytest
    exit_code: 0
    tests_passed: 142
```

Essa separação é extremamente importante.

Pode-se diferenciar:

```text
CLAIM
```

e

```text
EVIDENCE
```

O meta-harness valida claims usando evidências.

---

# 24. Claims e evidence

Uma possível estrutura:

```yaml
claims:
  - id: CLAIM-001
    statement: Bug de login corrigido.

  - id: CLAIM-002
    statement: Testes de autenticação passaram.

evidence:
  - id: EVID-001
    type: diff
    supports:
      - CLAIM-001

  - id: EVID-002
    type: test_execution
    supports:
      - CLAIM-002
```

O meta-harness pode identificar claims sem evidência.

Exemplo:

```yaml
consistency_check:
  unsupported_claims:
    - CLAIM-003
```

Resultado:

```yaml
decision: NEEDS_VERIFICATION
```

Esta abordagem conecta diretamente o meta-harness ao conceito de rastreabilidade do Reversa.

---

# 25. Cross-Evidence Validation

A função central do meta-harness pode ser definida como **validação cruzada de evidências**.

Entradas:

```text
OBJECTIVE
SPEC
BUG
HANDOFF
DIFF
TEST RESULT
REPOSITORY STATE
```

O meta-harness compara as relações.

Exemplo de perguntas:

```text
O handoff declara que a tarefa foi concluída?
             │
             ▼
Existe diff?
             │
             ▼
O diff toca arquivos relacionados ao objetivo?
             │
             ▼
As SPECs relacionadas foram alteradas ou respeitadas?
             │
             ▼
Os testes relacionados foram executados?
             │
             ▼
Existe risco de regressão?
             │
             ▼
Qual harness deve receber o próximo handoff?
```

---

# 26. Harnesses especializados sugeridos

A arquitetura do Reversa pode conter harnesses especializados.

## Implementation Harness

Responsável por implementar mudanças.

Entrada:

```text
objective
specs
bugs
constraints
```

Saída:

```text
diff
handoff
```

## Diff Auditor Harness

Responsável por analisar o escopo das alterações.

Perguntas:

- o diff está dentro do escopo?
- existem arquivos inesperados?
- houve alteração estrutural não declarada?
- o diff contém mudanças suspeitas?
- houve remoção excessiva?

## Spec Consistency Harness

Responsável por verificar consistência entre código e especificações.

Perguntas:

- o código continua refletindo a SPEC?
- a alteração exige atualização da SPEC?
- existe código sem especificação relacionada?

## Regression Harness

Responsável por definir e executar verificações de regressão.

## Bug Traceability Harness

Responsável por relacionar:

```text
BUG
SPEC
CODE
DIFF
TEST
HANDOFF
```

## Handoff Auditor Harness

Responsável por verificar a qualidade do handoff.

Perguntas:

- o objetivo está claro?
- o resumo explica as alterações?
- existem decisões não documentadas?
- os riscos foram identificados?
- existem pendências?
- o próximo passo é verificável?

---

# 27. Fluxo proposto para o Reversa

Uma possível execução:

```text
USER GOAL
   │
   ▼
META-HARNESS
   │
   ├── identifica objetivo
   ├── consulta SPECs
   ├── consulta bugs
   ├── consulta rastreabilidade
   │
   ▼
IMPLEMENTATION HARNESS
   │
   ├── implementa
   ├── gera handoff
   │
   ▼
DIFF CAPTURE
   │
   ▼
META-HARNESS
   │
   ├── compara objetivo
   ├── compara handoff
   ├── compara diff
   ├── consulta SPECs
   │
   ▼
DIFF AUDITOR
   │
   ▼
REGRESSION HARNESS
   │
   ▼
SPEC CONSISTENCY HARNESS
   │
   ▼
META-HARNESS
   │
   ├── aceita
   ├── rejeita
   ├── solicita correção
   └── delega próximo passo
```

---

# 28. Regra: nenhum harness termina com "done"

Uma regra forte pode ser definida:

> Nenhum harness finaliza uma execução apenas com uma indicação de conclusão.

Toda execução deve produzir um handoff validável.

Exemplo inválido:

```yaml
status: done
```

Exemplo mínimo aceitável:

```yaml
objective: BUG-042
status: implemented

summary:
  Corrigida a validação de senha.

diff_reference:
  base: abc123
  head: def456

verification:
  command: pytest tests/auth/test_login.py
  result: passed

unresolved_items: []

recommended_next_harness:
  regression-testing
```

---

# 29. Handoff como protocolo

Uma conclusão importante desta discussão é que o Reversa pode evoluir de uma simples ferramenta de engenharia reversa de especificações para uma arquitetura capaz de definir um **protocolo de transferência de trabalho entre harnesses**.

Esse protocolo pode estabelecer:

- formato;
- schema;
- campos obrigatórios;
- evidências;
- transições;
- critérios de aceitação;
- critérios de rejeição;
- versionamento.

Nome conceitual possível:

```text
Harness Handoff Protocol
```

Ou:

```text
Meta-Harness Handoff Protocol
```

Ou:

```text
Agentic Software Handoff Protocol
```

Uma possibilidade diretamente associada ao Reversa:

```text
Reversa Handoff Protocol
RHP
```

---

# 30. Hipótese arquitetural

A hipótese central pode ser formulada assim:

> Em desenvolvimento de software orientado por agentes, a continuidade confiável do trabalho depende de mecanismos explícitos de transferência de estado e validação de evidências.

O handoff transfere estado.

O diff registra mudança.

Os testes produzem evidências de comportamento.

As SPECs definem a intenção esperada.

O meta-harness cruza essas informações e controla a continuidade.

Formalmente:

```text
INTENT
   +
HANDOFF
   +
DIFF
   +
VERIFICATION
   =
DECISION CONTEXT
```

O meta-harness opera sobre esse contexto.

---

# 31. Princípio central

A principal conclusão da conversa é:

> O handoff é a declaração do agente. O diff é a evidência material. A verificação comprova comportamento. A SPEC representa a intenção. O meta-harness é o mecanismo que cruza essas informações e decide a continuidade do desenvolvimento.

Outra formulação:

> Diff mostra o que mudou. Handoff explica o que aconteceu. A verificação mostra se funciona. A SPEC diz o que deveria acontecer. O meta-harness compara tudo isso.

---

# 32. Direção para evolução do Reversa

A partir desta discussão, uma linha de evolução do Reversa seria:

1. definir um schema formal de handoff;
2. transformar handoff em artefato de primeira classe;
3. capturar diff automaticamente após execuções;
4. relacionar diff a bugs e SPECs;
5. criar validação handoff-diff;
6. separar claims de evidence;
7. introduzir harnesses especializados;
8. modelar o meta-harness como máquina de estados;
9. utilizar handoffs como eventos de transição;
10. manter uma matriz ou grafo de rastreabilidade entre:
   - bugs;
   - SPECs;
   - código;
   - diffs;
   - testes;
   - handoffs;
   - decisões;
   - harnesses;
11. impedir conclusão sem evidência;
12. permitir continuidade entre:
   - sessões do Claude Code;
   - sessões do Codex;
   - modelos diferentes;
   - harnesses diferentes;
   - agentes especializados.

---

# 33. Visão final

O Reversa já possui uma motivação relacionada à reconstrução e manutenção de especificações a partir do código.

Com meta-harness, handoff e diff, sua função pode se ampliar.

O Reversa pode atuar como uma camada de **coordenação, memória operacional e rastreabilidade para desenvolvimento agentic**.

Nesse modelo:

```text
SPEC define intenção.
BUG registra desvio.
HARNESS executa.
DIFF registra mudança.
HANDOFF registra estado e continuidade.
TEST fornece evidência.
META-HARNESS decide.
REVERSA mantém a rastreabilidade.
```

A arquitetura deixa de depender da memória temporária de uma sessão de LLM.

O estado do desenvolvimento passa a existir em artefatos explícitos, estruturados e auditáveis.

O objetivo não é fazer agentes conversarem mais.

O objetivo é fazer agentes **transferirem trabalho com evidências suficientes para que outro agente continue de forma confiável**.

Essa pode ser uma das bases conceituais para a adoção de **meta-harness no Reversa**.
