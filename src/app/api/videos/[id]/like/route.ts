import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

    const existingLike = await prisma.videoLike.findFirst({
      where: {
        userId: user.id,
        videoId: id,
      },
    });

    let liked: boolean;
    let count: number;

    if (existingLike) {
      await prisma.videoLike.delete({
        where: { id: existingLike.id },
      });

      const updatedVideo = await prisma.video.update({
        where: { id },
        data: { likesCount: { decrement: 1 } },
      });

      liked = false;
      count = updatedVideo.likesCount;
    } else {
      await prisma.videoLike.create({
        data: {
          userId: user.id,
          videoId: id,
        },
      });

      const updatedVideo = await prisma.video.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      });

      liked = true;
      count = updatedVideo.likesCount;
    }

    return NextResponse.json({ liked, count });
  } catch (error) {
    console.error("POST /api/videos/[id]/like error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

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

    const video = await prisma.video.findUnique({
      where: { id },
      select: { likesCount: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    let liked = false;
    if (user) {
      const existingLike = await prisma.videoLike.findFirst({
        where: {
          userId: user.id,
          videoId: id,
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ count: video.likesCount, liked });
  } catch (error) {
    console.error("GET /api/videos/[id]/like error:", error);
    return NextResponse.json({ error: "Failed to fetch like status" }, { status: 500 });
  }
}
