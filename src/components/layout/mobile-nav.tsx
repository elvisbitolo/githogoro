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
  MoreHorizontal,
  Wifi,
  Video,
  Calendar,
  AlertTriangle,
  ShoppingBag,
  Siren,
  BarChart3,
  Trophy,
  Search,
  Heart,
  Newspaper,
  Wrench,
  HeartHandshake,
  PiggyBank,
  Car,
  HeartPulse,
  Shield,
  UserPlus,
  Settings,
  Bell,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const moreItems = [
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/bundles", label: "Bundles", icon: Wifi },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/people", label: "People", icon: Users },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/polls", label: "Polls", icon: BarChart3 },
  { href: "/stories", label: "Stories", icon: Heart },
  { href: "/skills", label: "Skills", icon: Wrench },
  { href: "/harambee", label: "Harambee", icon: HeartHandshake },
  { href: "/tontine", label: "Tontine", icon: PiggyBank },
  { href: "/errands", label: "Errands", icon: Search },
  { href: "/rides", label: "Rides", icon: Car },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/governance", label: "Governance", icon: Shield },
  { href: "/invite", label: "Invite Friends", icon: UserPlus },
  { href: "/services", label: "Services", icon: Wrench },
]

export function MobileNav() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const coreItems = [
    { href: "/feed", label: "Feed", icon: Newspaper },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/sos", label: "SOS", icon: Siren },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/map", label: "Map", icon: MapPin },
  ]

  return (
    <>
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg safe-area-padding">
      <div className="flex items-center justify-around h-16 px-1">
        {coreItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 flex-1",
                isActive ? "text-emerald-700" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          )
        })}

        <div className="relative flex-1" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors w-full",
              showMore ? "text-emerald-700 bg-emerald-50" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>

          {showMore && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 max-h-[60vh] overflow-y-auto">
              <Link
                href="/profile"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="text-sm font-medium text-zinc-700">Profile</span>
              </Link>
              <div className="border-t border-zinc-100 my-1" />
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors",
                      isActive && "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-zinc-400")} />
                    <span className={cn("text-sm", isActive ? "font-medium text-emerald-700" : "text-zinc-700")}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
              <div className="border-t border-zinc-100 my-1" />
              <Link
                href="/notifications"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
              >
                <Bell className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-700">Notifications</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-700">Settings</span>
              </Link>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-zinc-500">Dark Mode</span>
                <DarkModeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  )
}
