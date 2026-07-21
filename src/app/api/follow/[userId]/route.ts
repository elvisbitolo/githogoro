import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/notifications"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const following = user
      ? await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: user.id, followingId: userId } },
        })
      : null

    const followersCount = await prisma.follow.count({ where: { followingId: userId } })
    const followingCount = await prisma.follow.count({ where: { followerId: userId } })

    return NextResponse.json({
      isFollowing: !!following,
      followersCount,
      followingCount,
    })
  } catch (error) {
    console.error("GET /api/follow/[userId] error:", error)
    return NextResponse.json({ error: "Failed to fetch follow status" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (user.id === userId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: userId } },
    })

    if (existing) {
      return NextResponse.json({ isFollowing: true })
    }

    await prisma.follow.create({
      data: { followerId: user.id, followingId: userId },
    })

    await createNotification({
      userId,
      type: "follow",
      title: "New follower",
      body: "started following you",
      link: `/profile?id=${user.id}`,
      fromUserId: user.id,
      entityId: user.id,
      entityType: "user",
    })

    const followersCount = await prisma.follow.count({ where: { followingId: userId } })

    return NextResponse.json({ isFollowing: true, followersCount })
  } catch (error) {
    console.error("POST /api/follow/[userId] error:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: userId } },
    })

    if (!existing) {
      return NextResponse.json({ isFollowing: false })
    }

    await prisma.follow.delete({ where: { id: existing.id } })

    const followersCount = await prisma.follow.count({ where: { followingId: userId } })

    return NextResponse.json({ isFollowing: false, followersCount })
  } catch (error) {
    console.error("DELETE /api/follow/[userId] error:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
