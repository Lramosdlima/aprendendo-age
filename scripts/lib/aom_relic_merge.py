from __future__ import annotations

import html
from copy import deepcopy
from pathlib import Path
from typing import Any

from aom_unit_merge import (
    _compact_key,
    load_catalog,
    parse_id_range,
    save_catalog,
)

PRESERVED_FIELDS = frozenset({"id"})


def decode_catalog_name(value: str) -> str:
    return html.unescape(value.replace("%27", "'").replace("%26", "&")).strip()


def match_catalog_to_relic(catalog_row: dict[str, Any]) -> str:
    return decode_catalog_name(
        (catalog_row.get("ingles") or catalog_row.get("nome") or "").strip()
    )


def resolve_proto_name(
    catalog_name: str,
    extracted_index: dict[str, dict[str, Any]],
) -> str | None:
    if not catalog_name:
        return None

    compact_index = {_compact_key(proto): proto for proto in extracted_index}

    for candidate in (catalog_name,):
        if candidate in extracted_index:
            return candidate
        resolved = compact_index.get(_compact_key(candidate))
        if resolved:
            return resolved

    return None


def index_extracted_by_proto(
    extracted_rows: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    return {row["proto_name"]: row for row in extracted_rows if row.get("proto_name")}


def build_merged_row(
    existing: dict[str, Any],
    extracted: dict[str, Any],
    *,
    locale: str,
) -> dict[str, Any]:
    merged = deepcopy(existing)
    locale_key = locale.lower()

    if locale_key == "en":
        merged["nome"] = extracted.get("ingles") or merged.get("nome")
        merged["descricao_resumida"] = (
            extracted.get("descricao_resumida_en")
            or merged.get("descricao_resumida")
        )
        merged["descricao_avancada"] = (
            extracted.get("descricao_avancada_en")
            or merged.get("descricao_avancada")
        )
    else:
        merged["nome"] = extracted.get("nome") or merged.get("nome")
        merged["descricao_resumida"] = (
            extracted.get("descricao_resumida_pt")
            or merged.get("descricao_resumida")
        )
        merged["descricao_avancada"] = (
            extracted.get("descricao_avancada_pt")
            or merged.get("descricao_avancada")
        )

    merged["ingles"] = extracted.get("ingles") or merged.get("ingles")

    if extracted.get("icon"):
        merged["icon"] = extracted["icon"]

    return merged


def diff_fields(before: dict[str, Any], after: dict[str, Any]) -> dict[str, dict[str, Any]]:
    changes: dict[str, dict[str, Any]] = {}
    keys = set(before) | set(after)
    for key in sorted(keys):
        if key in PRESERVED_FIELDS:
            continue
        old = before.get(key)
        new = after.get(key)
        if old != new:
            changes[key] = {"before": old, "after": new}
    return changes


def parse_relic_filter(value: str | None) -> set[str] | None:
    if not value:
        return None
    return {decode_catalog_name(part.strip()) for part in value.split(",") if part.strip()}


def bootstrap_catalog_rows(
    extracted_rows: list[dict[str, Any]],
    *,
    locale: str,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    locale_key = locale.lower()
    for index, extracted in enumerate(extracted_rows, start=1):
        if locale_key == "en":
            row = {
                "id": index,
                "nome": extracted.get("ingles") or extracted.get("nome") or extracted["proto_name"],
                "ingles": extracted.get("ingles") or extracted.get("nome") or extracted["proto_name"],
                "descricao_resumida": extracted.get("descricao_resumida_en") or "",
                "descricao_avancada": extracted.get("descricao_avancada_en") or "",
            }
        else:
            row = {
                "id": index,
                "nome": extracted.get("nome") or extracted.get("ingles") or extracted["proto_name"],
                "ingles": extracted.get("ingles") or extracted.get("nome") or extracted["proto_name"],
                "descricao_resumida": extracted.get("descricao_resumida_pt") or "",
                "descricao_avancada": extracted.get("descricao_avancada_pt") or "",
            }
        if extracted.get("icon"):
            row["icon"] = extracted["icon"]
        rows.append(row)
    return rows


def merge_catalog_file(
    catalog_path: Path,
    extracted_index: dict[str, dict[str, Any]],
    *,
    locale: str,
    relic_filter: set[str] | None = None,
    id_filter: set[int] | None = None,
    dry_run: bool = False,
    bootstrap: bool = False,
) -> dict[str, Any]:
    if bootstrap or not catalog_path.exists():
        extracted_rows = sorted(
            extracted_index.values(),
            key=lambda row: row.get("proto_name", ""),
        )
        rows = bootstrap_catalog_rows(extracted_rows, locale=locale)
        if not dry_run:
            save_catalog(catalog_path, rows)
        return {
            "path": str(catalog_path),
            "updated": len(rows),
            "missing": [],
            "report": [],
            "bootstrapped": True,
        }

    rows = load_catalog(catalog_path)
    updated_rows: list[dict[str, Any]] = []
    report: list[dict[str, Any]] = []
    missing: list[str] = []

    normalized_relic_filter = (
        {name.lower() for name in relic_filter} if relic_filter is not None else None
    )

    for row in rows:
        catalog_name = match_catalog_to_relic(row)
        if normalized_relic_filter is not None:
            if catalog_name.lower() not in normalized_relic_filter:
                updated_rows.append(row)
                continue
        elif id_filter is not None and row.get("id") not in id_filter:
            updated_rows.append(row)
            continue

        resolved_proto = resolve_proto_name(catalog_name, extracted_index)
        extracted = extracted_index.get(resolved_proto or "") if resolved_proto else None
        if not extracted:
            missing.append(catalog_name or f"id={row.get('id')}")
            updated_rows.append(row)
            continue

        merged = build_merged_row(row, extracted, locale=locale)
        changes = diff_fields(row, merged)
        if changes:
            report.append(
                {
                    "id": row.get("id"),
                    "proto": resolved_proto,
                    "catalog_name": catalog_name,
                    "nome": row.get("nome"),
                    "changes": changes,
                }
            )
        updated_rows.append(merged)

    if not dry_run:
        save_catalog(catalog_path, updated_rows)

    return {
        "path": str(catalog_path),
        "updated": len(report),
        "missing": missing,
        "report": report,
        "bootstrapped": False,
    }
