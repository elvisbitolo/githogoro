import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100)

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { likes: true, comments: true, shares: true },
        },
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("GET /api/admin/posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
