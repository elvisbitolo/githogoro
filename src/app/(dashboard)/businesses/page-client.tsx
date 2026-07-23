"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Store, Phone, Star, MapPin, Search } from "lucide-react"

interface Business {
  id: string
  name: string
  category: string
  description: string | null
  phone: string | null
  photos: string[]
  avgRating: number
  reviewCount: number
  isFeatured: boolean
  locationLat: number | null
  locationLng: number | null
  createdAt: string
}

const CATEGORIES = ["all", "food", "retail", "services", "health", "education", "transport", "beauty", "tech", "other"]

export default function BusinessesPageClient() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [initialized, setInitialized] = useState(false)

  const fetchBusinesses = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (category !== "all") params.set("category", category)
      if (search) params.set("search", search)
      const res = await fetch(`/api/businesses?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data)
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [category, search])

  useEffect(() => {
    setLoading(true)
    fetchBusinesses()
  }, [fetchBusinesses])

  useEffect(() => {
    const timeout = setTimeout(fetchBusinesses, 300)
    return () => clearTimeout(timeout)
  }, [search])

  if (!initialized && !loading) return null

  return (
    <>
      <div className="relative mb-4 mt-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Search businesses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" className="whitespace-nowrap capitalize flex-shrink-0" onClick={() => setCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse"><div className="h-24 bg-zinc-100 rounded-2xl" /></div>
          ))
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No businesses found</p>
            </CardContent>
          </Card>
        ) : (
          businesses.map((biz) => (
            <Link key={biz.id} href={`/businesses/${biz.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {biz.photos && biz.photos.length > 0 ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img src={biz.photos[0]} alt={biz.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <Store className="h-8 w-8 text-zinc-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{biz.name}</h3>
                        {biz.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">{biz.category}</Badge>
                      {biz.description && <p className="text-sm text-zinc-600 mt-1.5 line-clamp-2">{biz.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {biz.avgRating > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(biz.avgRating) ? "text-amber-500 fill-amber-500" : "text-zinc-200 fill-zinc-200"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-zinc-500">{biz.avgRating.toFixed(1)} ({biz.reviewCount})</span>
                          </div>
                        )}
                        {biz.phone && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500"><Phone className="h-3 w-3" /> {biz.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
