"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Store, Phone, Star, Plus, MapPin, Search } from "lucide-react"

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

const CATEGORIES = [
  "all",
  "food",
  "retail",
  "services",
  "health",
  "education",
  "transport",
  "beauty",
  "tech",
  "other",
]

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? "text-amber-500 fill-amber-500"
              : "text-zinc-200 fill-zinc-200"
          }`}
        />
      ))}
    </div>
  )
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Local Businesses</h1>
          <p className="text-zinc-500 mt-1">Support Githogoro businesses</p>
        </div>
        <Link href="/businesses/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Business
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap capitalize flex-shrink-0"
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {!businesses || businesses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No businesses found</p>
              <p className="text-sm text-zinc-400 mt-1">
                {search ? "Try a different search" : "Be the first to add a business!"}
              </p>
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
                        <img
                          src={biz.photos[0]}
                          alt={biz.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <Store className="h-8 w-8 text-zinc-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{biz.name}</h3>
                        {biz.isFeatured && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {biz.category}
                      </Badge>
                      {biz.description && (
                        <p className="text-sm text-zinc-600 mt-1.5 line-clamp-2">
                          {biz.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {biz.avgRating > 0 && (
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={Math.round(biz.avgRating)} />
                            <span className="text-xs text-zinc-500">
                              {biz.avgRating} ({biz.reviewCount})
                            </span>
                          </div>
                        )}
                        {biz.phone && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Phone className="h-3 w-3" /> {biz.phone}
                          </span>
                        )}
                        {biz.locationLat && biz.locationLng && (
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <MapPin className="h-3 w-3" /> Map
                          </span>
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
    </div>
  )
}
