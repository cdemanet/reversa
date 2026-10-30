# Equipo de Front-end (Impeccable)

El **Equipo de Front-end** es [Impeccable](https://github.com/pbakaus/impeccable), el framework de diseño creado por [Paul Bakaus](https://github.com/pbakaus), entregado junto con Reversa bajo la [Apache License 2.0](https://github.com/sandeco/reversa/blob/main/agents/impeccable/LICENSE). Es una sola skill con 24 comandos de diseño para sitios, landing pages, dashboards, UI de producto, componentes, formularios y pantallas nativas iOS o Android.

Marcado por defecto en el instalador. Se instala como la skill `impeccable`, junto a los agentes de Reversa.

---

## Por qué está aquí

Reversa extrae specs y produce código a partir de ellas; el agente Design System registra los tokens que un legado ya tiene. Nada de eso hace que una pantalla nueva o reconstruida se vea bien. Impeccable cubre ese hueco: trabaja como un director de arte, con punto de vista, piso de calidad y verificación del resultado renderizado, y evita los vicios que todo modelo repite (las mismas fuentes, gradientes y tarjetas anidadas).

---

## Cómo usar

```
/impeccable init                 una vez por proyecto: registra la verdad del producto en PRODUCT.md
/impeccable critique landing     revisión de UX con puntuación heurística
/impeccable audit checkout       chequeos de a11y, rendimiento y responsive
/impeccable polish settings      pasada final antes de entregar
/impeccable bolder hero          amplifica un diseño soso
/impeccable harden forms         errores, i18n, overflow, casos límite
/impeccable                      sin argumento: menú sensible al contexto
```

Comandos por categoría:

| Categoría | Comandos |
|-----------|----------|
| Build | `shape`, `init`, `document`, `extract` |
| Evaluate | `critique`, `audit` |
| Refine | `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard` |
| Enhance | `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive` |
| Fix | `clarify`, `adapt`, `optimize` |
| Iterate | `live`, `generate` |

En motores sin slash command (Codex, Hermes) escribe `impeccable <comando> <objetivo>`.

### El binario del engine

La skill trae un launcher pequeño (`scripts/impeccable`, más `impeccable.cmd` para Windows). En la primera ejecución descarga el binario del engine para tu plataforma en `~/.impeccable/bin/`; no necesita Node. Los sandboxes sin red pueden preinstalar el binario y apuntar `IMPECCABLE_BIN` a él.

### Hook detector opcional

Impeccable puede ejecutar un detector determinístico después de cada edición de UI. Reversa no instala ese hook, porque nunca toca `.claude/settings.json`. Actívalo tú mismo con `/impeccable hooks on`.

---

## Qué cambia Reversa y qué no

Reversa lleva la skill upstream sin cambios: `SKILL.md`, los playbooks de `reference/`, el launcher y los archivos de datos, más la marca de Codex (`agents/openai.yaml`) y los archivos `LICENSE` y `NOTICE.md`. Nada se reescribe. La procedencia (versión, tag, commit, fecha) queda en `agents/impeccable/reversa-bundle.json`.

Los subagentes de Claude Code y la configuración de hooks del repositorio upstream no se incluyen; la skill tiene modo degradado para los primeros y el hook es decisión del usuario.

---

## Mantenerlo al día

`scripts/sync-impeccable.mjs` resuelve la última tag de release del upstream (`skill-vX.Y.Z`), la clona y reemplaza `agents/impeccable/`. Un GitHub Action lo ejecuta a diario; cuando hay release nueva incrementa el patch de Reversa y abre un pull request. Tras publicar el merge, `npx reversa update` reinstala todos los agentes, así que tu proyecto recibe el Impeccable nuevo sin pasos extra.

```bash
node scripts/sync-impeccable.mjs            # última release
node scripts/sync-impeccable.mjs --tag skill-v4.7.0
node scripts/sync-impeccable.mjs --check    # solo compara
```

---

## Créditos

Impeccable es creado y mantenido por **[Paul Bakaus](https://github.com/pbakaus)**. La skill, los 24 comandos, las reglas del detector y la guía de diseño son obra suya; Reversa solo empaqueta y distribuye una copia sin cambios como su Equipo de Front-end.

Reversa podría haber hecho ingeniería inversa de la documentación de Impeccable y reconstruido su guía con nombre propio. Eso sería deshonesto e injusto con el autor, que hizo un excelente trabajo al producir una biblioteca de diseño de front-end tan buena. Por eso Reversa entrega su obra tal como está, bajo su licencia, y le da el reconocimiento que merece por ese trabajo.

- Código fuente: [github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- Sitio y documentación: [impeccable.style](https://impeccable.style)
- Releases usadas por Reversa: [github.com/pbakaus/impeccable/releases](https://github.com/pbakaus/impeccable/releases)

---

## Licencia

Impeccable es Copyright Paul Bakaus, con licencia Apache License 2.0. El texto de la licencia y los avisos de terceros viajan con la skill en `agents/impeccable/LICENSE` y `agents/impeccable/NOTICE.md`, y se instalan en tu proyecto junto con ella. Reversa sigue siendo MIT.
