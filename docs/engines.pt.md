# Engines suportadas

O Reversa funciona com as principais engines de IA do mercado. O instalador detecta automaticamente quais estão presentes no ambiente, mas você pode adicionar mais a qualquer momento com `npx reversa add-engine`.

---

## Compatibilidade

| Engine | Arquivo criado | Skills path | Como ativar |
|--------|---------------|-------------|-------------|
| **Claude Code** ⭐ | `CLAUDE.md` | `.claude/skills/reversa-*/` e `.agents/skills/reversa-*/` | `/reversa` |
| **Codex** ⭐ | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Cursor** ⭐ | `.cursorrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Gemini CLI** | `GEMINI.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Windsurf** | `.windsurfrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Antigravity** | `AGENTS.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Kiro** | (nenhum) | `.kiro/skills/reversa-*/` e `.agents/skills/reversa-*/` | `/reversa` |
| **Opencode** | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Cline** | `.clinerules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Roo Code** | `.roorules` | `.agents/skills/reversa-*/` | `/reversa` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Aider** | `CONVENTIONS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Amazon Q Developer** | `.amazonq/rules/reversa.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Pi** | `AGENTS.md` | `.agents/skills/reversa-*/` | `/reversa` |

---

## Claude Code

A engine mais testada e com melhor suporte. Usa slash commands nativos, o que torna a ativação intuitiva. O Reversa cria os arquivos em `.claude/skills/` e em `.agents/skills/` (para compatibilidade com outras engines que possam ser adicionadas depois).

---

## Codex

Totalmente compatível. Como o Codex não usa slash commands, a ativação é pelo nome do agente diretamente: `reversa`, `reversa-scout`, etc. O arquivo `AGENTS.md` na raiz do projeto serve como ponto de entrada.

---

## Cursor

Compatível via `.cursorrules`. O Cursor lê as regras desse arquivo e os agentes ficam disponíveis como skills.

---

## Gemini CLI e Windsurf

Suporte completo. Os agentes ficam em `.agents/skills/` e são acessados via os mecanismos nativos de cada engine.

---

## Antigravity

Plataforma de desenvolvimento agêntico do Google, lançada em novembro de 2025. Lê `AGENTS.md` nativamente (mesmo arquivo do Codex). Se Codex já estiver instalado no projeto, o `AGENTS.md` existente é reaproveitado sem duplicação. Comando CLI: `agy`.

---

## Kiro

IDE agêntico da Amazon. O Kiro descobre skills nativamente em `.kiro/skills/`, sem necessidade de steering documents. O instalador coloca os agentes em `.kiro/skills/` (e também em `.agents/skills/` para compatibilidade com outras engines). A ativação é via `/reversa` ou auto-discovery pela descrição do skill.

---

## Opencode

Agente de codificação open source para terminal (SST). Lê `AGENTS.md` nativamente, mesma convenção do Codex. Comando CLI: `opencode`. Como Codex, a ativação é pelo nome do agente: `reversa`.

---

## Cline e Roo Code

Extensions de VS Code com suporte a regras personalizadas via `.clinerules` e `.roorules` respectivamente. O padrão é idêntico ao Cursor e Windsurf: arquivo de regras na raiz do projeto que instrui o agente ao ativar `/reversa`.

---

## GitHub Copilot

Usa `.github/copilot-instructions.md` como arquivo de instruções customizadas, lido automaticamente pelo Copilot em toda sessão. O instalador cria o arquivo dentro de `.github/` (que pode já existir no projeto).

---

## Aider

Agente de codificação para terminal. O entry file `CONVENTIONS.md` na raiz é passado via `--read CONVENTIONS.md` ou configurado em `.aider.conf.yml`. Como Codex e Opencode, a ativação é pelo nome: `reversa`.

---

## Amazon Q Developer

CLI de IA da AWS. Usa regras em `.amazonq/rules/` para instruir o agente por projeto. O instalador cria `.amazonq/rules/reversa.md` sem interferir em outras regras que você já tenha nessa pasta.

---

## Pi

Harness de agente minimalista do [pi.dev](https://pi.dev) (Earendil Inc.). Lê `AGENTS.md` (ou `CLAUDE.md`) no startup a partir do diretório atual e dos diretórios pai, e descobre skills seguindo o [padrão Agent Skills](https://agentskills.io) em `.agents/skills/` (subindo pelos diretórios pai). O Reversa instala o mesmo `AGENTS.md` usado por Codex/Antigravity/Opencode, e coloca as skills em `.agents/skills/` — sem duplicação para `.pi/skills/`. A ativação é via `/reversa` (slash command) ou `/skill:reversa`. Comando CLI: `pi`. O Reversa não cria `.pi/settings.json`, `.pi/extensions/` nem recursos project-local do pi, então o prompt de trust do pi não é disparado.

---

## Múltiplas engines no mesmo projeto

Você pode ter todas as engines instaladas ao mesmo tempo. Os agentes em `.agents/skills/` são compartilhados por todas. O instalador cria os arquivos de entrada específicos de cada engine sem conflito entre eles.

Se você trabalha em equipe e cada pessoa usa uma engine diferente, isso funciona normalmente: cada um usa o arquivo de entrada da sua engine, mas todos os agentes estão no mesmo lugar.
