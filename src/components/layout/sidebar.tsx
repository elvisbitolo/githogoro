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
  Stethoscope,
  ClipboardList,
  HandHeart,
  UserPlus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [adminKey, setAdminKey] = useState("")
  const [adminError, setAdminError] = useState("")
  const [adminAttempts, setAdminAttempts] = useState(0)

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
    { href: "/profile", label: t.nav.profile, icon: User },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleAdminKey = () => {
    if (adminAttempts >= 5) {
      setAdminError("Too many attempts. Try again later.")
      return
    }
    if (adminKey === "caroline") {
      setShowAdminDialog(false)
      setAdminKey("")
      setAdminError("")
      router.push("/c-panel")
    } else {
      setAdminAttempts((a) => a + 1)
      setAdminError("Invalid key")
      setAdminKey("")
    }
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

      <div className="p-3 border-t border-zinc-100 space-y-1">
        <button
          onClick={() => setShowAdminDialog(true)}
          className="flex w-full items-center justify-center gap-1 text-[10px] text-zinc-300 hover:text-zinc-400 transition-colors py-1 select-none"
        >
          <Leaf className="h-3 w-3" />
          <span className="tracking-widest">✦</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t.nav.signOut}
        </button>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Access key"
              value={adminKey}
              onChange={(e) => { setAdminKey(e.target.value); setAdminError("") }}
              onKeyDown={(e) => e.key === "Enter" && handleAdminKey()}
            />
            {adminError && <p className="text-sm text-red-500">{adminError}</p>}
            <Button onClick={handleAdminKey} className="w-full bg-emerald-700 hover:bg-emerald-800">
              Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
