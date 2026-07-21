import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription || !userId) {
      return NextResponse.json({ error: "Missing subscription or userId" }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where: { userId },
      update: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || "",
        auth: subscription.keys?.auth || "",
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || "",
        auth: subscription.keys?.auth || "",
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/notifications/subscribe error:", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}
