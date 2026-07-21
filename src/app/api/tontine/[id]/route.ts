import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const group = await prisma.tontineGroup.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { position: "asc" },
        },
        contributions: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: [{ cycle: "asc" }, { createdAt: "desc" }],
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("GET /api/tontine/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tontine group" },
      { status: 500 }
    )
  }
}
