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

    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        zone: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        role: true,
        reputationScore: true,
        reputationPoints: true,
        badges: true,
        isVerified: true,
        createdAt: true,
        lastSeen: true,
        lastActiveAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // If viewing another user's profile, hide phone number
    const isOwnProfile = user.id === id;
    const safeProfile = isOwnProfile
      ? profile
      : { ...profile, phone: null };

    return NextResponse.json(safeProfile);
  } catch (error) {
    console.error("GET /api/profiles/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
