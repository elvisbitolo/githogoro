import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/notifications"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const existing = await prisma.postShare.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    })

    if (existing) {
      return NextResponse.json({ shared: true, sharesCount: post.sharesCount })
    }

    await prisma.postShare.create({
      data: { postId: id, userId: user.id },
    })

    const updated = await prisma.post.update({
      where: { id },
      data: { sharesCount: { increment: 1 } },
    })

    if (post.userId !== user.id) {
      await createNotification({
        userId: post.userId,
        type: "share_post",
        title: "Your post was shared",
        body: "Someone shared your post",
        link: `/feed/post-detail/${id}`,
        fromUserId: user.id,
        entityId: id,
        entityType: "post",
      })
    }

    return NextResponse.json({ shared: true, sharesCount: updated.sharesCount })
  } catch (error) {
    console.error("POST /api/posts/[id]/share error:", error)
    return NextResponse.json({ error: "Failed to share post" }, { status: 500 })
  }
}
