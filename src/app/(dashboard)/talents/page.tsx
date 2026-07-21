"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Star, Play, Music, Paintbrush, Mic, Film } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Talent {
  id: string
  title: string
  description: string | null
  category: string
  mediaUrl: string | null
  likesCount: number
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

const CATEGORY_ICONS: Record<string, typeof Star> = {
  music: Music,
  art: Paintbrush,
  singing: Mic,
  dance: Star,
  comedy: Film,
  other: Star,
}

const CATEGORY_COLORS: Record<string, string> = {
  music: "bg-purple-100 text-purple-700",
  art: "bg-pink-100 text-pink-700",
  singing: "bg-blue-100 text-blue-700",
  dance: "bg-amber-100 text-amber-700",
  comedy: "bg-green-100 text-green-700",
  other: "bg-zinc-100 text-zinc-700",
}

export default function TalentsPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/talents")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTalents(data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Talent Showcase</h1>
          <p className="text-zinc-500 text-sm mt-1">Discover the amazing talents in your community</p>
        </div>
        <Link href="/talents/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Share Talent
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-48" /></Card>
          ))}
        </div>
      ) : talents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No talents shared yet</p>
            <p className="text-sm text-zinc-400 mt-1">Show the community what you can do</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {talents.map((talent) => {
            const Icon = CATEGORY_ICONS[talent.category] || Star
            return (
              <Card key={talent.id} className="overflow-hidden">
                {talent.mediaUrl && (
                  <div className="relative">
                    {talent.mediaUrl.match(/\.(mp4|webm|ogg)/i) ? (
                      <video src={talent.mediaUrl} className="w-full h-48 object-cover" controls />
                    ) : (
                      <img src={talent.mediaUrl} alt={talent.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/50 text-white text-[10px] backdrop-blur-sm">
                        <Play className="h-3 w-3 mr-1" /> Media
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${CATEGORY_COLORS[talent.category] || CATEGORY_COLORS.other} text-[10px] gap-1`}>
                      <Icon className="h-3 w-3" />{talent.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Star className="h-3 w-3" />{talent.likesCount}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{talent.title}</h3>
                  {talent.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{talent.description}</p>}
                  <p className="text-xs text-zinc-400 mt-3">
                    {talent.user.name} &middot; {formatRelativeTime(talent.createdAt)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
