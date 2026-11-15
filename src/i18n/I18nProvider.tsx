import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import en from "./en.json";
import ar from "./ar.json";
import fr from "./french.json";

export type Lang = "en" | "ar" | "fr";
const dictionaries: Record<Lang, unknown> = { en, ar, fr };
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "ع" },
  { code: "fr", label: "Français", short: "FR" },
];
const STORAGE_KEY = "ea-lang";

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), dict);
}

type Ctx = { lang: Lang; dir: "ltr" | "rtl"; setLang: (l: Lang) => void; t: (key: string) => string; tl: <T = unknown>(key: string) => T[] };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && saved in dictionaries) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);
  const t = useCallback((key: string) => {
    const v = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key);
    return typeof v === "string" ? v : key;
  }, [lang]);
  const tl = useCallback(<T,>(key: string) => {
    const v = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key);
    return (Array.isArray(v) ? v : []) as T[];
  }, [lang]);
  return <I18nContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, t, tl }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
