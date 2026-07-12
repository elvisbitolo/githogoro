"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, Briefcase, MapPin, Store, Users, User } from "lucide-react"
import { useTranslations } from "@/lib/i18n/context"

export function MobileNav() {
  const { t } = useTranslations()
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: t.nav.home, icon: LayoutDashboard },
    { href: "/chat", label: t.nav.chat, icon: MessageSquare },
    { href: "/jobs", label: t.nav.jobs, icon: Briefcase },
    { href: "/map", label: t.nav.map, icon: MapPin },
    { href: "/businesses", label: t.nav.shops, icon: Store },
    { href: "/people", label: t.nav.people, icon: Users },
    { href: "/profile", label: t.nav.profile, icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white/90 backdrop-blur-lg safe-area-padding">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                isActive ? "text-emerald-700" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
