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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (type !== "up" && type !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const bundle = await prisma.bundle.findUnique({ where: { id } })
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    const existingVote = await prisma.bundleVote.findUnique({
      where: { bundleId_userId: { bundleId: id, userId: user.id } },
    })

    if (existingVote) {
      if (existingVote.type === type) {
        await prisma.bundleVote.delete({ where: { id: existingVote.id } })
        await prisma.bundle.update({
          where: { id },
          data: type === "up" ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        })
        const updated = await prisma.bundle.findUnique({ where: { id } })
        return NextResponse.json({ upvotes: updated!.upvotes, downvotes: updated!.downvotes, voted: null })
      }

      await prisma.bundleVote.update({
        where: { id: existingVote.id },
        data: { type },
      })
      await prisma.bundle.update({
        where: { id },
        data: type === "up"
          ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
          : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
      })
      const updated = await prisma.bundle.findUnique({ where: { id } })
      return NextResponse.json({ upvotes: updated!.upvotes, downvotes: updated!.downvotes, voted: type })
    }

    await prisma.bundleVote.create({
      data: { bundleId: id, userId: user.id, type },
    })
    await prisma.bundle.update({
      where: { id },
      data: type === "up" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
    })
    const updated = await prisma.bundle.findUnique({ where: { id } })
    return NextResponse.json({ upvotes: updated!.upvotes, downvotes: updated!.downvotes, voted: type })
  } catch (error) {
    console.error("POST /api/bundles/[id]/vote error:", error)
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 })
  }
}
