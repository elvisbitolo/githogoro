import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.category = category
    }

    const clinics = await prisma.clinicListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(clinics)
  } catch (error) {
    console.error("GET /api/health/clinics error:", error)
    return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, category, description, phone, location, openingHours } = body

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }

    const clinic = await prisma.clinicListing.create({
      data: {
        name,
        category,
        description: description || null,
        phone: phone || null,
        location: location || null,
        openingHours: openingHours || null,
      },
    })

    return NextResponse.json(clinic, { status: 201 })
  } catch (error) {
    console.error("POST /api/health/clinics error:", error)
    return NextResponse.json({ error: "Failed to create clinic" }, { status: 500 })
  }
}
