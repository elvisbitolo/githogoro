import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 20

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || String(PAGE_SIZE)), 50)

    const followedIds = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    })
    const authorIds = [user.id, ...followedIds.map((f) => f.followingId)]

    const where: any = {
      userId: { in: authorIds },
      privacy: { not: "private" },
    }

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
        likes: {
          where: { userId: user.id },
          select: { type: true },
        },
      },
    })

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const enriched = items.map((post) => ({
      ...post,
      userReaction: post.likes[0]?.type || null,
      likes: undefined,
      authorProfile: post.user,
    }))

    return NextResponse.json({ posts: enriched, nextCursor, hasMore })
  } catch (error) {
    console.error("GET /api/posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { content, mediaUrls, location, privacy } = body

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json({ error: "Post must have content or media" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content || null,
        mediaUrls: mediaUrls || [],
        location: location || null,
        privacy: privacy || "public",
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("POST /api/posts error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
