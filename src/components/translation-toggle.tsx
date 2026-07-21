"use client"

import { useState, useCallback } from "react"
import { Globe, Loader2, ArrowRight } from "lucide-react"
import { translateText, detectLanguage } from "@/lib/translate"

type Language = "en" | "sw"

interface TranslationToggleProps {
  text: string
  sourceLang?: Language
}

export function TranslationToggle({
  text,
  sourceLang: providedLang,
}: TranslationToggleProps) {
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  const sourceLang = providedLang ?? detectLanguage(text)
  const targetLang: Language = sourceLang === "en" ? "sw" : "en"

  const handleTranslate = useCallback(async () => {
    if (translated) {
      setShowTranslation((prev) => !prev)
      return
    }
    setLoading(true)
    try {
      const result = await translateText(text, targetLang)
      setTranslated(result)
      setShowTranslation(true)
    } finally {
      setLoading(false)
    }
  }, [text, targetLang, translated])

  return (
    <div className="inline-flex flex-col gap-1 mt-1">
      <div className="inline-flex items-center gap-1">
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Globe className="h-3 w-3" />
          )}
          {loading
            ? "Translating..."
            : showTranslation
              ? "Original"
              : "Translate"}
        </button>
        {showTranslation && translated && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span className="uppercase font-medium">{sourceLang}</span>
            <ArrowRight className="h-2.5 w-2.5" />
            <span className="uppercase font-medium">{targetLang}</span>
          </span>
        )}
      </div>
      {showTranslation && translated && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {translated}
        </div>
      )}
    </div>
  )
}
