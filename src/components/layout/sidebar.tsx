"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  MapPin,
  Store,
  User,
  Users,
  LogOut,
  Video,
  Calendar,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"

export function Sidebar() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { href: "/dashboard", label: t.nav.home, icon: LayoutDashboard },
    { href: "/chat", label: t.nav.chat, icon: MessageSquare },
    { href: "/jobs", label: t.nav.jobs, icon: Briefcase },
    { href: "/map", label: t.nav.map, icon: MapPin },
    { href: "/businesses", label: t.nav.businesses, icon: Store },
    { href: "/people", label: t.nav.people, icon: Users },
    { href: "/videos", label: t.nav.videos, icon: Video },
    { href: "/marketplace", label: t.nav.marketplace, icon: ShoppingBag },
    { href: "/events", label: t.nav.events, icon: Calendar },
    { href: "/alerts", label: t.nav.alerts, icon: AlertTriangle },
    { href: "/profile", label: t.nav.profile, icon: User },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-zinc-100 bg-white h-dvh sticky top-0">
      <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">{t.site.name}</span>
        </div>
        <LanguageToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-zinc-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-zinc-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t.nav.signOut}
        </button>
      </div>
    </aside>
  )
}
