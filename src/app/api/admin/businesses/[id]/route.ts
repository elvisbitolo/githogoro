import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/admin-guard"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const { isFeatured } = body

  if (isFeatured === undefined) {
    return NextResponse.json({ error: "isFeatured is required" }, { status: 400 })
  }

  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const updated = await prisma.business.update({
    where: { id },
    data: { isFeatured },
  })

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: isFeatured ? "feature_business" : "unfeature_business",
      targetId: id,
      details: { name: business.name, category: business.category },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { id } = await params

  const business = await prisma.business.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.businessReview.deleteMany({ where: { businessId: id } }),
    prisma.business.delete({ where: { id } }),
  ])

  await prisma.adminAction.create({
    data: {
      adminId: auth.userId,
      action: "delete_business",
      targetId: id,
      details: { name: business.name },
      ipAddress: request.headers.get("x-forwarded-for") || null,
    },
  })

  return NextResponse.json({ success: true })
}
