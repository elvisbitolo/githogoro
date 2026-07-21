import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                phone: true,
                lastActiveAt: true,
              },
            },
          },
        },
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (room.type !== "group") {
      return NextResponse.json({ error: "Not a group" }, { status: 400 });
    }

    const isParticipant = room.participants.some((p) => p.userId === user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("GET /api/groups/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

export async function PATCH(
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

    const participant = await prisma.chatParticipant.findFirst({
      where: { roomId: id, userId: user.id },
    });

    if (!participant || !participant.isAdmin) {
      return NextResponse.json({ error: "Only admins can edit the group" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, addMemberIds, removeMemberIds } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;

    await prisma.chatRoom.update({ where: { id }, data: updates });

    if (Array.isArray(addMemberIds) && addMemberIds.length > 0) {
      const uniqueNew = [...new Set(addMemberIds.filter((mId: string) => mId !== user.id))];
      for (const mId of uniqueNew) {
        await prisma.chatParticipant.upsert({
          where: { roomId_userId: { roomId: id, userId: mId } },
          create: { roomId: id, userId: mId, isAdmin: false },
          update: {},
        });
      }
    }

    if (Array.isArray(removeMemberIds) && removeMemberIds.length > 0) {
      await prisma.chatParticipant.deleteMany({
        where: {
          roomId: id,
          userId: { in: removeMemberIds },
          isAdmin: false,
        },
      });
    }

    const updated = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, phone: true, lastActiveAt: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/groups/[id] error:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}
