"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { en, sw } from "./translations"

export type Language = "en" | "sw"
type Translations = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const translations: Record<Language, Translations> = { en, sw }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslations() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useTranslations must be used within LanguageProvider")
  return ctx
}
