#!/usr/bin/env python3
"""
extract_modules.py — Produces modules.json for the Reversa Docs Team.

Wave 1 skeleton. Full implementation in TASK-07.

Output schema: see specs/reversa-docs/design.md, section
"Intermediate JSONs in assets/data/" → "modules.json schema".

Usage:
    python extract_modules.py --root . --out _reversa_docs/assets/data/modules.json
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass

LANG_BY_EXT = {
    ".py": "python",
    ".js": "js", ".mjs": "js", ".cjs": "js",
    ".ts": "ts", ".tsx": "ts",
    ".go": "go",
    ".java": "java",
}

IGNORED_DIRS = {".git", "node_modules", ".reversa", "_reversa_sdd",
                "dist", "build", "__pycache__", ".venv", "venv", ".tmp-mkdocs-site"}


def count_loc(path: Path) -> int:
    try:
        with path.open(encoding="utf-8", errors="ignore") as f:
            return sum(1 for line in f if line.strip())
    except OSError:
        return 0


def walk_modules(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        for name in filenames:
            ext = Path(name).suffix.lower()
            if ext not in LANG_BY_EXT:
                continue
            abs_path = Path(dirpath) / name
            rel_path = str(abs_path.relative_to(root)).replace("\\", "/")
            yield {
                "id": rel_path,
                "name": Path(name).stem,
                "folder": str(Path(dirpath).relative_to(root)).replace("\\", "/") or ".",
                "loc": count_loc(abs_path),
                "language": LANG_BY_EXT[ext],
                # complexity and type are left for TASK-07 (need per-language AST)
            }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Project root to analyze")
    parser.add_argument("--out", required=True, help="Output path for modules.json")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    modules = list(walk_modules(root))

    out = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "rootPath": str(root),
        "modules": modules,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(modules)} modules in {out_path}")


if __name__ == "__main__":
    main()
