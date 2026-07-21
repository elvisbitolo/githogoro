import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await prisma.sOSAlert.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true, phone: true },
        },
        responses: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "SOS alert not found" }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("GET /api/sos/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch SOS alert" }, { status: 500 });
  }
}

export async function PUT(
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
    const { status, message } = body;

    if (status) {
      const alert = await prisma.sOSAlert.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });
      return NextResponse.json(alert);
    }

    if (message) {
      const response = await prisma.sOSResponse.create({
        data: {
          sosId: id,
          userId: user.id,
          message: message.trim(),
        },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });
      return NextResponse.json(response, { status: 201 });
    }

    return NextResponse.json({ error: "Status or message is required" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/sos/[id] error:", error);
    return NextResponse.json({ error: "Failed to update SOS alert" }, { status: 500 });
  }
}
