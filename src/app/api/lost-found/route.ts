import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: Record<string, string> = {};

    if (type && (type === "lost" || type === "found")) {
      where.type = type;
    }
    if (category) {
      where.category = category;
    }
    if (status && (status === "active" || status === "resolved")) {
      where.status = status;
    } else {
      where.status = "active";
    }

    const items = await prisma.lostFoundItem.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/lost-found error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
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
    const { title, description, category, location, photo, type } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 },
      );
    }

    if (type !== "lost" && type !== "found") {
      return NextResponse.json(
        { error: "Type must be 'lost' or 'found'" },
        { status: 400 },
      );
    }

    const item = await prisma.lostFoundItem.create({
      data: {
        title,
        description: description || null,
        category: category || "other",
        location: location || null,
        photo: photo || null,
        type,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/lost-found error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
