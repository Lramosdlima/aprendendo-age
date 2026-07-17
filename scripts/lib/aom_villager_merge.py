from __future__ import annotations

import json
from pathlib import Path
from typing import Any

SYNC_FIELDS = (
    "recursos",
    "vida",
    "populacao",
    "tempo_de_treinamento",
    "cacar",
    "gado_galinhas",
    "frutinhas",
    "fazenda",
    "arvore",
    "mina",
    "velocidade_construcao",
    "cacar_porcento",
    "gado_porcento",
    "frutinhas_porcento",
    "fazenda_porcento",
    "arvore_porcento",
    "mina_porcento",
    "velocidade_construcao_porcento",
)

OPTIONAL_COST_FIELDS = ("carne", "madeira", "ouro", "favor")
OBSOLETE_FIELDS = ("tempo_de_treinamento_patch_18_65484",)


def merge_catalog_file(
    path: Path,
    extracted_rows: list[dict[str, Any]],
    *,
    locale: str,
    id_filter: set[int] | None,
    dry_run: bool,
) -> dict[str, Any]:
    catalog: list[dict[str, Any]] = json.loads(path.read_text(encoding="utf-8"))
    extracted_by_id = {row["id"]: row for row in extracted_rows}
    report: list[dict[str, Any]] = []
    missing: list[int] = []

    for row in catalog:
        villager_id = row.get("id")
        if not isinstance(villager_id, int):
            continue
        if id_filter is not None and villager_id not in id_filter:
            continue
        extracted = extracted_by_id.get(villager_id)
        if extracted is None:
            missing.append(villager_id)
            continue

        changes: dict[str, dict[str, Any]] = {}
        for field in OBSOLETE_FIELDS:
            if field in row:
                changes[field] = {"before": row[field], "after": None}
                row.pop(field)

        values = {field: extracted.get(field) for field in SYNC_FIELDS}
        for field, value in values.items():
            if value is None:
                if field in row:
                    changes[field] = {"before": row[field], "after": None}
                    row.pop(field)
                continue
            if row.get(field) != value:
                changes[field] = {"before": row.get(field), "after": value}
                row[field] = value

        for field in OPTIONAL_COST_FIELDS:
            value = extracted.get(field, 0)
            if value:
                if row.get(field) != value:
                    changes[field] = {"before": row.get(field), "after": value}
                    row[field] = value
            elif field in row:
                changes[field] = {"before": row[field], "after": None}
                row.pop(field)

        if not row.get("icon") and extracted.get("icon_extraido"):
            value = extracted["icon_extraido"]
            changes["icon"] = {"before": row.get("icon"), "after": value}
            row["icon"] = value

        if changes:
            report.append(
                {
                    "id": villager_id,
                    "proto": extracted["proto_name"],
                    "nome": row["nome"],
                    "changes": changes,
                }
            )

    if report and not dry_run:
        path.write_text(
            json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return {
        "path": str(path),
        "updated": len(report),
        "missing": missing,
        "report": report,
    }
