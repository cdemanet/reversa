# Melhorias no Reversa para tornar o /reversa-debugger mais efetivo

> Post-mortem acionável escrito a partir do caso `mira-studio-full`, onde o
> `/reversa-debugger` fechou 8 bugs como "fixed" e ainda assim entregou uma
> gravação que nunca funcionou no navegador. O objetivo aqui não é o caso, é o
> processo: o que mudar no framework para que isso não se repita em nenhuma feature.

## TL;DR

O debugger não falhou por diagnosticar mal. Falhou no **gate de fechamento**: aceitou
"verde sintético" como prova de conserto numa feature que só pode ser provada no
navegador real, e deixou um achado crítico de inspeção ser fechado mesmo depois de
ele dizer "não feche". As melhorias abaixo endurecem exatamente esses dois pontos.

---

## A causa raiz, em uma frase

**Nada no laço do debugger tocou a realidade da feature uma única vez.** A gravação é
100% runtime de navegador (`getDisplayMedia`, Element Capture, WebCodecs, muxer). O
harness rodava num sandbox sem navegador. Sem realidade no laço, todo teste degenerou
em regex sobre o código-fonte, e "verde" passou a provar que o código *contém* linhas,
não que a feature *funciona*. A partir daí tudo desce em cascata:

1. Teste vira regex sobre fonte, não comportamento.
2. Closure policy `local-software` aceita esse verde como `fixed`.
3. O oráculo errado embarca sem contestação.
4. O fail-closed realoca o sintoma (vídeo preto vira "gravação morre ao iniciar") e ainda passa verde.
5. O pente-fino diagnostica certo, mas o gate fecha o bug por cima dele.

---

## Melhoria 1: classe de verificação "browser-only" na closure policy

**Problema.** A política `local-software` fecha bug com "regressão verde + veredito". Para
features de runtime de navegador (captura de tela, mídia, WebCodecs, WebGPU, canvas,
áudio), verde de teste em Node não prova nada. No caso, o `DONE.md` do CGU3 rebaixou a
prova real a "confirmação recomendada, não bloqueia o fechamento". Esse é exatamente o buraco.

**Mudança.** Criar uma classe de closure `browser-runtime` que **exige um artefato real**
antes de aceitar `fixed`. Para a gravação isso seria o MP4 1920x1080 com o `.fmt-frame`,
ou o `window.__miraLastRecordingDiagnostics` capturado de uma tentativa real. Enquanto o
artefato não existir, o estado máximo do bug é `awaiting-human-verification`, nunca `fixed`.

**Regra prática.** No intake, o escrivão classifica a feature. Se ela depende de API que
o harness não consegue executar (lista explícita: mídia, captura, GPU, permissões nativas,
File System Access), o bug nasce marcado `verification: browser-runtime` e herda a closure
mais estrita. O corretor pode propor o diff, mas quem fecha é a evidência binária do usuário.

## Melhoria 2: achado crítico de inspeção BLOQUEIA o fechamento

**Problema.** O pente-fino de 17/07 cravou F-conformidade-01 (critical) e escreveu, com
todas as letras, "o veredito de spec do CGU3 não deveria ser aceito enquanto o oráculo não
seguir RF-05". No dia seguinte o `/reversa-debugger-fix` fechou o CGU3 assim mesmo. O
diagnóstico estava certo e o gate simplesmente passou por cima.

**Mudança.** Um achado com `suspected_severity: critical` e `promoted_to` apontando para um
bug ativo vira um **bloqueio duro**: aquele bug não pode receber `DONE.md` enquanto o achado
não for explicitamente resolvido ou rebaixado, com justificativa registrada. O fechamento
precisa referenciar o `finding_id` e dizer por que ele não vale mais. Silêncio não fecha.

## Melhoria 3: proibir "teste de presença de string" como prova de comportamento

**Problema.** `recording-health.test.cjs` e `recording-oracle.test.cjs` liam o `.js` como
texto e casavam regex. Provaram que o código fail-closed *existe*, não que a gravação
funciona. A suíte golden frame-a-frame (RF-13 da própria spec) nunca foi implementada, e
foi justamente por isso que a regressão que desabilita a gravação embarcou "verde".

**Mudança.** O corretor deve rotular cada teste que escreve como `static` (regex/AST sobre
fonte) ou `behavioral` (executa o caminho e observa o efeito). Um bug de comportamento
**não pode** ser fechado só com testes `static`. Se a spec define uma suíte de comportamento
(como o RF-13 golden) e ela não existe, isso é uma pendência que bloqueia o `fixed`, não uma
"observação de cobertura" que fica no rodapé do relatório.

## Melhoria 4: fail-closed que muda o sintoma não é conserto

**Problema.** O CGU3 fez o pipeline rejeitar `encoded === 0`. Isso transformou "vídeo preto"
em "a gravação morre logo após iniciar". O defeito foi realocado, não resolvido, e mesmo
assim foi fechado. Foi isso que "acabou com a feature".

