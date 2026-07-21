import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const messages = await prisma.privateMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { name: true, avatarUrl: true },
        },
        reactions: {
          select: { emoji: true, userId: true },
        },
        readReceipts: {
          select: { readAt: true },
          orderBy: { readAt: "desc" },
          take: 1,
        },
        replyTo: {
          select: { id: true, text: true, sender: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId: user.id },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const body = await request.json();
    const { text, replyToId, editId, type, mediaUrl } = body;

    // Handle edit
    if (editId) {
      const message = await prisma.privateMessage.findUnique({ where: { id: editId } });
      if (!message || message.senderId !== user.id) {
        return NextResponse.json({ error: "Cannot edit" }, { status: 403 });
      }
      const updated = await prisma.privateMessage.update({
        where: { id: editId },
        data: { text, isEdited: true },
      });
      return NextResponse.json(updated);
    }

    const message = await prisma.privateMessage.create({
      data: {
        text,
        type: type || "text",
        mediaUrl: mediaUrl || null,
        conversationId: id,
        senderId: user.id,
        replyToId: replyToId || null,
      },
      include: {
        sender: { select: { name: true, avatarUrl: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    });

    // Update lastReadAt for sender
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId: user.id },
      data: { lastReadAt: new Date() },
    });

    // Update lastActiveAt for user
    await prisma.profile.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
