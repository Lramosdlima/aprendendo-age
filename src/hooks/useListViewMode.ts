import { useCallback, useState } from "react";

import {
  listViewModeStorageKey,
  parseListViewMode,
  type ListViewMode,
} from "@/lib/listViewMode";

/**
 * Alterna entre grade e planilha por página (`pageKey`, ex. `"deuses"`).
 * Persiste em `localStorage` para reabrir no mesmo modo.
 *
 * @example
 * const [viewMode, setViewMode] = useListViewMode("deuses");
 */
export function useListViewMode(pageKey: string): [ListViewMode, (mode: ListViewMode) => void] {
  const storageKey = listViewModeStorageKey(pageKey);

  const [mode, setModeState] = useState<ListViewMode>(() => {
    try {
      return parseListViewMode(localStorage.getItem(storageKey));
    } catch {
      return "grade";
    }
  });

  const setMode = useCallback(
    (next: ListViewMode) => {
      setModeState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* storage indisponível */
      }
    },
    [storageKey],
  );

  return [mode, setMode];
}
