import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId: user.id },
    });
    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { name: true, avatarUrl: true, lastActiveAt: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}
