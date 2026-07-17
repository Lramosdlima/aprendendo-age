from __future__ import annotations

import json
import unicodedata
from pathlib import Path
from typing import Any


def _key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).casefold()


def _row_index(catalog: list[dict[str, Any]]) -> dict[str, int]:
    index: dict[str, int] = {}
    for position, row in enumerate(catalog):
        for field in ("icon", "ingles", "nome"):
            value = row.get(field)
            if value:
                index[_key(str(value))] = position
    return index


def _new_row(extracted: dict[str, Any], locale: str) -> dict[str, Any]:
    name = extracted["nome_en"] if locale == "en" else extracted["nome_pt"]
    origin = extracted.get("origem_padrao", "")
    if not origin:
        raise ValueError(
            f"Mapa novo sem origem editorial definida: {extracted['map_id']}"
        )
    map_type = extracted.get("tipo")
    if not map_type:
        raise ValueError(
            f"Mapa novo sem classificação Land/Water: {extracted['map_id']}"
        )
    return {
        "nome": name,
        "ingles": extracted["nome_en"],
        "mapas_da_ranqueada": extracted["mapas_da_ranqueada"],
        "saiu_da_ranqueada": False,
        "origem": origin,
        "padrao": extracted["padrao"],
        "partidas_rapidas": extracted["partidas_rapidas"],
        "tipo": map_type,
        "icon": extracted["icon"],
    }


def merge_catalog_file(
    path: Path,
    extracted_rows: list[dict[str, Any]],
    *,
    locale: str,
    dry_run: bool,
) -> dict[str, Any]:
    catalog: list[dict[str, Any]] = []
    if path.exists():
        catalog = json.loads(path.read_text(encoding="utf-8"))

    index = _row_index(catalog)
    report: list[dict[str, Any]] = []
    added = 0

    for extracted in extracted_rows:
        candidates = (
            extracted["icon"],
            extracted["nome_en"],
            extracted["nome_pt"],
        )
        position = next(
            (index[_key(value)] for value in candidates if _key(value) in index),
            None,
        )

        if position is None:
            row = _new_row(extracted, locale)
            catalog.append(row)
            position = len(catalog) - 1
            added += 1
            changes = {"__added__": {"before": None, "after": row}}
        else:
            row = catalog[position]
            changes: dict[str, dict[str, Any]] = {}
            was_ranked = bool(row.get("mapas_da_ranqueada", False))
            for field in (
                "padrao",
                "partidas_rapidas",
                "tipo",
                "mapas_da_ranqueada",
            ):
                value = extracted[field]
                if field == "tipo" and value is None:
                    continue
                if row.get(field) != value:
                    changes[field] = {"before": row.get(field), "after": value}
                    row[field] = value

            if (
                was_ranked
                and not extracted["mapas_da_ranqueada"]
                and not row.get("saiu_da_ranqueada", False)
            ):
                changes["saiu_da_ranqueada"] = {"before": False, "after": True}
                row["saiu_da_ranqueada"] = True

            if not row.get("icon"):
                changes["icon"] = {"before": row.get("icon"), "after": extracted["icon"]}
                row["icon"] = extracted["icon"]

        if changes:
            report.append(
                {
                    "map_id": extracted["map_id"],
                    "nome": row["nome"],
                    "changes": changes,
                }
            )
        index = _row_index(catalog)

    if report and not dry_run:
        path.write_text(
            json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return {
        "path": str(path),
        "updated": len(report) - added,
        "added": added,
        "total": len(catalog),
        "report": report,
    }
