import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rides = await prisma.rideShare.findMany({
      include: {
        driver: { select: { id: true, name: true, avatarUrl: true, zone: true } },
        rider: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { departureTime: "asc" },
    })
    return NextResponse.json(rides)
  } catch (error) {
    console.error("GET /api/rides error:", error)
    return NextResponse.json({ error: "Failed to fetch rides" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { from, to, departure_time, seats, price, description } = body

    const ride = await prisma.rideShare.create({
      data: {
        driverId: user.id,
        from,
        to,
        departureTime: new Date(departure_time),
        seats: seats ? Number(seats) : 1,
        price: price ? Number(price) : null,
        description: description || null,
      },
      include: {
        driver: { select: { id: true, name: true, avatarUrl: true, zone: true } },
      },
    })
    return NextResponse.json(ride, { status: 201 })
  } catch (error) {
    console.error("POST /api/rides error:", error)
    return NextResponse.json({ error: "Failed to create ride" }, { status: 500 })
  }
}
