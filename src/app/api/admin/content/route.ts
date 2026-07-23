import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "harambee"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 20
  const skip = (page - 1) * limit

  try {
    let items: unknown[] = []
    let total = 0

    switch (type) {
      case "harambee": {
        const [data, count] = await Promise.all([
          prisma.harambee.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              creator: { select: { id: true, name: true } },
              _count: { select: { donations: true } },
            },
          }),
          prisma.harambee.count(),
        ])
        items = data
        total = count
        break
      }
      case "tontine": {
        const [data, count] = await Promise.all([
          prisma.tontineGroup.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              creator: { select: { id: true, name: true } },
              _count: { select: { members: true } },
            },
          }),
          prisma.tontineGroup.count(),
        ])
        items = data
        total = count
        break
      }
      case "petition": {
        const [data, count] = await Promise.all([
          prisma.petition.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              creator: { select: { id: true, name: true } },
              _count: { select: { signatures: true } },
            },
          }),
          prisma.petition.count(),
        ])
        items = data
        total = count
        break
      }
      case "event": {
        const [data, count] = await Promise.all([
          prisma.event.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              creator: { select: { id: true, name: true } },
              _count: { select: { rsvps: true } },
            },
          }),
          prisma.event.count(),
        ])
        items = data
        total = count
        break
      }
      case "job": {
        const [data, count] = await Promise.all([
          prisma.job.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              poster: { select: { id: true, name: true } },
            },
          }),
          prisma.job.count(),
        ])
        items = data
        total = count
        break
      }
      case "poll": {
        const [data, count] = await Promise.all([
          prisma.communityPoll.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              creator: { select: { id: true, name: true } },
              _count: { select: { votes: true } },
            },
          }),
          prisma.communityPoll.count(),
        ])
        items = data
        total = count
        break
      }
    }

    return NextResponse.json({ items, total, page, type })
  } catch (error) {
    console.error("GET /api/admin/content error:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  if (!type || !id) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 })
  }

  try {
    switch (type) {
      case "harambee": {
        const item = await prisma.harambee.findUnique({ where: { id }, select: { id: true, title: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.$transaction([
          prisma.harambeeDonation.deleteMany({ where: { harambeeId: id } }),
          prisma.harambee.delete({ where: { id } }),
        ])
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_harambee", targetId: id, details: { title: item.title }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      case "tontine": {
        const item = await prisma.tontineGroup.findUnique({ where: { id }, select: { id: true, name: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.$transaction([
          prisma.tontineContribution.deleteMany({ where: { groupId: id } }),
          prisma.tontineMember.deleteMany({ where: { groupId: id } }),
          prisma.tontineGroup.delete({ where: { id } }),
        ])
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_tontine", targetId: id, details: { name: item.name }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      case "petition": {
        const item = await prisma.petition.findUnique({ where: { id }, select: { id: true, title: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.$transaction([
          prisma.petitionSignature.deleteMany({ where: { petitionId: id } }),
          prisma.petition.delete({ where: { id } }),
        ])
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_petition", targetId: id, details: { title: item.title }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      case "event": {
        const item = await prisma.event.findUnique({ where: { id }, select: { id: true, title: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.$transaction([
          prisma.eventRSVP.deleteMany({ where: { eventId: id } }),
          prisma.event.delete({ where: { id } }),
        ])
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_event", targetId: id, details: { title: item.title }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      case "job": {
        const item = await prisma.job.findUnique({ where: { id }, select: { id: true, title: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.job.delete({ where: { id } })
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_job", targetId: id, details: { title: item.title }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      case "poll": {
        const item = await prisma.communityPoll.findUnique({ where: { id }, select: { id: true, question: true } })
        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
        await prisma.$transaction([
          prisma.communityPollVote.deleteMany({ where: { pollId: id } }),
          prisma.communityPoll.delete({ where: { id } }),
        ])
        await prisma.adminAction.create({
          data: { adminId: auth.userId, action: "delete_poll", targetId: id, details: { question: item.question }, ipAddress: request.headers.get("x-forwarded-for") || null },
        })
        break
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/content error:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
