import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/notifications"
import { ReactionType } from "@prisma/client"

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
    const reactionType: ReactionType = body.type || "like"

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    })

    let liked: boolean
    let type: string
    let count: number

    if (existing) {
      if (existing.type === reactionType) {
        await prisma.postLike.delete({ where: { id: existing.id } })
        const updated = await prisma.post.update({
          where: { id },
          data: { likesCount: { decrement: 1 } },
        })
        liked = false
        type = reactionType
        count = updated.likesCount
      } else {
        const updatedLike = await prisma.postLike.update({
          where: { id: existing.id },
          data: { type: reactionType },
        })
        liked = true
        type = updatedLike.type
        count = post.likesCount

        if (post.userId !== user.id) {
          await createNotification({
            userId: post.userId,
            type: "like_post",
            title: "Reaction on your post",
            body: `changed reaction on your post`,
            link: `/feed/post-detail/${id}`,
            fromUserId: user.id,
            entityId: id,
            entityType: "post",
          })
        }
      }
    } else {
      await prisma.postLike.create({
        data: {
          postId: id,
          userId: user.id,
          type: reactionType,
        },
      })
      const updated = await prisma.post.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      })
      liked = true
      type = reactionType
      count = updated.likesCount

      if (post.userId !== user.id) {
        await createNotification({
          userId: post.userId,
          type: "like_post",
          title: "New reaction on your post",
          body: `reacted ${reactionType} to your post`,
          link: `/feed/post-detail/${id}`,
          fromUserId: user.id,
          entityId: id,
          entityType: "post",
        })
      }
    }

    return NextResponse.json({ liked, type, count })
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error)
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 })
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

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    })

    if (!existing) {
      return NextResponse.json({ error: "No reaction found" }, { status: 404 })
    }

    await prisma.postLike.delete({ where: { id: existing.id } })
    const updated = await prisma.post.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    })

    return NextResponse.json({ liked: false, count: updated.likesCount })
  } catch (error) {
    console.error("DELETE /api/posts/[id]/like error:", error)
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
  }
}
