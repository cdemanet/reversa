# Guia com analogias

Não sabe qual agente chamar? Ativa o guia:

```
/reversa-agents-help
```

Ele explica cada agente com uma analogia do mundo real. Mas já que você está aqui, aqui vai o resumo completo:

---

## Menu principal

| O que você quer fazer? | Comando | Time |
|---|---|---|
| Descobrir e documentar um sistema legado | `/reversa` | Reversa Agents Core |
| Criar um projeto novo a partir de uma ideia | `/reversa-new` | Code New Project Agents |
| Implementar ou evoluir código a partir das specs | `/reversa-forward` | Code Forward Agents |
| Planejar a migração de um legado | `/reversa-migrate` | Migration Agents |
| Gerar um mini-site visual da documentação | `/reversa-docs` | Documentation Agents |
| Descobrir como vender e quanto cobrar pelo software ou por uma feature | `/reversa-pricing` | Pricing and Size Agents |
| Entender qual agente usar | `/reversa-agents-help` | Guia de agentes |

O time de Pricing entra por `/reversa-pricing`. Translators usam `/reversa-n8n`.

---

## Orquestradores e agentes do Core

### 🆕 Reversa New: o fundador de produto

O fundador começa com uma ideia ainda bruta, investiga o problema, entende para quem o produto existe, consolida um PRD e transforma tudo em especificações prontas para implementação.

> Use `/reversa-new` para projetos greenfield. Ele conduz `Ideator → Researcher → Drafter → Spec SDD` e entrega o resultado ao `/reversa-forward`.

### 🎼 Reversa: o regente de orquestra

Um regente não toca nenhum instrumento. Ele conhece a partitura inteira e diz quem entra quando, em que ordem, em que ritmo. Sem ele, cada músico tocaria sua parte sem se conectar com os outros.

> Use `/reversa` para iniciar ou retomar a análise completa. Ele cuida da sequência por você.

---

### 🗺️ Scout: o corretor de imóveis

O corretor faz o primeiro tour no imóvel. Não abre gavetas, não lê documentos, não mexe em nada. Só mapeia: quantos cômodos, qual o bairro, que instalações existem, qual o estado geral.

> Use o Scout no começo. Ele gera o inventário do projeto sem entrar na lógica do código.

---

### ⛏️ Archaeologist: o escavador

O arqueólogo escava o terreno com paciência, camada por camada. Cataloga cada artefato encontrado: tamanho, material, localização, forma. Ele não interpreta a civilização, só descreve com precisão o que está lá.

> Use o Archaeologist para analisar o código módulo a módulo. Roda um módulo por sessão para economizar tokens.

---

### 🔍 Detective: Sherlock Holmes

Sherlock Holmes chega depois do arqueólogo. Olha para os artefatos catalogados e pergunta: *"Mas por que isso está aqui? Quem colocou? O que isso revela sobre quem viveu aqui?"* Ele não escava. Ele interpreta.

> Use o Detective após o Archaeologist. Ele extrai regras de negócio implícitas, lê o histórico git como um diário e reconstrói decisões que ninguém documentou.

---

### 📐 Architect: o cartógrafo

O cartógrafo visita um território e produz mapas formais: planta baixa, mapa de elevação, planta estrutural. Alguém que nunca pisou lá consegue entender tudo olhando para os mapas.

> Use o Architect após o Detective. Ele sintetiza tudo em diagramas C4, ERD completo e mapa de integrações.

---

### 📝 Writer: o tabelião

O tabelião transforma o que foi descoberto em contratos formais, precisos e rastreáveis. Cada cláusula tem grau de certeza declarado. O documento vale como contrato: um agente de IA pode reimplementar o sistema a partir dele.

> Use o Writer após o Architect. Ele gera specs SDD, OpenAPI e user stories com rastreabilidade de código.

---

### ⚖️ Reviewer: o revisor de specs

O Reviewer pega os contratos do Writer e tenta furar: *"Isso é contradição. Esse ponto não tem prova. Essa regra some se o usuário fizer X."* Ele não quer destruir, quer garantir que o que ficou de pé seja sólido.

> Use o Reviewer após o Writer. Ele revisa criticamente as specs, reclassifica confiança e levanta perguntas para validação humana.

---

### 🖼️ Visor: o ilustrador forense

O ilustrador forense trabalha só com imagens. Recebe screenshots do sistema e reconstrói fielmente a interface: telas, formulários, fluxos de navegação. Não precisa que o sistema esteja rodando. Só das fotos.

> Use o Visor quando tiver screenshots disponíveis. Ele documenta a UI sem precisar de acesso ao sistema.

---

### 🗄️ Data Master: o geólogo

O geólogo mapeia o subsolo: a camada que ninguém vê mas que sustenta tudo. Tabelas, relacionamentos, constraints, triggers, procedures. A fundação invisível sobre a qual a aplicação está construída.

> Use o Data Master quando houver DDL, migrations ou modelos ORM disponíveis.

---

### 🎨 Design System: o estilista

O estilista cataloga o guarda-roupa: paleta de cores, tipografia, espaçamentos, tokens de design. As "regras de moda" que governam a aparência do sistema.

> Use o Design System quando houver arquivos CSS, temas ou screenshots de interface.

---

## 💰 Reversa Pricing: o consultor de preço
**Comando:** `/reversa-pricing`

Um bom consultor de preço não começa pelo número. Antes, ele pergunta como você quer vender: por encomenda para um cliente, como licença, aluguel, assinatura ou numa loja de apps. Só depois de saber o modelo ele chama cada especialista: quem pesquisa o mercado, quem anota como você cobra, quem mede a obra, quem monta o orçamento e quem calcula quantos clientes pagam a conta. No fim, você nunca recebe um número só: recebe faixas, cenários e o que cada preço exige.

> Use o Reversa Pricing quando quiser saber quanto cobrar pelo software ou por uma feature, seja você iniciante ou experiente. Ele detecta onde você parou em `_pricing/` e conduz `Advisor → Profile → Product` (produto) ou `Size → Estimate` (serviço, por feature). O Research entra quando você prefere pesquisar em vez de informar.

**Os seis especialistas:**

| Agente | Analogia | Comando |
|---|---|---|
| **Advisor** | O consultor que pergunta como você quer vender antes de falar em número | `/reversa-pricing-advisor` |
| **Research** | O pesquisador que vai ao mercado e volta com faixa, fonte e data | `/reversa-pricing-research` |
| **Profile** | O contador que anota como você cobra, ou pesquisa por você | `/reversa-pricing-profile` |
| **Size** | O engenheiro que mede a obra pela planta, não pelo tijolo | `/reversa-pricing-size` |
| **Estimate** | O orçamentista que entrega três cenários, nunca um número só | `/reversa-pricing-estimate` |
| **Product** | O planejador que diz quantos clientes pagam a conta em cada preço | `/reversa-pricing-product` |

---

## Sequência recomendada

```
Projeto legado: /reversa → descoberta e especificações
Projeto novo:   /reversa-new → PRD e specs → /reversa-forward
Migração:       /reversa → /reversa-migrate → /reversa-forward
Precificar:     /reversa-pricing → advisor → profile → product | size → estimate

Pipeline legado manual:
Scout → Archaeologist (N sessões) → Detective → Architect → Writer → Reviewer

Opcionais em qualquer fase:
Visor · Data Master · Design System · Reversa Docs
```
