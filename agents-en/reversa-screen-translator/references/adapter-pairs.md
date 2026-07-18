# Adapter Pairs

Map of source→target pairs supported in v1, with default recommended mode and canonical spec format to use in `target_screens.md`. Pairs not listed return `EC-01` and offer raw template.

## Master table

| Origin | Target | Recommended mode | Adapter | Spec format |
|---|---|---|---|---|
| `cobol-ansi-tui` | `go-cli` | literal | `cobol_ansi__go_cli` | `ansi-byte-stream` |
| `cobol-ansi-tui` | `rust-cli` | literal | `cobol_ansi__rust_cli` | `ansi-byte-stream` |
| `cobol-ansi-tui` | `web-spa` | modernized | `cobol_ansi__web_spa` | `component-tree` |
| `cobol-screen-section` | `go-cli` | literal | `cobol_screen__go_cli` | `ansi-byte-stream` |
| `ncurses-c` | `go-cli` | literal | `ncurses__go_cli` | `ansi-byte-stream` |
| `ncurses-c` | `rust-cli` | literal | `ncurses__rust_cli` | `ansi-byte-stream` |
| `delphi-vcl` | `web-spa` | modernized | `delphi_vcl__web_spa` | `component-tree` |
| `delphi-vcl` | `tauri` | modernized (with literal-ish option) | `delphi_vcl__tauri` | `component-tree` |
| `delphi-vcl` | `electron` | modernized | `delphi_vcl__electron` | `component-tree` |
| `delphi-firemonkey` | `flutter` | modernized | `delphi_firemonkey__flutter` | `composable` |
| `vb6` | `web-spa` | modernized | `vb6__web_spa` | `component-tree` |
| `vb6` | `tauri` | modernized | `vb6__tauri` | `component-tree` |
| `vbnet-winforms` | `web-spa` | modernized | `vbnet_winforms__web_spa` | `component-tree` |
| `csharp-winforms` | `web-spa` | modernized | `csharp_winforms__web_spa` | `component-tree` |
| `csharp-wpf` | `web-spa` | modernized | `csharp_wpf__web_spa` | `component-tree` |
| `win32-mfc` | `web-spa` | modernized | `win32_mfc__web_spa` | `component-tree` |
| `win32-raw` | `web-spa` | modernized | `win32_raw__web_spa` | `component-tree` |
| `asp-classic` | `web-spa` (React/Vue/Svelte) | modernized | `asp_classic__spa` | `route-component` |
| `aspnet-webforms` | `web-spa` | modernized | `aspnet_webforms__spa` | `route-component` |
| `jsp` | `web-spa` | modernized | `jsp__spa` | `route-component` |
| `php-server-rendered` | `web-spa` | modernized | `php__spa` | `route-component` |
| `html-legacy-jquery` | `web-spa` | modernized | `html_legacy__spa` | `route-component` |
| `android-xml-java` | `flutter` | modernized | `android_xml__flutter` | `composable` |
| `android-xml-java` | `compose` | modernized (close language) | `android_xml__compose` | `composable` |
| `android-xml-kotlin` | `compose` | modernized (close language) | `android_xml_kt__compose` | `composable` |
| `ios-xib-objc` | `flutter` | modernized | `ios_xib_objc__flutter` | `composable` |
| `ios-xib-objc` | `swiftui` | modernized (close language) | `ios_xib_objc__swiftui` | `composable` |
| `ios-xib-swift` | `swiftui` | modernized (close language) | `ios_xib_swift__swiftui` | `composable` |

## Available modes per pair

For each pair, in general three modes are presented to the user, but some combinations have **infeasible** literal mode. The table below restricts it.

| Pair | literal viable? | Why |
|---|---|---|
| `cobol-ansi-tui` → `go-cli` | yes | textual terminals respect ANSI byte-by-byte |
| `cobol-ansi-tui` → `web-spa` | no | terminal has no literal equivalent in DOM; refuses literal mode |
| `delphi-vcl` → `web-spa` | partial | only with legacy screenshot and explicit acceptance; pixel-perfect rare |
| `win32-mfc` → `web-spa` | no | refuses literal mode; recommends modernized |
| `android-xml-*` → `flutter` | partial | only with screenshots per density; pixel-perfect depends on font |
| `android-xml-*` → `compose` | partial | same language, closer, but widgets diverge |
| `ios-xib-*` → `swiftui` | partial | same platform, but constraints and auto-layout diverge |

When `literal` is not viable, the agent presents only modernized and hybrid as options, and explains to the user why literal was discarded.

## Spec format per kind

### `ansi-byte-stream` (textual terminals)

Each line as a `bytes` block containing the literal sequence, including ANSI escapes. Use `\x1b[...m` for colors. Interpolations declared with `interpolations.<name>` per line. User inputs via `spec.input_prompts`.

Typical target implementation: one function per screen in `pkg/menu/screens.<ext>` that writes to `io.Writer`.

### `component-tree` (graphical desktop/web/mobile, modernized mode)

Hierarchy of nominal components (`PageLayout`, `Form`, `FormField`, `Button`, ...). Tokens referenced in `tokens: [...]`. Events in `submit_event`, `action`. States in `spec.states: [idle, loading, error, success]`. Messages per state in `spec.state_messages`.

Target implementation: free framework (React, Vue, Svelte, SwiftUI, Compose, Tauri webview, etc.) unless `target_architecture.md` already fixed a specific framework.

### `route-component` (modernized web from server-rendered)

Includes `spec.route` (canonical target URL) and `spec.layout` (parent layout). Body is a `component-tree`. `spec.api_changes` lists HTTP contract changes between legacy and target (URL, method, content-type), referencing deviations.

### `composable` (mobile cross-platform)

`spec.composable` block with declarative pseudocode in the target language (Flutter Dart, Compose Kotlin, SwiftUI Swift). Includes `spec.viewmodel` when the target separates view and state.

### `raw-prose` (EC-01 fallback)

When the adapter does not cover the pair. Content is structured prose with mandatory sections (identity, layout, fields, messages, events, validations). Each screen in `raw-prose` must have a registered deviation pointing that the coder will need to interpret the prose.

## Special inputs and states

Every spec, in any kind, can include:

- `spec.normalize`: rules accepted in comparison with golden file (line endings, trailing spaces, trim ANSI, etc.).
- `spec.interpolations`: points where dynamic domain data enters (e.g.: `{{holder}}`, `{{balance}}`). With types and constraints (max_width, regex, lookup).
- `spec.transitions`: list of events that lead to another screen.
- `spec.legacy_origin`: `file:line` or `file:paragraph` path in the legacy.
- `spec.deviations`: `DEV-XXX` ids that affect the screen.

## Pairs not covered in v1

- Platforms with custom rendering (Canvas HTML5, OpenGL, games): return `EC-01`.
- 3D, AR/VR: out of scope (NG-07).
- Voice / conversational: out of scope.
- Discontinued embedded plugins (Crystal Reports, Flash, ActiveX): handled in v2 (OQ-03).

New pairs can be added as rows in this table, together with a descriptive adapter (not code, it is textual heuristic used by the agent to generate the spec).
