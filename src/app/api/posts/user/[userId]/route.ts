import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 20

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || String(PAGE_SIZE)), 50)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const where: any = { userId }
    if (cursor) {
      const cursorPost = await prisma.post.findUnique({ where: { id: cursor } })
      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt }
      }
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
        likes: user
          ? { where: { userId: user.id }, select: { type: true } }
          : false,
      },
    })

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const enriched = items.map((post) => ({
      ...post,
      userReaction: Array.isArray(post.likes) && post.likes.length > 0 ? post.likes[0].type : null,
      likes: undefined,
    }))

    return NextResponse.json({ posts: enriched, nextCursor, hasMore })
  } catch (error) {
    console.error("GET /api/posts/user/[userId] error:", error)
    return NextResponse.json({ error: "Failed to fetch user posts" }, { status: 500 })
  }
}
