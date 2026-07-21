import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("GET /api/safety/contacts error:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, phone, relationship, bloodType, allergies, conditions, isDefault } = body

    if (isDefault) {
      await prisma.emergencyContact.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: user.id,
        name,
        phone,
        relationship,
        bloodType: bloodType || null,
        allergies: allergies || null,
        conditions: conditions || null,
        isDefault: isDefault || false,
      },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("POST /api/safety/contacts error:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
