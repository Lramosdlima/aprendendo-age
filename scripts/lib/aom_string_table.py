from __future__ import annotations

import re
from pathlib import Path

_LINE_RE = re.compile(
    r'^\s*ID\s*=\s*"(?P<id>[^"]+)"\s*;\s*Str\s*=\s*"(?P<str>(?:\\"|[^"])*)"'
)


def parse_string_table(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: dict[str, str] = {}
    for line in text.splitlines():
        match = _LINE_RE.match(line)
        if not match:
            continue
        value = match.group("str").replace('\\"', '"')
        out[match.group("id")] = value
    return out
