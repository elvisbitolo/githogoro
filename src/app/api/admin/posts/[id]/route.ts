import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, content: true, userId: true },
  })
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.commentLike.deleteMany({ where: { comment: { postId: id } } }),
    prisma.postComment.deleteMany({ where: { postId: id } }),
    prisma.postLike.deleteMany({ where: { postId: id } }),
    prisma.postShare.deleteMany({ where: { postId: id } }),
    prisma.savedPost.deleteMany({ where: { postId: id } }),
    prisma.post.delete({ where: { id } }),
  ])

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "delete_post",
      targetId: id,
      details: { content: post.content?.slice(0, 100), authorId: post.userId },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true })
}
