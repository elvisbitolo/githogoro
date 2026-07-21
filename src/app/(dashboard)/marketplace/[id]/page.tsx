"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  Trash2,
  ShoppingBag,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"

interface MarketplaceItem {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  photos: string[]
  location: string | null
  status: string
  createdAt: string
  seller: {
    id: string
    name: string
    avatarUrl: string | null
    phone: string
  }
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

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-zinc-200 text-zinc-500",
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Electronics",
  furniture: "Furniture",
  clothing: "Clothing",
  food: "Food",
  vehicles: "Vehicles",
  services: "Services",
  other: "Other",
}

export default function MarketplaceItemPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [item, setItem] = useState<MarketplaceItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/marketplace/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleMessageSeller = useCallback(async () => {
    if (!item) return
    const res = await fetch("/api/conversations/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: item.seller.id }),
    })
    if (res.ok) {
      const conv = await res.json()
      router.push(`/chat/${conv.id}`)
    }
  }, [item, router])

  const handleDelete = useCallback(async () => {
    if (!item) return
    if (!confirm("Delete this listing?")) return
    const res = await fetch(`/api/marketplace/${item.id}`, {
      method: "DELETE",
    })
    if (res.ok) router.push("/marketplace")
  }, [item, router])

  const handleMarkSold = useCallback(async () => {
    if (!item) return
    const res = await fetch(`/api/marketplace/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sold" }),
    })
    if (res.ok) {
      setItem((prev) => (prev ? { ...prev, status: "sold" } : prev))
    }
  }, [item])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
          <div className="aspect-square bg-zinc-100 rounded-2xl" />
          <div className="h-6 bg-zinc-100 rounded w-3/4" />
          <div className="h-4 bg-zinc-100 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Item not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = userId === item.seller.id
  const hasPhotos = item.photos && item.photos.length > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      {hasPhotos ? (
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-4">
          <Image
            src={item.photos[currentPhoto]}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          {item.photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentPhoto((prev) =>
                    prev === 0 ? item.photos.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() =>
                  setCurrentPhoto((prev) =>
                    prev === item.photos.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {item.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPhoto ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          className={`aspect-square rounded-2xl bg-gradient-to-br ${
            GRADIENTS[item.title.charCodeAt(0) % GRADIENTS.length]
          } flex items-center justify-center mb-4`}
        >
          <ShoppingBag className="h-20 w-20 text-white/40" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <p className="text-emerald-700 font-bold text-xl mt-1">
            Ksh {item.price.toLocaleString()}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_COLORS[item.status] || ""
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
        {item.location && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3" />
            {item.location}
          </span>
        )}
      </div>

      {item.description && (
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed whitespace-pre-wrap">
          {item.description}
        </p>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.seller.avatarUrl ? (
                <Image
                  src={item.seller.avatarUrl}
                  alt={item.seller.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold text-sm">
                    {item.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{item.seller.name}</p>
                <p className="text-xs text-zinc-500">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
            </div>
            {!isOwner && item.status === "available" && (
              <Button
                onClick={handleMessageSeller}
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Message Seller
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <div className="flex gap-2">
          {item.status === "available" && (
            <Button
              onClick={handleMarkSold}
              variant="outline"
              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Mark as Sold
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
