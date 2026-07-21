import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  unidadeSlugById,
  unidades,
  type Unidade,
} from "../src/data/catalog";
import { precomputeAllBattleResults } from "../src/lib/battleSimulator/precompute";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = path.join(
  projectRoot,
  "src",
  "data",
  "unidades_aom_battle_results.json",
);

function resolveUnitSlug(unit: Unidade): string {
  return unidadeSlugById.get(unit.id) ?? `id-${unit.id}`;
}

const results = precomputeAllBattleResults(unidades, resolveUnitSlug);

await writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");

console.log(
  `Generated ${results.length} ordered 1v1 battles at ${outputPath}`,
);
