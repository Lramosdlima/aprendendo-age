/** Modo de listagem: cards (grade) ou tabela estilo Notion (planilha). */
export type ListViewMode = "grade" | "planilha";

export const LIST_VIEW_MODE_STORAGE_PREFIX = "aprendendo-age:list-view:";

export function listViewModeStorageKey(pageKey: string): string {
  return `${LIST_VIEW_MODE_STORAGE_PREFIX}${pageKey}`;
}

export function parseListViewMode(raw: string | null): ListViewMode {
  return raw === "planilha" ? "planilha" : "grade";
}
