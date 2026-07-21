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

    let userRsvp: string | null = null;
    if (user) {
      const rsvp = await prisma.eventRSVP.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      });
      userRsvp = rsvp ? String(rsvp.status) : null;
    }

    const counts = await prisma.eventRSVP.groupBy({
      by: ["status"],
      where: { eventId: id },
      _count: { status: true },
    });

    const rsvpCounts = { going: 0, maybe: 0, notGoing: 0 };
    for (const c of counts) {
      if (c.status === "going") rsvpCounts.going = c._count.status;
      else if (c.status === "maybe") rsvpCounts.maybe = c._count.status;
      else if (c.status === "not_going") rsvpCounts.notGoing = c._count.status;
    }

    return NextResponse.json({ userRsvp, rsvpCounts });
  } catch (error) {
    console.error("GET /api/events/[id]/rsvp error:", error);
    return NextResponse.json({ error: "Failed to fetch RSVP status" }, { status: 500 });
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

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["going", "maybe", "not_going"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be going, maybe, or not_going" },
        { status: 400 }
      );
    }

    const existing = await prisma.eventRSVP.findUnique({
      where: { eventId_userId: { eventId: id, userId: user.id } },
    });

    let rsvp;
    let action: "created" | "updated" | "removed";

    if (existing) {
      if (existing.status === status) {
        await prisma.eventRSVP.delete({ where: { id: existing.id } });
        rsvp = null;
        action = "removed";
      } else {
        rsvp = await prisma.eventRSVP.update({
          where: { id: existing.id },
          data: { status },
        });
        action = "updated";
      }
    } else {
      rsvp = await prisma.eventRSVP.create({
        data: {
          eventId: id,
          userId: user.id,
          status,
        },
      });
      action = "created";
    }

    const counts = await prisma.eventRSVP.groupBy({
      by: ["status"],
      where: { eventId: id },
      _count: { status: true },
    });

    const rsvpCounts = { going: 0, maybe: 0, notGoing: 0 };
    for (const c of counts) {
      if (c.status === "going") rsvpCounts.going = c._count.status;
      else if (c.status === "maybe") rsvpCounts.maybe = c._count.status;
      else if (c.status === "not_going") rsvpCounts.notGoing = c._count.status;
    }

    return NextResponse.json({
      rsvp: rsvp ? { status: rsvp.status } : null,
      action,
      rsvpCounts,
      userRsvp: rsvp ? rsvp.status : null,
    });
  } catch (error) {
    console.error("POST /api/events/[id]/rsvp error:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
