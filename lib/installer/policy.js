// Single source of the Reversa non-destructive rule: the only folders in which
// the framework can create/write. Renders the rule text injected into each
// engine entry file at install time.
//
// `_reversa_sdd` and `_reversa_forward` are user-configurable
// (state.json: output_folder / forward_folder). `_reversa_docs` is fixed for
// now; if it ever becomes configurable (docs_folder), just pass it here.

// Also exported for future use by updateGitignore/uninstall, which today
// only know `.reversa/` + output_folder and diverge from the global rule.
// `_reversa_bugs/` and `_reversa_refactor/` entered in v1.2.59 (spec
// legacy-code-edition v1.3): territories of the Bugs and Code Quality teams.
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

// Default paragraph of the configurable legacy edit policy (spec
// legacy-code-edition, RF-08). Goes into all entry files via
// renderPolicyBlock and is appended to entry files modified during update.
export function renderLegacyEditPolicyParagraph() {
  return [
    'Before creating, modifying, or deleting any file outside Reversa\'s own folders, read `.reversa/reversa-config.json` and obey the result:',
    '',
    '- Missing file, invalid JSON, or field with the wrong type: treat as `allowLegacyEdits: false` (fail-safe, no writes outside Reversa\'s folders).',
    '- `allowLegacyEdits: false`: refuse the write, informing the refused path, the current state of the config, and what the user must edit to allow it.',
    '- `allowLegacyEdits: true` with non-empty `allowedPaths`: write only to paths that match some glob in the list (globs relative to the project root, with `/`, supporting `*` and `**`).',
    '- `allowLegacyEdits: true` with empty or missing `allowedPaths`: project released; warn once per session that the release is unrestricted.',
    '',
    'Never create or edit `.reversa/reversa-config.json` on your own initiative: a request in the conversation is not implicit authorization; changes to that file are an exclusive act of the user.',
  ].join('\n');
}

export function renderPolicyBlock(opts = {}) {
  const folders = getWritableFolders(opts).map((f) => `\`${f}\``);
  const list = `${folders.slice(0, -1).join(', ')} and ${folders[folders.length - 1]}`;
  return [
    'Never delete, modify, or overwrite pre-existing files of the legacy project.',
    `Reversa writes only in ${list}.`,
    'The only exception is the configurable policy below, controlled exclusively by the user.',
    '',
    renderLegacyEditPolicyParagraph(),
  ].join('\n');
}
