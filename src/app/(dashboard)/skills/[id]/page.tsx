"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Star, MapPin, MessageSquare, Wrench } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"

interface SkillReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: { id: string; name: string; avatarUrl: string | null }
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
  photos: string[]
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; phone: string }
  reviews: SkillReview[]
}

export default function SkillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/skills/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setSkill(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleSubmitReview = useCallback(async () => {
    if (!skill) return
    setSubmittingReview(true)
    setReviewError("")

    const res = await fetch(`/api/skills/${skill.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment || null }),
    })

    if (!res.ok) {
      const data = await res.json()
      setReviewError(data.error || "Failed to submit review")
      setSubmittingReview(false)
      return
    }

    const newReview = await res.json()
    setSkill((prev) =>
      prev
        ? {
            ...prev,
            reviews: [newReview, ...prev.reviews],
            rating: [...prev.reviews, newReview].reduce((a, r) => a + r.rating, 0) / [...prev.reviews, newReview].length,
            reviewCount: prev.reviewCount + 1,
          }
        : prev
    )
    setReviewDialogOpen(false)
    setReviewComment("")
    setReviewRating(5)
    setSubmittingReview(false)
  }, [skill, reviewRating, reviewComment])

  const handleDelete = useCallback(async () => {
    if (!skill) return
    if (!confirm("Delete this skill listing?")) return
    const res = await fetch(`/api/skills/${skill.id}`, { method: "DELETE" })
    if (res.ok) router.push("/skills")
  }, [skill, router])

  const handleContact = useCallback(async () => {
    if (!skill) return
    const res = await fetch("/api/conversations/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: skill.user.id }),
    })
    if (res.ok) {
      const conv = await res.json()
      router.push(`/chat/${conv.id}`)
    }
  }, [skill, router])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
          <div className="h-40 bg-zinc-100 rounded-2xl" />
          <div className="h-6 bg-zinc-100 rounded w-3/4" />
          <div className="h-4 bg-zinc-100 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href="/skills" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Skills
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Skill not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = userId === skill.user.id

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/skills" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Skills
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{skill.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {skill.category}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            skill.availability === "available" ? "bg-emerald-100 text-emerald-700" : skill.availability === "busy" ? "bg-amber-100 text-amber-700" : "bg-zinc-200 text-zinc-500"
          }`}>
            {skill.availability}
          </span>
          {skill.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
              <Star className="h-4 w-4 fill-amber-400" />
              {skill.rating.toFixed(1)} ({skill.reviewCount})
            </span>
          )}
        </div>
        {skill.priceRange && (
          <p className="text-emerald-700 font-bold text-lg mt-2">{skill.priceRange}</p>
        )}
        {skill.description && (
          <p className="text-sm text-zinc-600 mt-3 leading-relaxed whitespace-pre-wrap">
            {skill.description}
          </p>
        )}
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {skill.user.avatarUrl ? (
                <img src={skill.user.avatarUrl} alt={skill.user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold text-sm">{skill.user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{skill.user.name}</p>
                <p className="text-xs text-zinc-500">{formatRelativeTime(skill.createdAt)}</p>
              </div>
            </div>
            {!isOwner && skill.availability === "available" && (
              <Button onClick={handleContact} size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Contact
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <div className="flex gap-2 mb-4">
          <Button onClick={handleDelete} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            Delete
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reviews ({skill.reviewCount})</h2>
        {!isOwner && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700">
                <Star className="h-4 w-4 mr-1" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review {skill.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setReviewRating(r)}
                        className="p-0.5"
                      >
                        <Star className={`h-6 w-6 ${r <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="flex w-full mt-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-none"
                  />
                </div>
                {reviewError && (
                  <p className="text-sm text-red-600">{reviewError}</p>
                )}
                <Button onClick={handleSubmitReview} disabled={submittingReview} className="w-full">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {skill.reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500">No reviews yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {skill.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {review.reviewer.avatarUrl ? (
                    <img src={review.reviewer.avatarUrl} alt={review.reviewer.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 font-semibold text-xs">{review.reviewer.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{review.reviewer.name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400 ml-auto">{formatRelativeTime(review.createdAt)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-zinc-600 mt-1">{review.comment}</p>
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
