import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const zone = searchParams.get("zone");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (zone) {
      where.zone = zone;
    }

    const profiles = await prisma.profile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: search ? 50 : 100,
      select: {
        id: true,
        name: true,
        zone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        lastSeen: true,
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("GET /api/profiles error:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}
