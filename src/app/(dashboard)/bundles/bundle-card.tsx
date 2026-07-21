"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, ExternalLink, Share2 } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"

const PROVIDER_CONFIG: Record<string, { color: string; bg: string; text: string }> = {
  safaricom: { color: "#E3002B", bg: "bg-red-50", text: "text-red-700" },
  airtel: { color: "#ED1C24", bg: "bg-red-50", text: "text-red-700" },
  telkom: { color: "#00A651", bg: "bg-emerald-50", text: "text-emerald-700" },
  other: { color: "#71717a", bg: "bg-zinc-100", text: "text-zinc-600" },
}

interface Bundle {
  id: string
  name: string
  provider: string
  price: number
  dataAmount: string
  validity: string
  category: string
  url: string | null
  description: string | null
  upvotes: number
  downvotes: number
  createdBy: string
  createdAt: string
  creator?: { id: string; name: string; avatarUrl: string | null }
}

interface BundleCardProps {
  bundle: Bundle
  userVote?: string | null
  onVote?: (bundleId: string, type: string) => void
}

export function BundleCard({ bundle, userVote, onVote }: BundleCardProps) {
  const config = PROVIDER_CONFIG[bundle.provider] || PROVIDER_CONFIG.other
  const score = bundle.upvotes - bundle.downvotes

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={() => onVote?.(bundle.id, "up")}
              className={`p-1.5 rounded-lg transition-colors ${
                userVote === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <span
              className={`text-sm font-semibold tabular-nums ${
                score > 0 ? "text-emerald-600" : score < 0 ? "text-red-500" : "text-zinc-500"
              }`}
            >
              {score}
            </span>
            <button
              onClick={() => onVote?.(bundle.id, "down")}
              className={`p-1.5 rounded-lg transition-colors ${
                userVote === "down"
                  ? "bg-red-100 text-red-600"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: config.color + "15", color: config.color }}
              >
                {bundle.provider.charAt(0).toUpperCase() + bundle.provider.slice(1)}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {bundle.category}
              </Badge>
            </div>

            <Link href={`/bundles/${bundle.id}`}>
              <h3 className="font-semibold text-zinc-900 hover:underline truncate">
                {bundle.name}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="font-bold text-emerald-700">
                Ksh {bundle.price.toLocaleString()}
              </span>
              <span className="text-zinc-500">{bundle.dataAmount}</span>
              <span className="text-zinc-400">{bundle.validity}</span>
            </div>

            {bundle.description && (
              <p className="text-xs text-zinc-500 mt-2 line-clamp-1">{bundle.description}</p>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
              <span>{bundle.creator?.name}</span>
              <span>{formatRelativeTime(bundle.createdAt)}</span>
              {bundle.url && (
                <a
                  href={bundle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Link
                </a>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: bundle.name, url: `/bundles/${bundle.id}` })
                  }
                }}
                className="inline-flex items-center gap-1 hover:text-zinc-600"
              >
                <Share2 className="h-3 w-3" />
                Share
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
