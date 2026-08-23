import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyModerator } from "@/lib/admin-guard"

const PAGE_SIZE = 50

export async function GET(request: Request) {
  const auth = await verifyModerator()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const take = Math.min(parseInt(searchParams.get("limit") || String(PAGE_SIZE)), 100)

  const where: Record<string, unknown> = {}
  if (status && status !== "all") where.status = status

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      reporter: { select: { id: true, name: true } },
      handledBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(reports)
}
