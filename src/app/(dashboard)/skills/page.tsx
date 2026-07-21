"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Wrench, Star, Briefcase, Code, Paintbrush, Camera, Music, BookOpen, Stethoscope, Hammer, Truck } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Skill {
  id: string
  title: string
  description: string | null
  category: string
  priceRange: string | null
  availability: string
  rating: number
  reviewCount: number
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

const CATEGORIES = [
  { key: "all", label: "All", icon: Wrench },
  { key: "plumbing", label: "Plumbing", icon: Wrench },
  { key: "electrical", label: "Electrical", icon: Hammer },
  { key: "carpentry", label: "Carpentry", icon: Hammer },
  { key: "painting", label: "Painting", icon: Paintbrush },
  { key: "tech", label: "Technology", icon: Code },
  { key: "photography", label: "Photography", icon: Camera },
  { key: "music", label: "Music", icon: Music },
  { key: "tutoring", label: "Tutoring", icon: BookOpen },
  { key: "health", label: "Health", icon: Stethoscope },
  { key: "transport", label: "Transport", icon: Truck },
  { key: "beauty", label: "Beauty", icon: Paintbrush },
  { key: "other", label: "Other", icon: Briefcase },
]

const AVAILABILITY_BADGE: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  busy: "bg-amber-100 text-amber-700",
  unavailable: "bg-zinc-200 text-zinc-500",
}

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
]

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== "all") params.set("category", activeCategory)
    if (search) params.set("search", search)

    fetch(`/api/skills?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSkills(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activeCategory, search])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills Board</h1>
        <Link
          href="/skills/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Offer Skill
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((cat) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-48" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No skills found</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to offer a skill!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                <div className={`h-24 bg-gradient-to-br ${GRADIENTS[skill.title.charCodeAt(0) % GRADIENTS.length]} flex items-center justify-center`}>
                  <Wrench className="h-8 w-8 text-white/60" />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{skill.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {skill.user.name}
                  </p>
                  {skill.priceRange && (
                    <p className="text-emerald-700 font-medium text-sm mt-1">
                      {skill.priceRange}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-600">
                      {skill.category}
                    </span>
                    {skill.rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {skill.rating.toFixed(1)}
                      </span>
                    )}
                    <span className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${AVAILABILITY_BADGE[skill.availability]}`}>
                      {skill.availability}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
