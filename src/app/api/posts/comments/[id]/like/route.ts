import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
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

    const comment = await prisma.postComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 })

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId: user.id } },
    })

    let liked: boolean
    let type: string
    let count: number

    if (existing) {
      if (existing.type === reactionType) {
        await prisma.commentLike.delete({ where: { id: existing.id } })
        const updated = await prisma.postComment.update({
          where: { id },
          data: { likesCount: { decrement: 1 } },
        })
        liked = false
        type = reactionType
        count = updated.likesCount
      } else {
        const updatedLike = await prisma.commentLike.update({
          where: { id: existing.id },
          data: { type: reactionType },
        })
        liked = true
        type = updatedLike.type
        count = comment.likesCount
      }
    } else {
      await prisma.commentLike.create({
        data: {
          commentId: id,
          userId: user.id,
          type: reactionType,
        },
      })
      const updated = await prisma.postComment.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      })
      liked = true
      type = reactionType
      count = updated.likesCount
    }

    return NextResponse.json({ liked, type, count })
  } catch (error) {
    console.error("POST /api/posts/comments/[id]/like error:", error)
    return NextResponse.json({ error: "Failed to toggle comment like" }, { status: 500 })
  }
}
