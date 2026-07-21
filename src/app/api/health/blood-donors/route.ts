import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bloodType = searchParams.get("bloodType")

    const where: Record<string, unknown> = { isWilling: true }

    if (bloodType && bloodType !== "all") {
      where.bloodType = bloodType
    }

    const donors = await prisma.bloodDonor.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, phone: true, zone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(donors)
  } catch (error) {
    console.error("GET /api/health/blood-donors error:", error)
    return NextResponse.json({ error: "Failed to fetch blood donors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { bloodType } = body

    if (!bloodType) {
      return NextResponse.json({ error: "Blood type is required" }, { status: 400 })
    }

    const existing = await prisma.bloodDonor.findUnique({ where: { userId: user.id } })

    let donor
    if (existing) {
      donor = await prisma.bloodDonor.update({
        where: { userId: user.id },
        data: { bloodType, isWilling: true },
        include: {
          user: { select: { id: true, name: true, phone: true, zone: true } },
        },
      })
    } else {
      donor = await prisma.bloodDonor.create({
        data: { userId: user.id, bloodType },
        include: {
          user: { select: { id: true, name: true, phone: true, zone: true } },
        },
      })
    }

    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    console.error("POST /api/health/blood-donors error:", error)
    return NextResponse.json({ error: "Failed to register as donor" }, { status: 500 })
  }
}
