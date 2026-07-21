"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Camera, Clock, Heart } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Memory {
  id: string
  title: string
  description: string | null
  photoUrl: string
  year: number | null
  likesCount: number
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/photo-memories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMemories(data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Photo Memories</h1>
          <p className="text-zinc-500 text-sm mt-1">Share throwback moments and community memories</p>
        </div>
        <Link href="/memories/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Share Memory
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-0 h-64" /></Card>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No memories shared yet</p>
            <p className="text-sm text-zinc-400 mt-1">Share a throwback photo with the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory) => (
            <Card key={memory.id} className="overflow-hidden">
              <div className="relative">
                <img src={memory.photoUrl} alt={memory.title} className="w-full h-48 object-cover" />
                {memory.year && (
                  <Badge className="absolute top-2 right-2 bg-black/50 text-white text-[10px] backdrop-blur-sm">
                    {memory.year}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">{memory.title}</h3>
                {memory.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{memory.description}</p>}
                <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />{memory.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{formatRelativeTime(memory.createdAt)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Shared by {memory.user.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
