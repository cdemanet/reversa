# Time de Front-end (Impeccable)

O **Time de Front-end** é o [Impeccable](https://github.com/pbakaus/impeccable), framework de design criado por [Paul Bakaus](https://github.com/pbakaus), entregue junto com o Reversa sob a [Apache License 2.0](https://github.com/sandeco/reversa/blob/main/agents/impeccable/LICENSE). É uma skill única com 24 comandos de design para sites, landing pages, dashboards, UI de produto, componentes, formulários e telas nativas iOS ou Android.

Marcado por padrão no instalador. Instalado como a skill `impeccable`, ao lado dos agentes do Reversa.

---

## Por que está aqui

O Reversa extrai specs e produz código a partir delas; o agente Design System registra os tokens que um legado já tem. Nada disso faz uma tela nova ou reconstruída ficar boa. O Impeccable preenche essa lacuna: trabalha como um diretor de arte, com ponto de vista, piso de qualidade e verificação do resultado renderizado, e evita os vícios que todo modelo repete (as mesmas fontes, gradientes e cards aninhados).

---

## Como usar

```
/impeccable init                 uma vez por projeto: grava a verdade do produto em PRODUCT.md
/impeccable critique landing     revisão de UX com pontuação heurística
/impeccable audit checkout       checagens de a11y, performance e responsividade
/impeccable polish settings      passada final antes de entregar
/impeccable bolder hero          amplifica um design sem graça
/impeccable harden forms         erros, i18n, overflow, casos de borda
/impeccable                      sem argumento: menu sensível ao contexto
```

Comandos por categoria:

| Categoria | Comandos |
|-----------|----------|
| Build | `shape`, `init`, `document`, `extract` |
| Evaluate | `critique`, `audit` |
| Refine | `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard` |
| Enhance | `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive` |
| Fix | `clarify`, `adapt`, `optimize` |
| Iterate | `live`, `generate` |

Em engines sem slash command (Codex, Hermes) digite `impeccable <comando> <alvo>`.

### O binário do engine

A skill traz um launcher pequeno (`scripts/impeccable`, mais `impeccable.cmd` para Windows). Na primeira execução ele baixa o binário do engine para a sua plataforma em `~/.impeccable/bin/`; não precisa de Node. Sandboxes sem rede podem pré-instalar o binário e apontar `IMPECCABLE_BIN` para ele.

### Hook detector opcional

O Impeccable pode rodar um detector determinístico depois de cada edição de UI. O Reversa não instala esse hook, porque nunca toca em `.claude/settings.json`. Ligue você mesmo com `/impeccable hooks on`.

---

## O que o Reversa muda e o que não muda

O Reversa carrega a skill upstream sem alteração: `SKILL.md`, os playbooks em `reference/`, o launcher e os arquivos de dados, mais a marca do Codex (`agents/openai.yaml`) e os arquivos `LICENSE` e `NOTICE.md`. Nada é reescrito. A proveniência (versão, tag, commit, data) fica em `agents/impeccable/reversa-bundle.json`.

Os subagentes do Claude Code e as configurações de hook do repositório upstream não vêm junto; a skill tem modo degradado para os primeiros e o hook é escolha do usuário.

---

## Mantendo atualizado

`scripts/sync-impeccable.mjs` descobre a última tag de release do upstream (`skill-vX.Y.Z`), clona e substitui `agents/impeccable/`. Um GitHub Action roda isso diariamente; quando há release nova ele incrementa o patch do Reversa e abre um pull request. Depois do merge publicado, `npx reversa update` reinstala todos os agentes, então seu projeto recebe o Impeccable novo sem passo extra.

```bash
node scripts/sync-impeccable.mjs            # última release
node scripts/sync-impeccable.mjs --tag skill-v4.7.0
node scripts/sync-impeccable.mjs --check    # só compara
```

---

## Créditos

O Impeccable é criado e mantido por **[Paul Bakaus](https://github.com/pbakaus)**. A skill, os 24 comandos, as regras do detector e a orientação de design são obra dele; o Reversa apenas empacota e distribui uma cópia sem alterações como seu Time de Front-end.

O Reversa poderia ter feito a engenharia reversa da documentação do Impeccable e reconstruído a orientação dele com nome próprio. Isso seria desonesto e injusto com o autor, que fez um excelente trabalho ao produzir uma biblioteca de design de front-end tão boa. Por isso o Reversa entrega a obra dele como está, sob a licença dele, e dá a ele o reconhecimento que merece por esse trabalho.

- Código-fonte: [github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- Site e documentação: [impeccable.style](https://impeccable.style)
- Releases usadas pelo Reversa: [github.com/pbakaus/impeccable/releases](https://github.com/pbakaus/impeccable/releases)

---

## Licença

O Impeccable é Copyright Paul Bakaus, licenciado sob a Apache License 2.0. O texto da licença e os avisos de terceiros viajam com a skill em `agents/impeccable/LICENSE` e `agents/impeccable/NOTICE.md`, e são instalados no seu projeto junto com ela. O Reversa continua MIT.
