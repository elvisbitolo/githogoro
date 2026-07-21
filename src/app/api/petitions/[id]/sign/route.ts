import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { message } = body

    const petition = await prisma.petition.findUnique({ where: { id } })
    if (!petition) return NextResponse.json({ error: "Petition not found" }, { status: 404 })
    if (petition.status !== "active") return NextResponse.json({ error: "Petition is no longer active" }, { status: 400 })

    const existing = await prisma.petitionSignature.findUnique({
      where: { petitionId_userId: { petitionId: id, userId: user.id } },
    })
    if (existing) return NextResponse.json({ error: "Already signed" }, { status: 400 })

    const signature = await prisma.petitionSignature.create({
      data: {
        petitionId: id,
        userId: user.id,
        message: message || null,
      },
    })

    await prisma.petition.update({
      where: { id },
      data: { currentSignatures: { increment: 1 } },
    })

    return NextResponse.json(signature, { status: 201 })
  } catch (error) {
    console.error("POST /api/petitions/[id]/sign error:", error)
    return NextResponse.json({ error: "Failed to sign petition" }, { status: 500 })
  }
}
