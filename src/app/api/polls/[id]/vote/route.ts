import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { option } = body;

    if (option === undefined || option === null || typeof option !== "number") {
      return NextResponse.json({ error: "Valid option index is required" }, { status: 400 });
    }

    const poll = await prisma.communityPoll.findUnique({ where: { id } });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const options = poll.options as string[];
    if (option < 0 || option >= options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
      return NextResponse.json({ error: "This poll has ended" }, { status: 400 });
    }

    const existingVote = await prisma.communityPollVote.findUnique({
      where: { pollId_userId: { pollId: id, userId: user.id } },
    });

    if (existingVote) {
      if (existingVote.option === option) {
        return NextResponse.json({ message: "Already voted for this option" });
      }

      const updatedVote = await prisma.communityPollVote.update({
        where: { pollId_userId: { pollId: id, userId: user.id } },
        data: { option },
      });
      return NextResponse.json(updatedVote);
    }

    const vote = await prisma.communityPollVote.create({
      data: {
        pollId: id,
        userId: user.id,
        option,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Already voted" });
    }
    console.error("POST /api/polls/[id]/vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
