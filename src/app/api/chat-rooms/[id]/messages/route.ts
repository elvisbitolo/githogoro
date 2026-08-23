import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function assertRoomAccess(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { id: true, type: true },
  });

  if (!room) {
    return { ok: false, error: "Room not found", status: 404 };
  }

  if (room.type === "group") {
    const participant = await prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!participant) {
      return { ok: false, error: "Not a member of this room", status: 403 };
    }
  }

  return { ok: true };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await assertRoomAccess(id, user.id);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/chat-rooms/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await assertRoomAccess(id, user.id);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        roomId: id,
        userId: user.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat-rooms/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
