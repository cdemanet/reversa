#!/usr/bin/env python3
"""
convert_soul.py — Converts .reversa/soul.md into structured soul.json.

Wave 1 skeleton. Rich extraction (entities, decisions, synonyms) in TASK-10.

Usage:
    python convert_soul.py --src .reversa/soul.md \
                           --out _reversa_docs/assets/data/soul.json
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass


def split_sections(text: str):
    sections = {}
    current = None
    buffer = []
    for line in text.splitlines():
        heading = re.match(r"^##\s+(.+)$", line)
        if heading:
            if current:
                sections[current] = "\n".join(buffer).strip()
            current = heading.group(1).strip()
            buffer = []
        else:
            buffer.append(line)
    if current:
        sections[current] = "\n".join(buffer).strip()
    return sections


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", required=True, help="Path to .reversa/soul.md")
    parser.add_argument("--out", required=True, help="Output path for soul.json")
    args = parser.parse_args()

    src = Path(args.src)
    if not src.exists():
        print(f"WARNING: {src} does not exist. Skipping soul.json generation.")
        return

    text = src.read_text(encoding="utf-8")
    sections = split_sections(text)

    out = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sections": sections,
        "concepts": [],  # rich extraction is left for TASK-10
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(sections)} sections in {out_path}")


if __name__ == "__main__":
    main()
