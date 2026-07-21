import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const polls = await prisma.communityPoll.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        votes: {
          select: { option: true, userId: true },
        },
      },
    });

    const now = new Date();
    const pollsWithCounts = polls.map((poll) => {
      const options = poll.options as string[];
      const totalVotes = poll.votes.length;
      const counts = options.map(
        (_, i) => poll.votes.filter((v) => v.option === i).length
      );
      const isExpired = poll.endsAt ? new Date(poll.endsAt) < now : false;
      const { votes, ...rest } = poll;
      return { ...rest, options, totalVotes, counts, isExpired };
    });

    return NextResponse.json(pollsWithCounts);
  } catch (error) {
    console.error("GET /api/polls error:", error);
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
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
    const { question, options, endsAt } = body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Question and at least 2 options are required" },
        { status: 400 }
      );
    }

    if (options.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 options allowed" },
        { status: 400 }
      );
    }

    const poll = await prisma.communityPoll.create({
      data: {
        question: question.trim(),
        options: options.map((o: string) => o.trim()),
        createdBy: user.id,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("POST /api/polls error:", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
