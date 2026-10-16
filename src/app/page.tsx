"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageSquare, Briefcase, MapPin, Store, Video, Calendar, Shield, ChevronRight, UserPlus, MessageCircle, HeartHandshake, CheckCircle, Star, HelpCircle, Zap, ShieldCheck, Globe2 } from "lucide-react"
import { LanguageToggle } from "@/components/LanguageToggle"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { useTranslations } from "@/lib/i18n/context"

const icons = { MessageSquare, Briefcase, MapPin, Store, Video, Calendar, Shield }
const stepIcons = { UserPlus, MessageCircle, HeartHandshake }
const FOOTER_YEAR = new Date().getFullYear()

interface Stats {
  residents: number
  jobs: number
  businesses: number
  activeUsers: number
}

export default function LandingPage() {
  const { t } = useTranslations()
  const [stats, setStats] = useState<Stats>({ residents: 0, jobs: 0, businesses: 0, activeUsers: 0 })

  const [loadingStats, setLoadingStats] = useState(true)
  
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false))
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
    { label: t.landing.statResidents, value: stats.residents > 0 ? stats.residents.toLocaleString() : (loadingStats ? "—" : "2,000+") },
    { label: t.landing.statJobs, value: stats.jobs > 0 ? stats.jobs.toLocaleString() : (loadingStats ? "—" : "150+") },
    { label: t.landing.statBiz, value: stats.businesses > 0 ? stats.businesses.toLocaleString() : (loadingStats ? "—" : "80+") },
    { label: t.landing.statActive, value: stats.activeUsers > 0 ? stats.activeUsers.toLocaleString() : (loadingStats ? "—" : "500+") },
  ]

  const aboutItems = [
    { icon: ShieldCheck, title: t.landing.aboutItem1Title, desc: t.landing.aboutItem1Desc },
    { icon: Zap, title: t.landing.aboutItem2Title, desc: t.landing.aboutItem2Desc },
    { icon: Globe2, title: t.landing.aboutItem3Title, desc: t.landing.aboutItem3Desc },
  ]

  const testimonials = [
    { name: t.landing.testimonial1Name, quote: t.landing.testimonial1Quote },
    { name: t.landing.testimonial2Name, quote: t.landing.testimonial2Quote },
    { name: t.landing.testimonial3Name, quote: t.landing.testimonial3Quote },
  ]

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
    { q: t.landing.faq5Q, a: t.landing.faq5A },
  ]

  const steps = [
    { icon: "UserPlus" as const, title: t.landing.step1Title, desc: t.landing.step1Desc },
    { icon: "MessageCircle" as const, title: t.landing.step2Title, desc: t.landing.step2Desc },
    { icon: "HeartHandshake" as const, title: t.landing.step3Title, desc: t.landing.step3Desc },
  ]

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg dark:text-zinc-100">{t.site.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <DarkModeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors shadow-sm dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden text-white min-h-[90vh] sm:min-h-screen">
        <div className="absolute inset-0">
          <Image
            src="/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-transparent dark:from-zinc-950/80 dark:via-zinc-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-black/5 dark:from-zinc-950/70" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-32 sm:pt-40 md:pt-52 pb-24 sm:pb-28 relative">
          <div className="max-w-2xl flex flex-col items-center text-center mx-auto">
            <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] text-balance">
              {t.landing.hero}{" "}
              <span className="text-amber-400 whitespace-nowrap">{t.landing.community}</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/90 dark:text-zinc-100/90 max-w-lg max-sm:max-w-[22rem] mb-8 leading-relaxed [text-shadow:0_1px_6px_rgba(0,0,0,0.55)] text-pretty">
              {t.landing.heroDesc}
            </p>
            <div className="flex flex-col min-[380px]:flex-row gap-3 min-[380px]:gap-4 w-full min-[380px]:w-auto max-w-[20rem] min-[380px]:max-w-none mx-auto">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-8 text-base font-semibold text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 w-full min-[380px]:w-auto dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                {t.nav.signUp}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/15 backdrop-blur-md px-8 text-base font-medium text-white hover:bg-white/25 transition-all w-full min-[380px]:w-auto dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {t.nav.signIn}
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="border-t border-white/10 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-sm text-emerald-100/70 dark:text-zinc-100/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 border-y border-zinc-100 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
            {t.landing.trustBar}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.aboutTitle}</h2>
            <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto leading-relaxed dark:text-zinc-400">
              {t.landing.aboutDesc}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutItems.map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 mb-4">
                  <item.icon className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 dark:text-zinc-100">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-950 dark:to-zinc-900/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.featuresTitle}</h2>
            <p className="text-zinc-500 max-w-lg mx-auto dark:text-zinc-400">
              {t.landing.featuresDesc}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-100 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800/40 dark:hover:shadow-emerald-900/10"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:scale-110 transition-all duration-300 dark:bg-emerald-900/40 dark:group-hover:bg-emerald-700">
                  {(() => { const Icon = icons[feature.icon]; return <Icon className="h-6 w-6 text-emerald-700 group-hover:text-white transition-colors dark:text-emerald-300" /> })()}
                </div>
                <h3 className="font-semibold text-lg mb-2 dark:text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed dark:text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-950 dark:to-zinc-900/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.stepsTitle}</h2>
            <p className="text-zinc-500 max-w-lg mx-auto dark:text-zinc-400">{t.landing.stepsDesc}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {steps.map((step, i) => {
              const Icon = stepIcons[step.icon]
              return (
                <div key={step.title} className="relative text-center">
                  {i < 2 && (
                    <div className="hidden sm:block absolute top-7 left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] border-t-2 border-dashed border-emerald-200 dark:border-emerald-900/60" />
                  )}
                  <div className="relative inline-flex h-14 w-14 rounded-2xl bg-emerald-700 text-white items-center justify-center shadow-lg shadow-emerald-700/30 mb-5 dark:bg-emerald-700 dark:shadow-emerald-900/40">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-500 text-xs font-bold flex items-center justify-center shadow dark:bg-amber-500">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 dark:text-zinc-100">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto dark:text-zinc-400">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.statsTitle}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto dark:text-zinc-400">{t.landing.statsDesc}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">{stats.residents > 0 ? stats.residents.toLocaleString() : "2,000+"}</div>
              <p className="text-zinc-600 dark:text-zinc-400">{t.landing.statResidents}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">{stats.jobs > 0 ? stats.jobs.toLocaleString() : "150+"}</div>
              <p className="text-zinc-600 dark:text-zinc-400">{t.landing.statJobs}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">{stats.businesses > 0 ? stats.businesses.toLocaleString() : "80+"}</div>
              <p className="text-zinc-600 dark:text-zinc-400">{t.landing.statBiz}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">{stats.activeUsers > 0 ? stats.activeUsers.toLocaleString() : "500+"}</div>
              <p className="text-zinc-600 dark:text-zinc-400">{t.landing.statActive}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-emerald-50/40 dark:from-zinc-950 dark:to-zinc-900/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.testimonialTitle}</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto dark:text-zinc-400">{t.landing.testimonialDesc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">“{testimonial.quote}”</p>
                <p className="font-semibold dark:text-zinc-100">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-zinc-100">{t.landing.faqTitle}</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto dark:text-zinc-400">{t.landing.faqDesc}</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-zinc-100">{faq.q}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white dark:from-emerald-800 dark:to-emerald-900">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-emerald-100 mb-8 text-lg leading-relaxed">
              {t.landing.ctaDesc}
            </p>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white text-emerald-700 px-8 text-base font-semibold hover:bg-emerald-50 transition-all shadow-lg"
            >
              {t.landing.ctaButton}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Githogoro — SEO content */}
      <section className="py-20 sm:py-28 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center dark:text-zinc-100">
            {t.landing.seoTitle}
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>{t.landing.seoP1}</p>
            <p>{t.landing.seoP2}</p>
            <p>{t.landing.seoP3}</p>
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4 text-center dark:text-zinc-100">
              {t.landing.seoLinksTitle}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/news" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                {t.landing.seoLinkNews}
              </Link>
              <Link href="/jobs" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                {t.landing.seoLinkJobs}
              </Link>
              <Link href="/businesses" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                {t.landing.seoLinkBusinesses}
              </Link>
              <Link href="/marketplace" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                {t.landing.seoLinkMarketplace}
              </Link>
              <Link href="/events" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                {t.landing.seoLinkEvents}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/news" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              News
            </Link>
            <Link href="/jobs" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Jobs
            </Link>
            <Link href="/businesses" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Businesses
            </Link>
            <Link href="/marketplace" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Marketplace
            </Link>
            <Link href="/events" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Events
            </Link>
            <Link href="/privacy" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Data Deletion
            </Link>
          </nav>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {FOOTER_YEAR} {t.site.name}. {t.landing.footer}
          </p>
        </div>
      </footer>
    </div>
  )
}
