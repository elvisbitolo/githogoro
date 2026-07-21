"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MapPin, Clock, Phone, MessageSquare, Loader2, Store } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null }
}

interface BusinessDetail {
  id: string
  name: string
  category: string
  description: string | null
  phone: string
  photos: string[]
  avgRating: number
  reviewCount: number
  locationLat: number | null
  locationLng: number | null
  openingHours: Record<string, { open: string; close: string; closed: boolean }> | null
  isFeatured: boolean
  owner: { id: string; name: string; avatarUrl: string | null } | null
  reviews: Review[]
}

function StarRating({ rating, size = "sm", interactive = false, onRate }: {
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-5 w-5" : "h-7 w-7"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? "text-amber-500 fill-amber-500"
                : "text-zinc-200 fill-zinc-200"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}

export default function BusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [business, setBusiness] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetch(`/api/businesses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBusiness(data)
        setLoading(false)
      })
  }, [id])

  const submitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) return
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/businesses/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      })
      if (res.ok) {
        setReviewRating(0)
        setReviewComment("")
        const updated = await fetch(`/api/businesses/${id}`).then((r) => r.json())
        setBusiness(updated)
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleMessageOwner = async () => {
    if (!business?.owner) return
    const res = await fetch("/api/conversations/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: business.owner.id }),
    })
    if (res.ok) {
      router.push("/chat")
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3" />
          <div className="h-64 bg-zinc-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Business not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/businesses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{business.category}</Badge>
            {business.isFeatured && (
              <Badge variant="warning" className="gap-1">
                <Star className="h-3 w-3 fill-amber-500" /> Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      {business.photos && business.photos.length > 0 && (
        <div className="mb-6">
          <div className="h-64 sm:h-80 rounded-2xl overflow-hidden bg-zinc-100 mb-3">
            <img
              src={business.photos[activePhoto]}
              alt={business.name}
              className="h-full w-full object-cover"
            />
          </div>
          {business.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {business.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    i === activePhoto ? "border-emerald-500" : "border-transparent"
                  }`}
                >
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 space-y-4">
          {business.description && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-zinc-800 mb-2">About</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{business.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={Math.round(business.avgRating)} size="lg" />
                <div>
                  <span className="text-2xl font-bold">{business.avgRating}</span>
                  <span className="text-sm text-zinc-500 ml-1">
                    ({business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {business.locationLat && business.locationLng && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h2>
                <div className="h-48 rounded-xl overflow-hidden bg-zinc-100">
                  <iframe
                    title="Business location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.locationLng - 0.01},${business.locationLat - 0.005},${business.locationLng + 0.01},${business.locationLat + 0.005}&layer=mapnik&marker=${business.locationLat},${business.locationLng}`}
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{business.phone}</p>
                    <p className="text-xs text-zinc-500">Call now</p>
                  </div>
                </a>
              )}
              {business.owner && (
                <button
                  onClick={handleMessageOwner}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors w-full"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Message Owner</p>
                    <p className="text-xs text-zinc-500">{business.owner.name}</p>
                  </div>
                </button>
              )}
            </CardContent>
          </Card>

          {business.openingHours && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Hours
                </h2>
                <div className="space-y-2">
                  {days.map((day) => {
                    const hours = business.openingHours?.[day]
                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">{day.slice(0, 3)}</span>
                        {hours?.closed ? (
                          <span className="text-zinc-400">Closed</span>
                        ) : (
                          <span className="text-zinc-800 font-medium">
                            {hours?.open} - {hours?.close}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Reviews</h2>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-zinc-800 mb-3">Write a Review</h3>
            <div className="mb-3">
              <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
            </div>
            <textarea
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 resize-none mb-3"
            />
            <Button
              onClick={submitReview}
              disabled={submittingReview || reviewRating < 1}
              size="sm"
            >
              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </CardContent>
        </Card>

        {business.reviews && business.reviews.length > 0 ? (
          <div className="space-y-3">
            {business.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      {review.user.avatarUrl ? (
                        <img
                          src={review.user.avatarUrl}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-zinc-500">
                          {review.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.user.name}</span>
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-zinc-400 ml-auto">
                          {formatRelativeTime(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-600">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-zinc-500">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
