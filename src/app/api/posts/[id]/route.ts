import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
        comments: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        likes: user
          ? { where: { userId: user.id }, select: { type: true } }
          : false,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const enriched = {
      ...post,
      userReaction: Array.isArray(post.likes) && post.likes.length > 0 ? post.likes[0].type : null,
      likes: undefined,
    }

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 })
    if (existing.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const { content, mediaUrls, location, privacy } = body

    const post = await prisma.post.update({
      where: { id },
      data: {
        content: content !== undefined ? content : existing.content,
        mediaUrls: mediaUrls !== undefined ? mediaUrls : existing.mediaUrls,
        location: location !== undefined ? location : existing.location,
        privacy: privacy !== undefined ? privacy : existing.privacy,
        isEdited: true,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 })
    if (existing.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.post.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
