// Single source of the Reversa non-destructive rule: the only folders in which
// the framework can create/write. Renders the rule text injected into each
// engine entry file at install time.
//
// `_reversa_sdd` and `_reversa_forward` are user-configurable
// (state.json: output_folder / forward_folder). `_reversa_docs` is fixed for
// now; if it ever becomes configurable (docs_folder), just pass it here.

// Also exported for future use by updateGitignore/uninstall, which today
// only know `.reversa/` + output_folder and diverge from the global rule.
// `_reversa_bugs/` e `_reversa_refactor/` entraram na v1.2.59 (spec
// legacy-code-edition v1.3): territórios dos times Bugs e Code Quality.
export function getWritableFolders({
  outputFolder = '_reversa_sdd',
  forwardFolder = '_reversa_forward',
} = {}) {
  return [
    '.reversa/',
    `${outputFolder}/`,
    '_reversa_docs/',
    `${forwardFolder}/`,
    '_reversa_bugs/',
    '_reversa_refactor/',
  ];
}

// Parágrafo padrão da política configurável de edição do legado (spec
// legacy-code-edition, RF-08). Entra em todos os entry files via
// renderPolicyBlock e é anexado a entry files modificados durante o update.
export function renderLegacyEditPolicyParagraph() {
  return [
    'Antes de criar, modificar ou apagar qualquer arquivo fora das pastas próprias do Reversa, leia `.reversa/reversa-config.json` e obedeça ao resultado:',
    '',
    '- Arquivo ausente, JSON inválido ou campo com tipo errado: trate como `allowLegacyEdits: false` (falha segura, nenhuma escrita fora das pastas do Reversa).',
    '- `allowLegacyEdits: false`: recuse a escrita, informando o caminho recusado, o estado atual da config e o que o usuário deve editar para liberar.',
    '- `allowLegacyEdits: true` com `allowedPaths` não vazio: escreva apenas em caminhos que casem com algum glob da lista (globs relativos à raiz do projeto, com `/`, suportando `*` e `**`).',
    '- `allowLegacyEdits: true` com `allowedPaths` vazio ou ausente: projeto liberado; avise uma vez por sessão que a liberação é irrestrita.',
    '',
    'Nunca crie nem edite `.reversa/reversa-config.json` por iniciativa própria: pedido na conversa não é liberação implícita, alterações nesse arquivo são ato exclusivo do usuário.',
  ].join('\n');
}

export function renderPolicyBlock(opts = {}) {
  const folders = getWritableFolders(opts).map((f) => `\`${f}\``);
  const list = `${folders.slice(0, -1).join(', ')} and ${folders[folders.length - 1]}`;
  return [
    'Never delete, modify, or overwrite pre-existing files of the legacy project.',
    `Reversa writes only in ${list}.`,
    'A única exceção é a política configurável abaixo, controlada exclusivamente pelo usuário.',
    '',
    renderLegacyEditPolicyParagraph(),
  ].join('\n');
}
