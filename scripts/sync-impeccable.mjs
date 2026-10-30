#!/usr/bin/env node
// Sincroniza a cópia vendorizada do Impeccable (agents/impeccable/) com uma
// release do repositório upstream pbakaus/impeccable (Apache License 2.0).
//
// O Reversa entrega o Impeccable como o time de Front-end: a skill é copiada
// para agents/impeccable/ e o installer a replica como qualquer outra skill.
// Este script é o único caminho para atualizar essa cópia. Ele:
//
//   1. descobre a release mais recente (tag skill-vX.Y.Z) ou usa --tag <tag>;
//   2. clona a tag em uma pasta temporária (git, profundidade 1);
//   3. substitui agents/impeccable/ por .claude/skills/impeccable/ do upstream,
//      mais agents/ (marca do Codex: openai.yaml + subagentes .toml) de
//      .agents/skills/impeccable/, LICENSE e NOTICE.md da raiz do upstream;
//   4. grava agents/impeccable/reversa-bundle.json com a proveniência;
//   5. faz git add da pasta e restaura o bit de execução do launcher
//      (scripts/impeccable), que o Windows não preserva.
//
// Uso:
//   node scripts/sync-impeccable.mjs            # última release
//   node scripts/sync-impeccable.mjs --tag skill-v4.7.0
//   node scripts/sync-impeccable.mjs --check    # só compara versões, sai 0 se igual, 3 se há nova
//
// Roda também no CI (.github/workflows/sync-impeccable.yml): quando o upstream
// publica release nova, a cópia é atualizada, o patch do Reversa é incrementado
// e um PR é aberto. Ao instalar/atualizar o Reversa, o usuário é avisado de que
// o Impeccable vem junto, sob Apache 2.0 (lib/installer/bundled.js).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'agents', 'impeccable');
const BUNDLE_FILE = join(DEST, 'reversa-bundle.json');
const REPO = 'https://github.com/pbakaus/impeccable.git';
const TAG_PREFIX = 'skill-v';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const tagIdx = args.indexOf('--tag');
const requestedTag = tagIdx >= 0 ? args[tagIdx + 1] : null;

function git(cmdArgs, opts = {}) {
  return execFileSync('git', cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }).trim();
}

function parseSemver(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  return m ? m.slice(1).map(Number) : null;
}

function compareSemver(a, b) {
  const pa = parseSemver(a), pb = parseSemver(b);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

function latestTag() {
  const out = git(['ls-remote', '--tags', '--refs', REPO, `${TAG_PREFIX}*`]);
  const versions = out.split('\n')
    .map(l => l.split('\t')[1]?.replace('refs/tags/', ''))
    .filter(t => t && parseSemver(t.slice(TAG_PREFIX.length)))
    .map(t => t.slice(TAG_PREFIX.length))
    .sort(compareSemver);
  if (versions.length === 0) throw new Error(`nenhuma tag ${TAG_PREFIX}* encontrada em ${REPO}`);
  return `${TAG_PREFIX}${versions[versions.length - 1]}`;
}

function currentBundle() {
  if (!existsSync(BUNDLE_FILE)) return null;
  try { return JSON.parse(readFileSync(BUNDLE_FILE, 'utf8')); } catch { return null; }
}

const tag = requestedTag ?? latestTag();
const version = tag.slice(TAG_PREFIX.length);
const current = currentBundle();

console.log(`  Impeccable vendorizado: ${current ? 'v' + current.version : '(ausente)'}`);
console.log(`  Impeccable upstream:    v${version} (${tag})`);

if (checkOnly) {
  if (current && current.version === version) {
    console.log('  ✓ em dia');
    process.exit(0);
  }
  console.log('  → há versão nova para sincronizar');
  process.exit(3);
}

const tmp = mkdtempSync(join(tmpdir(), 'impeccable-sync-'));
try {
  console.log(`  Clonando ${tag}...`);
  git(['-c', 'core.autocrlf=false', 'clone', '--quiet', '--depth', '1', '--branch', tag, REPO, tmp]);

  const skillSrc = join(tmp, '.claude', 'skills', 'impeccable');
  const codexAgentsSrc = join(tmp, '.agents', 'skills', 'impeccable', 'agents');
  for (const p of [skillSrc, codexAgentsSrc, join(tmp, 'LICENSE'), join(tmp, 'NOTICE.md')]) {
    if (!existsSync(p)) throw new Error(`layout upstream mudou, caminho esperado ausente: ${p}`);
  }

  rmSync(DEST, { recursive: true, force: true });
  mkdirSync(DEST, { recursive: true });
  cpSync(skillSrc, DEST, { recursive: true });
  cpSync(codexAgentsSrc, join(DEST, 'agents'), { recursive: true });
  cpSync(join(tmp, 'LICENSE'), join(DEST, 'LICENSE'));
  cpSync(join(tmp, 'NOTICE.md'), join(DEST, 'NOTICE.md'));

  const commit = git(['rev-parse', 'HEAD'], { cwd: tmp });
  const bundle = {
    name: 'impeccable',
    displayName: 'Impeccable',
    version,
    tag,
    commit,
    author: 'Paul Bakaus',
    license: 'Apache-2.0',
    licenseFile: 'LICENSE',
    noticeFile: 'NOTICE.md',
    homepage: 'https://impeccable.style',
    repository: 'https://github.com/pbakaus/impeccable',
    syncedAt: new Date().toISOString(),
    syncedBy: 'scripts/sync-impeccable.mjs',
    modifications: 'none: upstream .claude/skills/impeccable copied verbatim, plus agents/ (Codex marker) from .agents/skills/impeccable, LICENSE and NOTICE.md',
  };
  writeFileSync(BUNDLE_FILE, JSON.stringify(bundle, null, 2) + '\n', 'utf8');

  // Stage + bit de execução do launcher (perdido em checkouts/copias no Windows).
  git(['add', '-A', 'agents/impeccable'], { cwd: ROOT });
  git(['update-index', '--chmod=+x', 'agents/impeccable/scripts/impeccable'], { cwd: ROOT });

  const changed = git(['diff', '--cached', '--stat', '--', 'agents/impeccable'], { cwd: ROOT });
  if (changed) {
    console.log(`  ✓ agents/impeccable sincronizado para v${version} (staged)`);
  } else {
    console.log(`  ✓ agents/impeccable já estava em v${version}, nada mudou`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
