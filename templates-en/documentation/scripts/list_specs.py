#!/usr/bin/env python3
"""
list_specs.py — Lists specs in _reversa_sdd/ and produces features-index.json.

Wave 1 skeleton. Metadata extraction (status, size, author) in TASK-10.

Usage:
    python list_specs.py --sdd-root _reversa_sdd \
                         --out _reversa_docs/assets/data/features-index.json
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass


def find_specs(sdd_root: Path):
    if not sdd_root.exists():
        return []
    specs = []
    for child in sorted(sdd_root.iterdir()):
        if not child.is_dir():
            continue
        req = child / "requirements.md"
        design = child / "design.md"
        tasks = child / "tasks.md"
        if not req.exists():
            continue
        specs.append({
            "id": child.name,
            "slug": child.name.lower().replace("_", "-").replace(" ", "-"),
            "path": str(child).replace("\\", "/"),
            "files": {
                "requirements": req.exists(),
                "design": design.exists(),
                "tasks": tasks.exists(),
            },
        })
    return specs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sdd-root", default="_reversa_sdd", help="SDD specs root")
    parser.add_argument("--out", required=True, help="Output path for features-index.json")
    args = parser.parse_args()

    sdd_root = Path(args.sdd_root)
    specs = find_specs(sdd_root)

    out = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sddRoot": str(sdd_root),
        "specs": specs,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(specs)} specs in {out_path}")


if __name__ == "__main__":
    main()
