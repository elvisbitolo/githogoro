import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.chatRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("GET /api/chat-rooms/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch chat room" }, { status: 500 });
  }
}
