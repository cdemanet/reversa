#!/usr/bin/env python3
"""
Verificador do eixo de invocação.

Garante que cada skill declara sua invocação nas DUAS marcas, em lockstep:
  - Claude Code : disable-model-invocation: true   no SKILL.md
  - Codex       : policy.allow_implicit_invocation: false  em agents/openai.yaml

Uso:  verify_invocation.py <dir-de-skills> [<dir-de-skills> ...]
Sai com código 1 se houver qualquer violação.
"""
import re, sys, pathlib

def frontmatter(p):
    t = p.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    return m.group(1) if m else None

def check(raiz):
    raiz = pathlib.Path(raiz)
    erros, skills = [], sorted(raiz.glob("*/SKILL.md"))
    if not skills:
        return [f"{raiz}: nenhuma SKILL.md encontrada"], 0, 0
    n_user = 0
    for sk in skills:
        nome = sk.parent.name
        fm = frontmatter(sk)
        if fm is None:
            erros.append(f"{nome}: SKILL.md sem frontmatter"); continue

        claude_user = bool(re.search(r"^disable-model-invocation:\s*true\s*$", fm, re.M))

        y = sk.parent / "agents" / "openai.yaml"
        if not y.exists():
            erros.append(f"{nome}: falta agents/openai.yaml (marca do Codex ausente)")
            continue
        yt = y.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
        codex_user = bool(re.search(r"^\s*allow_implicit_invocation:\s*false\s*$", yt, re.M))

        # metadados de UI do Codex
        if not re.search(r"^\s*display_name:", yt, re.M):
            erros.append(f"{nome}: openai.yaml sem interface.display_name")
        if not re.search(r"^\s*short_description:", yt, re.M):
            erros.append(f"{nome}: openai.yaml sem interface.short_description")

        # LOCKSTEP: user-invoked nas duas marcas, ou em nenhuma
        if claude_user != codex_user:
            erros.append(
                f"{nome}: DESCASAMENTO — Claude={'user' if claude_user else 'model'}-invoked, "
                f"Codex={'user' if codex_user else 'model'}-invoked")
        if claude_user:
            n_user += 1

            # description de user-invoked é humana: sem lista de gatilhos
            d = re.search(r"^description:\s*(.+?)(?=\n[a-zA-Z_-]+:|\Z)", fm, re.S | re.M)
            if d:
                desc = " ".join(d.group(1).split())
                if re.search(r"Use quando|Use when|digitar\s+[\"'`]?/", desc, re.I):
                    erros.append(
                        f"{nome}: description de user-invoked ainda tem gatilho de modelo "
                        f"({len(desc)} chars) — deve ser um resumo humano de uma linha")
    return erros, len(skills), n_user


def main(dirs):
    total_erros = 0
    for d in dirs:
        erros, n, n_user = check(d)
        print(f"\n=== {d}")
        print(f"    {n} skills · {n_user} user-invoked · {n - n_user} model-invoked")
        if erros:
            print(f"    {len(erros)} violação(ões):")
            for e in erros[:40]:
                print(f"      ✗ {e}")
            if len(erros) > 40:
                print(f"      … e mais {len(erros) - 40}")
        else:
            print("    ✓ eixo de invocação íntegro, 0 descasamentos")
        total_erros += len(erros)

    # as árvores precisam ser idênticas entre si
    if len(dirs) > 1:
        import filecmp
        base = dirs[0]
        for outra in dirs[1:]:
            cmp = filecmp.dircmp(base, outra)
            def difs(c, pref=""):
                out = [pref + x for x in c.left_only + c.right_only + c.diff_files]
                for sub, cc in c.subdirs.items():
                    out += difs(cc, pref + sub + "/")
                return out
            d = difs(cmp)
            print(f"\n=== árvores {base} × {outra}")
            if d:
                print(f"    ✗ {len(d)} divergência(s): {d[:5]}")
                total_erros += len(d)
            else:
                print("    ✓ idênticas")

    print(f"\n{'='*60}")
    print("RESULTADO:", "✓ APROVADO" if total_erros == 0 else f"✗ {total_erros} violação(ões)")
    return 1 if total_erros else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["."]))
