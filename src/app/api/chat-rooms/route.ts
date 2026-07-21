import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const rooms = await prisma.chatRoom.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/chat-rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 });
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
    const { name, type, description } = body;

    const room = await prisma.chatRoom.create({
      data: {
        name,
        type,
        description,
        createdBy: user.id,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat-rooms error:", error);
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}
