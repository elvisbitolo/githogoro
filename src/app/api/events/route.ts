import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          select: { status: true },
        },
      },
    });

    const eventsWithCounts = events.map((event) => {
      const going = event.rsvps.filter((r) => r.status === "going").length;
      const maybe = event.rsvps.filter((r) => r.status === "maybe").length;
      const notGoing = event.rsvps.filter((r) => r.status === "not_going").length;
      const { rsvps, ...rest } = event;
      return { ...rest, rsvpCounts: { going, maybe, notGoing } };
    });

    return NextResponse.json(eventsWithCounts);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
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
    const { title, description, date, location, category, coverPhoto, maxAttendees, isFree, ticketPrice } = body;

    if (!title || !date || !location || !category) {
      return NextResponse.json(
        { error: "Title, date, location, and category are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: new Date(date),
        location: location.trim(),
        category,
        coverPhoto: coverPhoto || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        isFree: isFree !== false,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
