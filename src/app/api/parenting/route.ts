import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const posts = await prisma.parentingPost.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error("GET /api/parenting error:", error)
    return NextResponse.json({ error: "Failed to fetch parenting posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, content, category } = body

    const post = await prisma.parentingPost.create({
      data: {
        userId: user.id,
        title,
        content,
        category,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("POST /api/parenting error:", error)
    return NextResponse.json({ error: "Failed to create parenting post" }, { status: 500 })
  }
}
