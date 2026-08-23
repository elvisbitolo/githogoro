import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyModerator } from "@/lib/admin-guard";

export async function GET() {
  const auth = await verifyModerator();
  if ("error" in auth) return auth.error;

  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/admin/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
