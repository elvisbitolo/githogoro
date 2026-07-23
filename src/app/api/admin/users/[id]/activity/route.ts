import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      zone: true,
      avatarUrl: true,
      bio: true,
      role: true,
      reputationScore: true,
      reputationPoints: true,
      badges: true,
      isVerified: true,
      createdAt: true,
      lastSeen: true,
    },
  })

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const [messages, posts, jobs, businesses, events, harambees, skills] = await Promise.all([
    prisma.message.count({ where: { userId: id } }),
    prisma.post.count({ where: { userId: id } }),
    prisma.job.count({ where: { OR: [{ postedBy: id }, { createdBy: id }] } }),
    prisma.business.count({ where: { createdBy: id } }),
    prisma.event.count({ where: { createdBy: id } }),
    prisma.harambee.count({ where: { creatorId: id } }),
    prisma.skill.count({ where: { userId: id } }),
  ])

  const recentMessages = await prisma.message.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      text: true,
      createdAt: true,
      room: { select: { name: true } },
    },
  })

  const recentPosts = await prisma.post.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      content: true,
      createdAt: true,
      likesCount: true,
      commentsCount: true,
    },
  })

  return NextResponse.json({
    ...profile,
    activity: {
      messages,
      posts,
      jobs,
      businesses,
      events,
      harambees,
      skills,
    },
    recentMessages,
    recentPosts,
  })
}
