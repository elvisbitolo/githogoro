"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Briefcase,
  Share2,
  Send,
  DollarSign,
} from "lucide-react"
import { formatRelativeTime, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Job {
  id: string
  title: string
  description: string
  employerName: string
  location: string
  salaryRange: string | null
  jobType: string
  contactPhone: string | null
  createdBy: string | null
  createdAt: string
}

const JOB_TYPE_BADGE: Record<string, string> = {
  "full-time": "bg-emerald-100 text-emerald-700",
  "part-time": "bg-blue-100 text-blue-700",
  casual: "bg-amber-100 text-amber-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-pink-100 text-pink-700",
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetch(`/api/jobs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((j: Job) => j.id === params.id)
          if (found) setJob(found)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleApply = async () => {
    if (!job?.createdBy) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/")
      return
    }

    setApplying(true)
    try {
      const res = await fetch("/api/conversations/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: job.createdBy }),
      })

      if (res.ok) {
        const conversation = await res.json()
        router.push(`/chat/${conversation.id}`)
      }
    } finally {
      setApplying(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.employerName}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
          <div className="h-8 bg-zinc-100 rounded w-3/4" />
          <div className="h-64 bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">Job not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    JOB_TYPE_BADGE[job.jobType] || "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {job.jobType}
                </span>
              </div>
              <p className="text-lg text-zinc-600">{job.employerName}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            {job.salaryRange && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                Ksh {job.salaryRange}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Posted {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          <div className="border-t border-zinc-100 pt-6">
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              Description
            </h2>
            <div className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {job.contactPhone && (
            <div className="border-t border-zinc-100 mt-6 pt-6">
              <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-3">
                Contact
              </h2>
              <a
                href={`tel:${job.contactPhone}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
              >
                <Phone className="h-4 w-4" />
                {job.contactPhone}
              </a>
            </div>
          )}

          <div className="border-t border-zinc-100 mt-6 pt-6">
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              Posted by
            </h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-zinc-100 text-zinc-600">
                  {job.employerName?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{job.employerName}</p>
                <p className="text-xs text-zinc-400">
                  Posted {formatDate(job.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleApply}
          disabled={applying}
          className="flex-1 gap-2"
          size="lg"
        >
          <Send className="h-4 w-4" />
          {applying ? "Connecting..." : "Apply Now"}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          size="lg"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  )
}
