export type Locale = "pt" | "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["pt", "en"] as const;

export const DEFAULT_LOCALE: Locale = "pt";

export type TranslationParams = Record<string, string | number>;

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};
