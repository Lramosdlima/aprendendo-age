"""
Substitui em starts_build_order.json URLs planas /assets/Ficheiro.ext
por /assets/subpasta/.../Ficheiro.ext.

Índice: varredura de public/assets + basename em token_asset_map.json (valores).
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ASSETS = ROOT / "public" / "assets"
TOKEN_MAP = ROOT / "src" / "data" / "token_asset_map.json"
STARTS_JSON = ROOT / "src" / "data" / "starts_build_order.json"


def basename_from_disk(assets_root: Path) -> dict[str, str]:
    by_bn: dict[str, list[str]] = {}
    for dp, _, files in os.walk(assets_root):
        for fn in files:
            rel = Path(dp, fn).relative_to(assets_root).as_posix()
            by_bn.setdefault(fn, []).append(rel)
    chosen: dict[str, str] = {}
    for fn, rels in by_bn.items():
        if len(rels) == 1:
            chosen[fn] = rels[0]
        else:
            rels_sorted = sorted(rels, key=lambda r: (0 if r.startswith("techs/") else 1, r))
            chosen[fn] = rels_sorted[0]
    return {k: f"/assets/{v}" for k, v in chosen.items()}


def basename_from_token_map(path: Path) -> dict[str, str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, str] = {}
    for url in data.values():
        if not isinstance(url, str) or not url.startswith("/assets/"):
            continue
        bn = url.rsplit("/", 1)[-1]
        out.setdefault(bn, url)
    return out


def main() -> None:
    merged: dict[str, str] = {}
    merged.update(basename_from_token_map(TOKEN_MAP))
    # Disco tem prioridade (caminho atual)
    merged.update(basename_from_disk(PUBLIC_ASSETS))

    text = STARTS_JSON.read_text(encoding="utf-8")
    flat_re = re.compile(r"/assets/([^/\"]+\.(?:png|jpg|jpeg|gif|webp))")

    missing: set[str] = set()
    n_sub = 0

    def sub(m: re.Match[str]) -> str:
        nonlocal n_sub
        fn = m.group(1)
        if fn not in merged:
            missing.add(fn)
            return m.group(0)
        new_url = merged[fn]
        if m.group(0) != new_url:
            n_sub += 1
        return new_url

    new_text = flat_re.sub(sub, text)

    if new_text != text:
        STARTS_JSON.write_text(new_text, encoding="utf-8")
        print("Atualizado:", STARTS_JSON)
        print("Substituições de segmentos planos:", n_sub)

    if missing:
        print("Sem ficheiro no disco nem em token_asset_map (basename):")
        for fn in sorted(missing):
            print(" ", fn)


if __name__ == "__main__":
    main()
