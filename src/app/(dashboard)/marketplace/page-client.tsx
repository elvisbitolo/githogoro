"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Monitor, Armchair, Shirt, Apple, Car, Wrench, Package, Search } from "lucide-react"

interface MarketplaceItem {
  id: string
  title: string
  price: number
  category: string
  photos: string[]
  status: string
  seller: { id: string; name: string; avatarUrl: string | null }
}

const CATEGORIES = [
  { key: "all", label: "All", icon: ShoppingBag },
  { key: "electronics", label: "Electronics", icon: Monitor },
  { key: "furniture", label: "Furniture", icon: Armchair },
  { key: "clothing", label: "Clothing", icon: Shirt },
  { key: "food", label: "Food", icon: Apple },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "services", label: "Services", icon: Wrench },
  { key: "other", label: "Other", icon: Package },
]

const CATEGORY_COLORS: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  furniture: "bg-amber-100 text-amber-700",
  clothing: "bg-pink-100 text-pink-700",
  food: "bg-green-100 text-green-700",
  vehicles: "bg-purple-100 text-purple-700",
  services: "bg-orange-100 text-orange-700",
  other: "bg-zinc-100 text-zinc-700",
}

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-sky-500",
  "from-lime-400 to-green-500",
]

export default function MarketplacePageClient() {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== "all") params.set("category", activeCategory)
    if (search) params.set("search", search)

    setLoading(true)
    fetch(`/api/marketplace?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
        setLoading(false)
        setInitialized(true)
      })
      .catch(() => { setLoading(false); setInitialized(true) })
  }, [activeCategory, search])

  if (!initialized && !loading) return null

  return (
    <>
      <div className="relative mb-4 mt-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.key ? "bg-emerald-700 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <Link key={item.id} href={`/marketplace/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                {item.photos && item.photos.length > 0 ? (
                  <div className="relative aspect-square bg-zinc-100">
                    <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`aspect-square bg-gradient-to-br ${GRADIENTS[item.title.charCodeAt(0) % GRADIENTS.length]} flex items-center justify-center`}>
                    <ShoppingBag className="h-12 w-12 text-white/60" />
                  </div>
                )}
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <p className="text-emerald-700 font-bold text-base mt-1">Ksh {item.price.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{item.seller.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                      {item.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
