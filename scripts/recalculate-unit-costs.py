#!/usr/bin/env python3
"""Calcula custo total e médias por classe removendo outliers por desvio-padrão."""

from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATHS = (
    ROOT / "src" / "data" / "locale" / "pt" / "unidades_aom.json",
    ROOT / "src" / "data" / "locale" / "en" / "unidades_aom.json",
)
RESOURCE_FIELDS = ("comida", "madeira", "ouro", "favor")


def unit_class(row: dict[str, Any]) -> str:
    types = row.get("tipo") or []
    icons = {str(item.get("icon") or "").lower() for item in types}
    labels = {str(item.get("type") or "").strip().lower() for item in types}
    if "aomr_type_hero_icon" in icons or "herói" in labels or "hero" in labels:
        return "hero"
    if (
        "aomr_type_myth_unit_icon" in icons
        or "unidade mítica" in labels
        or "myth unit" in labels
    ):
        return "myth"
    return "human"


def total_cost(row: dict[str, Any]) -> float | int:
    total = sum(float(row.get(field) or 0) for field in RESOURCE_FIELDS)
    return int(total) if total.is_integer() else round(total, 4)


def with_total_cost(row: dict[str, Any]) -> dict[str, Any]:
    clean = {key: value for key, value in row.items() if key != "custo_total"}
    keys = list(clean)
    resource_positions = [keys.index(field) for field in RESOURCE_FIELDS if field in clean]
    insert_after = max(resource_positions) if resource_positions else len(keys) - 1

    updated: dict[str, Any] = {}
    for index, (key, value) in enumerate(clean.items()):
        updated[key] = value
        if index == insert_after:
            updated["custo_total"] = total_cost(clean)
    return updated


def sigma_clipped(values: list[float], sigma: float) -> tuple[list[float], float, float]:
    mean = statistics.fmean(values)
    deviation = statistics.pstdev(values)
    if deviation == 0:
        return values, mean, deviation
    filtered = [value for value in values if abs(value - mean) <= sigma * deviation]
    return filtered, statistics.fmean(filtered), statistics.pstdev(filtered)


def report(rows: list[dict[str, Any]], sigma: float) -> None:
    for category in ("human", "myth", "hero"):
        values = [
            float(row["custo_total"])
            for row in rows
            if unit_class(row) == category and float(row["custo_total"]) > 0
        ]
        filtered, mean, deviation = sigma_clipped(values, sigma)
        print(
            f"{category}: média={mean:.2f}, desvio={deviation:.2f}, "
            f"amostra={len(filtered)}/{len(values)}, removidos={len(values) - len(filtered)}"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sigma", type=float, default=2.0)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    updated_catalogs: list[tuple[Path, list[dict[str, Any]]]] = []
    for path in CATALOG_PATHS:
        rows = json.loads(path.read_text(encoding="utf-8"))
        updated_catalogs.append((path, [with_total_cost(row) for row in rows]))

    report(updated_catalogs[0][1], args.sigma)

    if args.write:
        for path, rows in updated_catalogs:
            path.write_text(
                json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        print("Catálogos PT e EN atualizados.")
    else:
        print("Simulação concluída; use --write para gravar.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
