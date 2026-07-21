"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, MapPin, PlusCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface LostFoundItem {
  id: string
  title: string
  description: string | null
  category: string
  location: string | null
  photo: string | null
  type: "lost" | "found"
  status: "active" | "resolved"
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

function ItemCard({ item }: { item: LostFoundItem }) {
  const isResolved = item.status === "resolved"

  return (
    <Link href={`/lost-found/${item.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isResolved ? "opacity-60" : ""}`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex gap-4">
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.title}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <Search className="h-6 w-6 text-zinc-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-base truncate ${isResolved ? "line-through" : ""}`}>
                  {item.title}
                </h3>
                <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                  {item.type === "lost" ? "Lost" : "Found"}
                </Badge>
                {isResolved && (
                  <Badge variant="secondary">Resolved</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 mb-1.5">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </p>
              {item.description && (
                <p className="text-sm text-zinc-600 line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </span>
                )}
                <span>{formatRelativeTime(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({ type }: { type: string }) {
  const label = type === "lost" ? "lost items" : type === "found" ? "found items" : "items"
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Search className="h-12 w-12 text-zinc-300 mb-4" />
        <p className="text-zinc-500 font-medium">No {label} reported</p>
        <p className="text-sm text-zinc-400 mt-1 text-center max-w-sm">
          {type === "lost"
            ? "No one has reported a lost item yet."
            : type === "found"
            ? "No one has reported a found item yet."
            : "No items have been reported yet. Be the first!"}
        </p>
      </CardContent>
    </Card>
  )
}

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/lost-found?status=active")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const lostItems = items.filter((i) => i.type === "lost")
  const foundItems = items.filter((i) => i.type === "found")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lost & Found</h1>
        <Link
          href="/lost-found/new"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Report Item
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-zinc-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-3 w-64 bg-zinc-100 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">
              All ({items.length})
            </TabsTrigger>
            <TabsTrigger
              value="lost"
              className="flex-1 data-[state=active]:text-red-700"
            >
              Lost ({lostItems.length})
            </TabsTrigger>
            <TabsTrigger
              value="found"
              className="flex-1 data-[state=active]:text-emerald-700"
            >
              Found ({foundItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-3">
              {items.length === 0 ? (
                <EmptyState type="all" />
              ) : (
                items.map((item) => <ItemCard key={item.id} item={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="lost">
            <div className="space-y-3">
              {lostItems.length === 0 ? (
                <EmptyState type="lost" />
              ) : (
                lostItems.map((item) => <ItemCard key={item.id} item={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="found">
            <div className="space-y-3">
              {foundItems.length === 0 ? (
                <EmptyState type="found" />
              ) : (
                foundItems.map((item) => <ItemCard key={item.id} item={item} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
