import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    const [disappearing, wallpaper] = await Promise.all([
      prisma.disappearingMessageSetting.findUnique({
        where: { conversationId_userId: { conversationId, userId: user.id } },
      }),
      prisma.chatWallpaper.findUnique({
        where: { conversationId_userId: { conversationId, userId: user.id } },
      }),
    ])

    return NextResponse.json({
      disappearing: disappearing?.duration || "off",
      wallpaperUrl: wallpaper?.wallpaperUrl || null,
    })
  } catch (error) {
    console.error("GET /api/chat/settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { conversationId, disappearing, wallpaperUrl } = await request.json()
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    if (disappearing !== undefined) {
      await prisma.disappearingMessageSetting.upsert({
        where: { conversationId_userId: { conversationId, userId: user.id } },
        update: { duration: disappearing },
        create: { conversationId, userId: user.id, duration: disappearing },
      })
    }

    if (wallpaperUrl !== undefined) {
      if (wallpaperUrl) {
        await prisma.chatWallpaper.upsert({
          where: { conversationId_userId: { conversationId, userId: user.id } },
          update: { wallpaperUrl },
          create: { conversationId, userId: user.id, wallpaperUrl },
        })
      } else {
        await prisma.chatWallpaper.deleteMany({
          where: { conversationId, userId: user.id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/chat/settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
