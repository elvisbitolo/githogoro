"use client"

import { useTranslations } from "@/lib/i18n/context"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useTranslations()

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "sw" : "en")}
      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
      title={language === "en" ? "Switch to Kiswahili" : "Badilisha kwa Kiingereza"}
    >
      <Languages className="h-3.5 w-3.5" />
      {language === "en" ? "SW" : "EN"}
    </button>
  )
}