**Mudança.** Quando a correção é fail-closed (passa a abortar em vez de produzir saída ruim),
o corretor é obrigado a responder por escrito: "qual é o caminho feliz que agora produz saída
CORRETA, e onde está a prova dele?". Fail-closed sem um caminho feliz provado é contenção de
dano, e o bug fica `mitigated`, nunca `fixed`. São estados diferentes e o usuário precisa ver
a diferença.

## Melhoria 5: cuidado com o veredito "spec-desatualizada"

**Observação honesta.** Neste caso o adendo do CGU3 (`spec-desatualizada`) estava
tecnicamente correto: trocou "getSettings tem que ser 16:9" por "leia frames até chegar um na
proporção da sessão", raciocinando bem a partir da documentação das APIs. Ou seja, o mecanismo
de adendo versionado e imutável funcionou como projetado. **Mas** a feature continuou quebrada
depois dele, porque a nova lógica também nunca rodou no Chrome.

**Risco a vigiar.** `spec-desatualizada` é o veredito mais perigoso do debugger, porque ele
faz o "erro" desaparecer no papel: reescreve a régua até o código passar. Aqui foi usado com
integridade, mas o processo precisa de um freio para quando não for. Sugestão: todo veredito
`spec-desatualizada` numa feature `browser-runtime` só vale **depois** da evidência real que a
Melhoria 1 exige. Mudar a spec e fechar o bug no mesmo passo, sem tocar a realidade, é a
combinação que produz "documento perfeito, feature morta".

## Melhoria 6: gate de integração acima do gate por bug

**Problema.** Cada um dos 8 bugs foi fechado e travado em isolamento (`DONE.md` = pasta
somente-leitura). O fix do MILD trouxe o `WIDE`/`discardMismatch`; o fix do CGU3 trouxe o
oráculo bloqueante. Cada um "pronto" localmente, enquanto a gravação inteira nunca funcionou
de ponta a ponta. Ninguém perguntou "a feature toda grava?".

**Mudança.** Quando N bugs compartilham a mesma feature (mesmo contexto agregador), o último a
fechar dispara um **gate de integração**: um teste único de ponta a ponta da feature (aqui:
"aperta gravar, para, e sai um MP4 correto"). Nenhum `DONE.md` do grupo é definitivo enquanto
esse gate não tiver uma passada real registrada. Bugs fechados em sequência não somam a uma
feature que funciona.

## Melhoria 7: o intake deve capturar "isso já funcionou alguma vez?"

**Problema.** O `mira-record.js` do deck era o arquivo herdado do 9:16 remendado com flags
(`__miraFormat`, `__miraElemCapture`). Os dois caminhos brigavam dentro do mesmo arquivo, e a
diretriz de "mudança cirúrgica" empurrou o debugger para condicional-em-cima-de-condicional em
vez do fork limpo (`mira-record-16x9.js` dedicado) que resolveu de fato na pasta separada.

**Mudança.** No intake, uma pergunta obrigatória: "essa feature já funcionou nesse deck alguma
vez, ou está sendo construída agora?". Se a resposta é "nunca funcionou", o problema não é
*bug* (regressão de algo que andava), é *feature incompleta*, e o caminho certo pode ser
reescrita/fork, não remendo cirúrgico. O debugger é bom em consertar regressão; ele não deveria
tentar *terminar de construir* uma feature via correções cirúrgicas sucessivas.

---

## Por que a pasta separada deu certo (a lição de fundo)

A versão perfeita evoluiu com **você como o navegador no laço**: a pasta `updates/` mostra
iteração viva contra a API real, apertando gravar no Chrome a cada volta. O feedback do mundo
real substituiu o verde sintético do sandbox, e a separação em `mira-record-16x9.js` matou a
briga de flags.

Nenhuma das melhorias acima tenta "colocar um navegador dentro do reversa". A conclusão é mais
simples: **quando a verdade da feature só existe no navegador, o humano é parte não-opcional do
gate.** O papel do framework é parar de esconder isso atrás de verde sintético e passar a exigir
a evidência real, alto e claro, antes de escrever `fixed`.

## Resumo das mudanças, em ordem de impacto

1. Closure class `browser-runtime` que exige artefato real antes de `fixed` (Melhoria 1).
2. Achado crítico de inspeção bloqueia o fechamento do bug (Melhoria 2).
3. Testes rotulados `static` vs `behavioral`; `static` não fecha bug de comportamento (Melhoria 3).
4. Fail-closed sem caminho feliz provado = `mitigated`, não `fixed` (Melhoria 4).
5. `spec-desatualizada` em feature browser-runtime só vale após evidência real (Melhoria 5).
6. Gate de integração da feature acima dos gates por bug (Melhoria 6).
7. Intake distingue "regressão" de "feature nunca funcionou" e evita remendo onde cabe fork (Melhoria 7).
