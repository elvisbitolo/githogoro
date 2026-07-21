import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 });
    }

    const existingParticipation = await prisma.conversationParticipant.findFirst({
      where: {
        userId: user.id,
        conversation: {
          participants: {
            some: { userId: userId },
          },
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { name: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(existingParticipation.conversation);
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.id }, { userId: userId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations/new error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
