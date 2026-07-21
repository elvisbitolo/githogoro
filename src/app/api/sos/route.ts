import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const alerts = await prisma.sOSAlert.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
        responses: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET /api/sos error:", error);
    return NextResponse.json({ error: "Failed to fetch SOS alerts" }, { status: 500 });
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
    const { latitude, longitude, message } = body;

    const alert = await prisma.sOSAlert.create({
      data: {
        userId: user.id,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        message: message?.trim() || null,
        status: "active",
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, zone: true },
        },
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("POST /api/sos error:", error);
    return NextResponse.json({ error: "Failed to create SOS alert" }, { status: 500 });
  }
}
