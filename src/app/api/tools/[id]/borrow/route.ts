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

    const tool = await prisma.toolListing.findUnique({ where: { id } })
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    if (!tool.isAvailable) return NextResponse.json({ error: "Tool is not available" }, { status: 400 })
    if (tool.userId === user.id) return NextResponse.json({ error: "Cannot borrow your own tool" }, { status: 400 })

    const borrow = await prisma.toolBorrow.create({
      data: {
        toolId: id,
        borrowerId: user.id,
        borrowDate: new Date(),
      },
    })

    await prisma.toolListing.update({
      where: { id },
      data: { isAvailable: false },
    })

    return NextResponse.json(borrow, { status: 201 })
  } catch (error) {
    console.error("POST /api/tools/[id]/borrow error:", error)
    return NextResponse.json({ error: "Failed to borrow tool" }, { status: 500 })
  }
}
