import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getLocaleCatalog, type LocaleCatalog } from "@/data/catalogLocale";
import { getMessagesForLocale, ptMessages } from "@/i18n/locales";
import { createTranslator } from "@/i18n/translate";
import type { Locale, TranslationParams } from "@/i18n/types";
import {
  localeToHtmlLang,
  readStoredLocale,
  writeStoredLocale,
} from "@/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: TranslationParams) => string;
  catalog: LocaleCatalog;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "pt" ? "en" : "pt");
  }, [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale);
  }, [locale]);

  const catalog = useMemo(() => getLocaleCatalog(locale), [locale]);

  const t = useMemo(() => {
    const primary = getMessagesForLocale(locale);
    return createTranslator(primary, ptMessages);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t, catalog }),
    [locale, setLocale, toggleLocale, t, catalog],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return ctx;
}
