"use client";
import { createContext, useContext, useEffect, useMemo } from "react";
import { STRINGS } from "@/i18n/strings";

const LangContext = createContext({ lang: "en", t: STRINGS.en });

export function LangProvider({ children }) {
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    try {
      localStorage.removeItem("rl-lang");
    } catch {}
  }, []);

  const value = useMemo(() => ({ lang: "en", t: STRINGS.en }), []);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);