---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_screens
producedBy: screen-translator
mode: literal | modernized | hybrid
sourcePlatform: <slug>
targetPlatform: <slug>
adapter: <adapters/source__target>
screenCount: <int>
hash: "sha256:<hash of the body below the front-matter>"
---

# Target Screens

> Executable specification of each screen of the new system, derived from the legacy per the mode approved in `screen_modernization_decision.md`. Textual content preserved literally, unless explicit approval for linguistic revision.
> Primary reading for the coder. Each section is a contract.

## Summary

- **Applied mode**: <literal | modernized | hybrid>
- **Generated screens**: <N>
- **Adapter**: <slug>
- **Consumed tokens**: see `_reversa_sdd/design-system/tokens.md` and `tokens-derived.md` when applicable
- **Golden files**: <N> in `_reversa_sdd/screens/golden/` (manifest in `golden/manifest.yaml`)
- **Registered deviations**: <N> in `screen_deviation_log.md`

> If the legacy has no UI (batch / API / daemon system), replace this section with:
> "No screens detected. Agent skipped in `skipped` mode. Next agent: Inspector."

---

## Screen: <canonical-name>

**Origin**: `<legacy-file>:<line-or-paragraph>`
**Applied mode**: literal | modernized
**Design-system components**: [<token1>, <token2>, ...]
**Interpolation points**: `{{var1}}`, `{{var2}}`
**Exit transitions**: [<next screen or event>]
**Critical screen?**: yes | no (consult `reversa-detective` when available)

### Specification

> The block below varies per source→target pair and mode. See `references/adapter-pairs.md` for the canonical format of each pair. Examples below.

#### Example: COBOL TUI → Go CLI/TUI (literal)

```yaml
spec.kind: ansi-byte-stream
spec.normalize:
  - trim_trailing_spaces: false
  - line_endings: "\n"
spec.lines:
  - bytes: "\x1b[96m╔══════════════════════════════════════════════════╗\x1b[0m\n"
  - bytes: "\x1b[96m║                \x1b[93m▓▓▓  BANK ATM  ▓▓▓\x1b[96m               ║\x1b[0m\n"
  - bytes: "\x1b[96m║                  \x1b[97m{{header_subtitle}}\x1b[96m                ║\x1b[0m\n"
    interpolations:
      header_subtitle:
        type: string
        max_width: 16
        source: literal "Cash Machine" | literal "System Access"
  - bytes: "\x1b[96m╚══════════════════════════════════════════════════╝\x1b[0m\n"
spec.input_prompts:
  - kind: accept-line
    prompt_bytes: "   \x1b[96m>>\x1b[97m Select an option: \x1b[0m"
    captures: option
    valid: ["0", "1", "2", "3", "4", "5"]
```

#### Example: Win32/Delphi VCL → Web SPA (modernized)

```yaml
spec.kind: component-tree
spec.states: [idle, loading, error, success]
spec.root:
  component: PageLayout
  variant: form
  children:
    - component: Header
      tokens: [color.brand-primary, typography.h1]
      content:
        text: "Client Registration"
    - component: Form
      submit_event: client.create
      children:
        - component: FormField
          name: name
          label: "Full name"
          legacy_origin: "TForm1.edtName"
          validation:
            required: true
            max_length: 80
        - component: FormField
          name: ssn
          label: "SSN"
          legacy_origin: "TForm1.mskSSN"
          mask: "999.999.999-99"
          validation:
            required: true
            ssn: true
    - component: ButtonRow
      children:
        - component: Button
          variant: primary
          label: "Save"
          legacy_origin: "TForm1.btnSave"
          action: form.submit
        - component: Button
          variant: ghost
          label: "Cancel"
          legacy_origin: "TForm1.btnCancel"
          action: navigate.back
spec.state_messages:
  loading: "Saving..."
  error: "{{error_message}}"
  success: "Client registered successfully."
```

#### Example: Legacy server-rendered HTML → componentized SPA (modernized)

```yaml
spec.kind: route-component
spec.route: /clients/new
spec.layout: AppLayout
spec.states: [idle, loading, error, success]
spec.component:
  component: ClientsNewPage
  legacy_origin: "/admin/client_new.asp"
  state:
    client:
      type: Client
      initial: empty
  children:
    - component: PageTitle
      content: "New Client"
    - component: ClientForm
      props:
        onSubmit: clientService.create
        initial: $state.client
spec.api_changes:
  - legacy: POST /admin/client_new.asp (form-urlencoded)
    target: POST /api/clients (application/json)
    deviation: DEV-014
```

#### Example: Android XML → Flutter (modernized)

```yaml
spec.kind: composable
spec.name: ClientListScreen
spec.legacy_origin: "app/src/main/res/layout/activity_client_list.xml + ClientListActivity.java"
spec.states: [idle, loading, error, success]
spec.composable: |
  Scaffold(
    appBar: AppBar(title: Text("Clients")),
    body: Consumer<ClientListVM>(
      builder: (ctx, vm, _) => vm.loading
        ? CircularProgressIndicator()
        : ListView.builder(
            itemCount: vm.clients.length,
            itemBuilder: (_, i) => ClientListTile(client: vm.clients[i]),
          ),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () => Navigator.pushNamed(ctx, '/clients/new'),
      child: Icon(Icons.add),
    ),
  ),
spec.viewmodel:
  name: ClientListVM
  legacy_origin: "ClientListActivity.onResume"
  methods:
    - load(): calls clientService.list
```

### Accepted divergence points

- DEV-XXX: <short description> (see `screen_deviation_log.md#DEV-XXX`)

### States (modernized mode only)

| State | Description | Content / message |
|---|---|---|
| Idle | Default state before any action | <content> |
| Loading | Async operation in progress | <spinner / skeleton> |
| Error | Operation failure or invalid data | `{{error_message}}` |
| Success | Operation completed successfully | <confirmation message> |

> In literal mode, this section can be omitted or replaced with "preserves the legacy's states" if the legacy has no explicit state disposition.

---

## Screen: <second-screen>

(repeat the block above for each screen)

---

## Appendix: traceability to inventory

| Screen from `target_screens.md` | Origin in `_reversa_sdd/ui/inventory.md` | Origin in `_reversa_sdd/screens/inventory.json` |
|---|---|---|
| <screen 1> | <inventory line> | <internal inventory id> |
| <screen 2> | <inventory line> | <internal inventory id> |
