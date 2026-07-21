import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const REPUTATION_POINTS: Record<string, number> = {
  message_sent: 5,
  job_posted: 10,
  event_organized: 15,
  place_reported: 5,
  bundle_shared: 3,
  business_listed: 20,
  review_given: 5,
  poll_created: 5,
  poll_voted: 2,
};

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        zone: true,
        reputationPoints: true,
        reputationScore: true,
        createdAt: true,
      },
      orderBy: { reputationPoints: "desc" },
      take: 50,
    });

    const leaderboard = profiles.map((p, i) => ({
      rank: i + 1,
      ...p,
      tier:
        p.reputationPoints >= 501
          ? "Leader"
          : p.reputationPoints >= 201
            ? "Trusted"
            : p.reputationPoints >= 51
              ? "Regular"
              : "Newcomer",
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("GET /api/reputation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
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
    const { action, description } = body;

    if (!action || !REPUTATION_POINTS[action]) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const points = REPUTATION_POINTS[action];

    const [log] = await prisma.$transaction([
      prisma.reputationLog.create({
        data: {
          userId: user.id,
          action: action as any,
          points,
          description: description || null,
        },
      }),
      prisma.profile.update({
        where: { id: user.id },
        data: {
          reputationPoints: { increment: points },
          reputationScore: { increment: points },
        },
      }),
    ]);

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/reputation error:", error);
    return NextResponse.json(
      { error: "Failed to log reputation action" },
      { status: 500 }
    );
  }
}
