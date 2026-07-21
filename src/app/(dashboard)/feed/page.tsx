"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { PostCard } from "./post-card"
import { CreatePostDialog } from "./create-post-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PostAuthor {
  id: string
  name: string
  avatarUrl: string | null
  zone: string | null
}

interface PostData {
  id: string
  userId: string
  content: string | null
  mediaUrls: string[]
  location: string | null
  privacy: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  isEdited: boolean
  createdAt: string
  updatedAt: string
  userReaction: string | null
  authorProfile: PostAuthor
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchPosts = useCallback(async (cursor?: string | null) => {
    if (cursor) setLoadingMore(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams()
      if (cursor) params.set("cursor", cursor)

      const res = await fetch(`/api/posts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (cursor) {
          setPosts((prev) => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    if (!observerRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts(nextCursor)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, nextCursor, fetchPosts])

  const handlePostCreated = (newPost: PostData) => {
    setPosts((prev) => [newPost, ...prev])
    setShowCreateDialog(false)
  }

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const handlePostUpdated = (updatedPost: PostData) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Post
        </Button>
      </div>

      <Card className="mb-6 cursor-pointer hover:border-zinc-300 transition-colors" onClick={() => setShowCreateDialog(true)}>
        <CardContent className="p-4">
          <p className="text-zinc-400 text-sm">What&apos;s on your mind?</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-100">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No posts yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Be the first to share something!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div ref={observerRef} className="py-8 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-zinc-400 text-sm py-8">
          You&apos;re all caught up!
        </p>
      )}

      <CreatePostDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
