import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.videoComment.findMany({
      where: { videoId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/videos/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
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

    const body = await request.json();
    const { text } = body;

    const [comment] = await prisma.$transaction([
      prisma.videoComment.create({
        data: {
          text,
          videoId: id,
          userId: user.id,
        },
      }),
      prisma.video.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/videos/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
