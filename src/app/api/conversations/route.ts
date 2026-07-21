import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { name: true, avatarUrl: true, lastActiveAt: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                text: true,
                createdAt: true,
                senderId: true,
                type: true,
                isDeleted: true,
              },
            },
            pinnedBy: {
              where: { userId: user.id },
              select: { id: true },
            },
          },
        },
      },
    });

    const conversations = participations.map((p) => ({
      ...p.conversation,
      isPinned: p.conversation.pinnedBy.length > 0,
      isMuted: p.isMuted,
      lastReadAt: p.lastReadAt,
    }));

    // Sort: pinned first, then by last message time
    conversations.sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.messages?.[0]?.createdAt || a.createdAt;
      const bTime = b.messages?.[0]?.createdAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
