#!/usr/bin/env python3
"""
Verificador do eixo de invocação do Reversa (árvore-fonte única `agents/`).

Toda skill é user-invoked ou model-invoked, sem terceiro estado. O verificador
garante que as duas marcas do eixo estão em lockstep DENTRO de cada skill:

  - Claude Code : disable-model-invocation: true        no SKILL.md
  - Codex       : policy.allow_implicit_invocation: false  em agents/openai.yaml

Uma skill é user-invoked nos dois harnesses ou em nenhum. Este é o repositório
FONTE (árvore única); o installer replica cada skill por cópia recursiva, então
a paridade entre `.claude/skills` e `.agents/skills` na máquina do usuário é
estrutural — o que precisa de guarda aqui é o eixo, não a igualdade entre árvores.

Uso:  scripts/verify-invocation.py [<dir-de-skills>]   (padrão: agents)
Sai com código 1 se houver qualquer violação (serve de gate de CI).
"""
import re, sys, pathlib

# Assinaturas de gatilho de MODELO — proibidas na description de user-invoked.
# São enumerações de comandos/frases digitadas, não dicas de uso em prosa.
TRIGGER_SIGS = ('digitar "', 'Use com "', 'Ative com ', 'pedir "')


def frontmatter(p):
    t = p.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    return m.group(1) if m else None


def check(raiz):
    raiz = pathlib.Path(raiz)
    erros = []
    skills = sorted(raiz.glob("*/SKILL.md"))
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

        if not re.search(r"^\s*display_name:", yt, re.M):
            erros.append(f"{nome}: openai.yaml sem interface.display_name")
        if not re.search(r"^\s*short_description:", yt, re.M):
            erros.append(f"{nome}: openai.yaml sem interface.short_description")

        # LOCKSTEP: user-invoked nas duas marcas, ou em nenhuma.
        if claude_user != codex_user:
            erros.append(
                f"{nome}: DESCASAMENTO — Claude={'user' if claude_user else 'model'}-invoked, "
                f"Codex={'user' if codex_user else 'model'}-invoked")

        if claude_user:
            n_user += 1
            d = re.search(r"^description:\s*(.+?)(?=\n[a-zA-Z_-]+:|\Z)", fm, re.S | re.M)
            if d:
                desc = " ".join(d.group(1).split()).strip().strip("'\"")
                hit = next((s for s in TRIGGER_SIGS if s in desc), None)
                if hit:
                    erros.append(
                        f"{nome}: description de user-invoked ainda tem gatilho de modelo "
                        f"(assinatura {hit!r}) — deve ser um resumo humano sem lista de gatilhos")
    return erros, len(skills), n_user


def main(dirs):
    total_erros = 0
    for d in dirs:
        erros, n, n_user = check(d)
        print(f"\n=== {d}")
        print(f"    {n} skills · {n_user} user-invoked · {n - n_user} model-invoked")
        if erros:
            print(f"    {len(erros)} violação(ões):")
            for e in erros[:60]:
                print(f"      ✗ {e}")
            if len(erros) > 60:
                print(f"      … e mais {len(erros) - 60}")
        else:
            print("    ✓ eixo de invocação íntegro, 0 descasamentos")
        total_erros += len(erros)

    print("\n" + "=" * 60)
    print("RESULTADO:", "✓ APROVADO" if total_erros == 0 else f"✗ {total_erros} violação(ões)")
    return 1 if total_erros else 0


if __name__ == "__main__":
    argv = sys.argv[1:] or ["agents"]
    sys.exit(main(argv))
