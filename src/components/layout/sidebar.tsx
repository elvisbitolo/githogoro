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
  Wifi,
  Siren,
  BarChart3,
  Trophy,
  Search,
  Heart,
  Newspaper,
  Wrench,
  HeartHandshake,
  PiggyBank,
  Landmark,
  PackageCheck,
  Car,
  UtensilsCrossed,
  Hammer,
  Shield,
  HeartPulse,
  BookOpen,
  Sparkles,
  Leaf,
  ClipboardList,
  HandHeart,
  UserPlus,
  Settings,
  Bell,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"
import { useState, useEffect } from "react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

export function Sidebar() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => (res.ok ? res.json() : { isAdmin: false }))
      .then((data) => setIsUserAdmin(data.isAdmin ?? false))
      .catch(() => setIsUserAdmin(false))
    fetch("/api/notifications?unread=true&countOnly=true")
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => setUnreadCount(0))
  }, [])

  const navItems = [
    { href: "/feed", label: "Feed", icon: Newspaper },
    { href: "/dashboard", label: t.nav.home, icon: LayoutDashboard },
    { href: "/chat", label: "Messages", icon: MessageSquare },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/jobs", label: t.nav.jobs, icon: Briefcase },
    { href: "/map", label: t.nav.map, icon: MapPin },
    { href: "/businesses", label: t.nav.businesses, icon: Store },
    { href: "/people", label: t.nav.people, icon: Users },
    { href: "/videos", label: t.nav.videos, icon: Video },
    { href: "/marketplace", label: t.nav.marketplace, icon: ShoppingBag },
    { href: "/bundles", label: "Bundles", icon: Wifi },
    { href: "/events", label: t.nav.events, icon: Calendar },
    { href: "/alerts", label: t.nav.alerts, icon: AlertTriangle },
    { href: "/sos", label: "SOS", icon: Siren },
    { href: "/polls", label: "Polls", icon: BarChart3 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/lost-found", label: "Lost & Found", icon: Search },
    { href: "/stories", label: "Stories", icon: Heart },
    { href: "/skills", label: "Skills", icon: Wrench },
    { href: "/harambee", label: "Harambee", icon: HeartHandshake },
    { href: "/tontine", label: "Tontine", icon: PiggyBank },
    { href: "/loans", label: "Loans", icon: Landmark },
    { href: "/errands", label: "Errands", icon: PackageCheck },
    { href: "/rides", label: "Rides", icon: Car },
    { href: "/meals", label: "Meals", icon: UtensilsCrossed },
    { href: "/tools", label: "Tools", icon: Hammer },
    { href: "/obituaries", label: "Obituaries", icon: BookOpen },
    { href: "/talents", label: "Talents", icon: Sparkles },
    { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
    { href: "/petitions", label: "Petitions", icon: ClipboardList },
    { href: "/parenting", label: "Parenting", icon: HandHeart },
    { href: "/memories", label: "Memories", icon: Heart },
    { href: "/health", label: "Health", icon: HeartPulse },
    { href: "/governance", label: "Governance", icon: Shield },
    { href: "/partners", label: "Partners", icon: HeartHandshake },
    { href: "/invite", label: "Invite Friends", icon: UserPlus },
    { href: "/services", label: "Services", icon: Wrench },
    { href: "/profile", label: t.nav.profile, icon: User },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-dvh sticky top-0">
      <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">{t.site.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <DarkModeToggle />
        </div>
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

      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
        {isUserAdmin && (
          <Link
            href="/c-panel"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
          >
            <Leaf className="h-4 w-4" />
            <span className="text-xs">Admin Panel</span>
          </Link>
        )}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-emerald-50 text-emerald-700"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors relative",
            pathname === "/notifications"
              ? "bg-emerald-50 text-emerald-700"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          )}
        >
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
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
