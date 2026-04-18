"""
Rebuilds src/data/tecnologias.json from the Notion CSV export.

- Row order = spreadsheet order (not alphabetical).
- Keys follow CSV columns + icon + campo + *_id fields from the previous JSON when merged by nome.
- icon = aomr_{english_snake_case}_icon from the Inglês column (or prior JSON if CSV empty).
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT.parent / "Notion Aprendendo Age/Aprendendo Age/Tecnologias 29500f30e2118062b0fcf262a3f188b4.csv"
JSON_PATH = ROOT / "src/data/tecnologias.json"


def ingles_from_icon_token(icon: str) -> str | None:
    """Fallback quando CSV e JSON antigo não têm inglês mas há ícone aomr_*_icon."""
    m = re.match(r"aomr_(.+)_icon$", (icon or "").strip(), re.I)
    if not m:
        return None
    parts = [p for p in m.group(1).split("_") if p]
    if not parts:
        return None
    return " ".join(p.capitalize() for p in parts)


def english_to_icon_token(ingles: str) -> str | None:
    s = (ingles or "").strip()
    if not s:
        return None
    s = s.replace("'", "").replace("'", "")
    s = re.sub(r"[^a-zA-Z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_").lower()
    if not s:
        return None
    return f"aomr_{s}_icon"


def parse_opt_int(s: str | None) -> int | None:
    s = (s or "").strip()
    if not s:
        return None
    return int(s)


def merge_row(csv_row: dict[str, str], old: dict | None) -> dict:
    strip = lambda k: (csv_row.get(k) or "").strip()

    nome = strip("UP")
    merged: dict = {"nome": nome}

    # Text: prefer enriched data from JSON when present
    def pick_text(csv_key: str, json_key: str) -> str | None:
        if old and (old.get(json_key) or "").strip():
            return old[json_key]
        v = strip(csv_key)
        return v or None

    if v := pick_text("Beneficia", "beneficia"):
        merged["beneficia"] = v
    if v := pick_text("Construção Origem", "construcao_origem"):
        merged["construcao_origem"] = v
    if v := pick_text("Eras", "eras"):
        merged["eras"] = v
    if v := pick_text("God Específico", "god_especifico"):
        merged["god_especifico"] = v
    if v := pick_text("Panteões", "panteoes"):
        merged["panteoes"] = v
    if v := pick_text("Tipo", "tipo"):
        merged["tipo"] = v

    ingles = strip("Inglês") or (old.get("ingles") if old and old.get("ingles") else "")
    if ingles:
        merged["ingles"] = ingles.strip()

    def num_field(json_key: str, csv_key: str):
        try:
            raw = csv_row.get(csv_key)
            v = parse_opt_int(raw)
        except ValueError:
            v = None
        if v is not None:
            merged[json_key] = v
        elif old and json_key in old and old[json_key] is not None:
            merged[json_key] = old[json_key]

    num_field("comida", "Comida")
    num_field("madeira", "Madeira")
    num_field("ouro", "Ouro")
    num_field("favor", "Favor")
    num_field("tempo_s", "Tempo (s)")

    ing_for_icon = strip("Inglês") or (old.get("ingles") if old else "") or ""
    ing_for_icon = ing_for_icon.strip()
    if ing_for_icon:
        tok = english_to_icon_token(ing_for_icon)
        if tok:
            merged["icon"] = tok
    elif old and old.get("icon"):
        merged["icon"] = old["icon"]

    if not merged.get("ingles") and merged.get("icon"):
        derived = ingles_from_icon_token(merged["icon"])
        if derived:
            merged["ingles"] = derived

    if old:
        for k in (
            "campo",
            "construcao_origem_id",
            "construcao_origem_ids",
            "eras_id",
            "god_especifico_id",
            "god_especifico_ids",
            "panteoes_id",
            "todas_as_tecnologias",
        ):
            if k in old and old[k] is not None:
                merged[k] = old[k]

    return merged


def order_keys(m: dict) -> dict:
    """Deterministic key order: CSV fields, icon, campo, ids, extras."""
    primary = [
        "nome",
        "beneficia",
        "comida",
        "construcao_origem",
        "eras",
        "favor",
        "god_especifico",
        "ingles",
        "madeira",
        "ouro",
        "panteoes",
        "tempo_s",
        "tipo",
        "icon",
    ]
    out: dict = {}
    for k in primary:
        if k in m and m[k] is not None and m[k] != "":
            out[k] = m[k]
    if m.get("campo"):
        out["campo"] = m["campo"]
    for k in (
        "construcao_origem_id",
        "construcao_origem_ids",
        "eras_id",
        "god_especifico_id",
        "god_especifico_ids",
        "panteoes_id",
    ):
        if k in m and m[k] is not None:
            out[k] = m[k]
    if m.get("todas_as_tecnologias"):
        out["todas_as_tecnologias"] = m["todas_as_tecnologias"]
    for k, v in m.items():
        if k not in out and v is not None and v != "":
            out[k] = v
    return out


def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        old_list: list[dict] = json.load(f)

    by_nome: dict[str, dict] = {}
    for o in old_list:
        n = o.get("nome")
        if isinstance(n, str) and n and n not in by_nome:
            by_nome[n] = o

    extras = [o for o in old_list if o.get("nome") == "Sem título"]

    out_list: list[dict] = []
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = (row.get("UP") or "").strip()
            if not nome:
                continue
            old = by_nome.get(nome)
            merged = merge_row(row, old)
            out_list.append(order_keys(merged))

    for st in extras:
        out_list.append(order_keys({k: v for k, v in st.items() if v is not None}))

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(out_list, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(out_list)} items to {JSON_PATH}")


if __name__ == "__main__":
    main()
