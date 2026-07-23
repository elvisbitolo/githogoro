"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageSquare, Briefcase, MapPin, Store, Video, Calendar, Shield, Smartphone, ChevronRight } from "lucide-react"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"

const icons = { MessageSquare, Briefcase, MapPin, Store, Video, Calendar, Shield }

interface Stats {
  residents: number
  jobs: number
  businesses: number
  activeUsers: number
}

export default function LandingPage() {
  const { t } = useTranslations()
  const [stats, setStats] = useState<Stats>({ residents: 0, jobs: 0, businesses: 0, activeUsers: 0 })

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {})
  }, [])

  const features = [
    { icon: "MessageSquare" as const, title: t.landing.featureChat, desc: t.landing.featureChatDesc },
    { icon: "Briefcase" as const, title: t.landing.featureJobs, desc: t.landing.featureJobsDesc },
    { icon: "MapPin" as const, title: t.landing.featureMap, desc: t.landing.featureMapDesc },
    { icon: "Store" as const, title: t.landing.featureBiz, desc: t.landing.featureBizDesc },
    { icon: "Video" as const, title: t.landing.featureVideo, desc: t.landing.featureVideoDesc },
    { icon: "Shield" as const, title: t.landing.featureAlert, desc: t.landing.featureAlertDesc },
  ]

  const statItems = [
    { label: t.landing.statResidents, value: stats.residents > 0 ? stats.residents.toLocaleString() : "2,000+" },
    { label: t.landing.statJobs, value: stats.jobs > 0 ? stats.jobs.toLocaleString() : "150+" },
    { label: t.landing.statBiz, value: stats.businesses > 0 ? stats.businesses.toLocaleString() : "80+" },
    { label: t.landing.statActive, value: stats.activeUsers > 0 ? stats.activeUsers.toLocaleString() : "500+" },
  ]

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">{t.site.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors shadow-sm"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            src="/image.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/85 via-emerald-800/80 to-emerald-700/85" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-emerald-100 mb-6">
              <Smartphone className="h-4 w-4" />
              {t.landing.karibu}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              {t.landing.hero}{" "}
              <span className="text-amber-400">{t.landing.community}</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/80 max-w-lg mb-8 leading-relaxed">
              {t.landing.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-8 text-base font-semibold text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/25"
              >
                {t.nav.joinFree}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 text-base font-medium text-white hover:bg-white/20 transition-all"
              >
                {t.nav.signIn}
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-sm text-emerald-100/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.landing.featuresTitle}</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              {t.landing.featuresDesc}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:shadow-lg hover:border-emerald-100 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-700 transition-colors">
                  {(() => { const Icon = icons[feature.icon]; return <Icon className="h-6 w-6 text-emerald-700 group-hover:text-white transition-colors" /> })()}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-[#FAF9F6]">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-zinc-500 mb-8">
              {t.landing.ctaDesc}
            </p>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-8 text-base font-semibold text-white hover:bg-emerald-800 transition-all shadow-lg"
            >
              {t.landing.ctaButton}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} {t.site.name}. {t.landing.footer}
          </p>
        </div>
      </footer>
    </div>
  )
}
