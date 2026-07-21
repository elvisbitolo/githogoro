import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    const result =
      complaint.isAnonymous
        ? { ...complaint, user: { id: "anonymous", name: "Anonymous", avatarUrl: null } }
        : complaint

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/governance/complaints/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 })
  }
}
