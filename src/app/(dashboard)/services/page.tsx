"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Phone,
  MapPin,
  Star,
  Wrench,
  Zap,
  Droplets,
  Wifi,
  Truck,
  UtensilsCrossed,
  Home,
  Shield,
  HeartPulse,
  GraduationCap,
  Hammer,
  Car,
  Dog,
  Baby,
  Flower2,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface SkillUser {
  id: string
  name: string
  avatarUrl: string | null
  phone: string | null
  zone: string | null
  isVerified: boolean
}

interface Skill {
  id: string
  title: string
  description: string | null
  category: string
  priceRange: string | null
  availability: string
  rating: number
  reviewCount: number
  user: SkillUser
  createdAt: string
}

const SERVICE_CATEGORIES = [
  { key: "all", label: "All", icon: Search },
  { key: "plumbing", label: "Plumbers", icon: Droplets },
  { key: "electrical", label: "Electricians", icon: Zap },
  { key: "carpentry", label: "Carpenters", icon: Hammer },
  { key: "mechanic", label: "Mechanics", icon: Wrench },
  { key: "transport", label: "Transport", icon: Car },
  { key: "food", label: "Food/Catering", icon: UtensilsCrossed },
  { key: "cleaning", label: "Cleaning", icon: Home },
  { key: "security", label: "Security", icon: Shield },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "education", label: "Tutoring", icon: GraduationCap },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "wifi", label: "WiFi/Internet", icon: Wifi },
  { key: "pet", label: "Pet Care", icon: Dog },
  { key: "childcare", label: "Childcare", icon: Baby },
  { key: "farming", label: "Farming", icon: Flower2 },
]

const CATEGORY_COLORS: Record<string, string> = {
  plumbing: "bg-blue-100 text-blue-700",
  electrical: "bg-yellow-100 text-yellow-700",
  carpentry: "bg-amber-100 text-amber-700",
  mechanic: "bg-zinc-100 text-zinc-700",
  transport: "bg-green-100 text-green-700",
  food: "bg-orange-100 text-orange-700",
  cleaning: "bg-cyan-100 text-cyan-700",
  security: "bg-red-100 text-red-700",
  health: "bg-pink-100 text-pink-700",
  education: "bg-indigo-100 text-indigo-700",
  delivery: "bg-purple-100 text-purple-700",
  wifi: "bg-sky-100 text-sky-700",
  pet: "bg-lime-100 text-lime-700",
  childcare: "bg-rose-100 text-rose-700",
  farming: "bg-emerald-100 text-emerald-700",
}

export default function ServicesPage() {
  const [services, setServices] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setServices(Array.isArray(data) ? data : [])
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = services.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory
    if (!searchQuery.trim()) return matchesCategory
    const q = searchQuery.toLowerCase()
    return matchesCategory && (
      s.title.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.user.name.toLowerCase().includes(q) ||
      s.user.zone?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Service Directory</h1>
          <p className="text-sm text-zinc-500">Find trusted service providers in Githogoro</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services, providers..."
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No services listed yet</p>
            <p className="text-sm text-zinc-400 mt-1 mb-4">Be the first to list your service in Githogoro</p>
            <Link href="/skills/new">
              <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Add Your Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Wrench className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm text-zinc-900 truncate">{service.title}</h3>
                      {service.user.isVerified && (
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100">
                          <svg className="h-2.5 w-2.5 text-emerald-700" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">by {service.user.name}</p>
                    {service.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[service.category] || "bg-zinc-100 text-zinc-700"}`}>
                        {service.category}
                      </span>
                      {service.user.zone && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <MapPin className="h-3 w-3" /> {service.user.zone}
                        </span>
                      )}
                      {service.priceRange && (
                        <span className="text-[10px] text-zinc-500 font-medium">{service.priceRange}</span>
                      )}
                      {service.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400" /> {service.rating.toFixed(1)} ({service.reviewCount})
                        </span>
                      )}
                    </div>
                    {service.user.phone && (
                      <div className="flex gap-2 mt-3">
                        <a href={`tel:${service.user.phone}`}>
                          <Button size="sm" className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                            <Phone className="h-3 w-3" /> Call
                          </Button>
                        </a>
                        <a href={`https://wa.me/${service.user.phone.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                            WhatsApp
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
