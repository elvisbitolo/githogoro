import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

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

    const existing = await prisma.savedPost.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    })

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false })
    }

    await prisma.savedPost.create({
      data: { postId: id, userId: user.id },
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error("POST /api/posts/[id]/save error:", error)
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 })
  }
}
