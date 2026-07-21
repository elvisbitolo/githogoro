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

    const ride = await prisma.rideShare.findUnique({ where: { id } })
    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    if (ride.status !== "scheduled") return NextResponse.json({ error: "Ride is no longer available" }, { status: 400 })
    if (ride.driverId === user.id) return NextResponse.json({ error: "Cannot join your own ride" }, { status: 400 })
    if (ride.seats <= 0) return NextResponse.json({ error: "No seats available" }, { status: 400 })

    const updated = await prisma.rideShare.update({
      where: { id },
      data: {
        riderId: user.id,
        seats: ride.seats - 1,
        status: ride.seats - 1 <= 0 ? "full" : "scheduled",
      },
      include: {
        driver: { select: { id: true, name: true, avatarUrl: true, zone: true } },
        rider: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("POST /api/rides/[id]/join error:", error)
    return NextResponse.json({ error: "Failed to join ride" }, { status: 500 })
  }
}
