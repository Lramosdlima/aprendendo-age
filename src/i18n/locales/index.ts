import { enMessages } from "@/i18n/locales/en";
import { ptMessages } from "@/i18n/locales/pt";
import type { Locale, TranslationTree } from "@/i18n/types";

export function getMessagesForLocale(locale: Locale): TranslationTree {
  return locale === "en" ? enMessages : ptMessages;
}

export { enMessages, ptMessages };
