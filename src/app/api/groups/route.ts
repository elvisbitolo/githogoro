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

    const participations = await prisma.chatParticipant.findMany({
      where: { userId: user.id, room: { type: "group" } },
      include: {
        room: {
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
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const groups = participations
      .map((p) => p.room)
      .sort((a: any, b: any) => {
        const aTime = a.messages?.[0]?.createdAt || a.createdAt;
        const bTime = b.messages?.[0]?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET /api/groups error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

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
    const { name, description, memberIds } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    if (!Array.isArray(memberIds) || memberIds.length < 1) {
      return NextResponse.json({ error: "At least 1 member is required" }, { status: 400 });
    }

    const uniqueMemberIds = [...new Set(memberIds.filter((id: string) => id !== user.id))];

    const room = await prisma.chatRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: "group",
        createdBy: user.id,
        participants: {
          create: [
            { userId: user.id, isAdmin: true },
            ...uniqueMemberIds.map((id: string) => ({ userId: id, isAdmin: false })),
          ],
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

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("POST /api/groups error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
