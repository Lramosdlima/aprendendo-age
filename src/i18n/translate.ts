import type { Locale, TranslationParams, TranslationTree } from "@/i18n/types";

function getNestedValue(tree: TranslationTree, key: string): string | undefined {
  const parts = key.split(".");
  let node: string | TranslationTree | undefined = tree;
  for (const part of parts) {
    if (node == null || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = params[name];
    return value != null ? String(value) : `{{${name}}}`;
  });
}

export function createTranslator(
  primary: TranslationTree,
  fallback: TranslationTree,
): (key: string, params?: TranslationParams) => string {
  return (key, params) => {
    const raw = getNestedValue(primary, key) ?? getNestedValue(fallback, key);
    if (raw == null) return key;
    return interpolate(raw, params);
  };
}

export type LocaleMessages = {
  locale: Locale;
  messages: TranslationTree;
};
