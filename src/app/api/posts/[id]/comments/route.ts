import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/notifications"

const PAGE_SIZE = 20

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || String(PAGE_SIZE)), 50)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const where: any = { postId: id }
    if (cursor) {
      const cursorComment = await prisma.postComment.findUnique({ where: { id: cursor } })
      if (cursorComment) {
        where.createdAt = { lt: cursorComment.createdAt }
      }
    }

    const comments = await prisma.postComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        likes: user
          ? { where: { userId: user.id }, select: { type: true } }
          : false,
      },
    })

    const hasMore = comments.length > limit
    const items = hasMore ? comments.slice(0, limit) : comments
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const enriched = items.map((comment) => ({
      ...comment,
      userReaction: Array.isArray(comment.likes) && comment.likes.length > 0 ? comment.likes[0].type : null,
      likes: undefined,
    }))

    return NextResponse.json({ comments: enriched, nextCursor, hasMore })
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const comment = await prisma.postComment.create({
      data: {
        postId: id,
        userId: user.id,
        text: text.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    await prisma.post.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    })

    if (post.userId !== user.id) {
      await createNotification({
        userId: post.userId,
        type: "comment_post",
        title: "New comment on your post",
        body: text.trim().slice(0, 100),
        link: `/feed/post-detail/${id}`,
        fromUserId: user.id,
        entityId: id,
        entityType: "post",
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
