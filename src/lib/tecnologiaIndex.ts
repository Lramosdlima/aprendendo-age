import type { Tecnologia } from "@/data/catalog";

type TecnologiaRef = { id: string | number; nome: string };

type ConstrucaoTecnologiaSource = {
  tecnologias?: string;
  tecnologias_ids?: string[];
  tecnologias_id?: string;
};

type DeusTecnologiaSource = {
  tecnologias?: TecnologiaRef[];
};

function splitCsvNames(s: string | undefined): string[] {
  return String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Mapa Notion UUID → índice em `tecnologias.json` (ordem PT canônica). */
export function buildTecnologiaNotionIdIndexMap(
  tecnologias: readonly Tecnologia[],
  construcoes: readonly ConstrucaoTecnologiaSource[],
  deuses: readonly DeusTecnologiaSource[],
): Map<string, number> {
  const map = new Map<string, number>();

  function register(notionId: string, nome: string | undefined) {
    if (!notionId || map.has(notionId)) return;
    if (nome) {
      const idx = tecnologias.findIndex((t) => t.nome === nome);
      if (idx >= 0) {
        map.set(notionId, idx);
        return;
      }
    }
  }

  for (const c of construcoes) {
    const ids =
      c.tecnologias_ids ?? (c.tecnologias_id != null ? [c.tecnologias_id] : []);
    const names = splitCsvNames(c.tecnologias);
    ids.forEach((id, i) => register(id, names[i]));
  }

  for (const d of deuses) {
    for (const ref of d.tecnologias ?? []) {
      if (typeof ref.id === "string") register(ref.id, ref.nome);
    }
  }

  return map;
}

export function resolveTecnologiaIndex(
  tecnologias: readonly Tecnologia[],
  notionIdByIndex: Map<string, number>,
  ref: TecnologiaRef,
): number {
  if (typeof ref.id === "string") {
    const byNotion = notionIdByIndex.get(ref.id);
    if (byNotion != null) return byNotion;
  }
  return tecnologias.findIndex((t) => t.nome === ref.nome);
}
