"use client"

import Link from "next/link"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"

export default function NotFound() {
  const { t } = useTranslations()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-emerald-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">{t.notFound.title}</h2>
        <p className="text-zinc-500 mb-8">{t.notFound.desc}</p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
        >
          {t.notFound.home}
        </Link>
      </div>
    </div>
  )
}
