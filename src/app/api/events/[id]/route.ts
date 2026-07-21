import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const going = event.rsvps.filter((r) => r.status === "going");
    const maybe = event.rsvps.filter((r) => r.status === "maybe");
    const notGoing = event.rsvps.filter((r) => r.status === "not_going");

    const { rsvps, ...eventData } = event;

    return NextResponse.json({
      ...eventData,
      rsvpCounts: { going: going.length, maybe: maybe.length, notGoing: notGoing.length },
      attendees: rsvps.map((r) => ({ ...r.user, status: r.status })),
    });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
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

    if (event.createdBy !== user.id) {
      return NextResponse.json({ error: "Only the creator can edit this event" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, date, location, category, coverPhoto, maxAttendees, isFree, ticketPrice } = body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(location !== undefined && { location: location.trim() }),
        ...(category !== undefined && { category }),
        ...(coverPhoto !== undefined && { coverPhoto: coverPhoto || null }),
        ...(maxAttendees !== undefined && { maxAttendees: maxAttendees ? parseInt(maxAttendees) : null }),
        ...(isFree !== undefined && { isFree }),
        ...(ticketPrice !== undefined && { ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null }),
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
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

    if (event.createdBy !== user.id) {
      return NextResponse.json({ error: "Only the creator can delete this event" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
