import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const places = await prisma.communityPlace.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(places);
  } catch (error) {
    console.error("GET /api/places error:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
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
    const { name, category, description, phone, lat, lng } = body;

    const place = await prisma.communityPlace.create({
      data: {
        name,
        category,
        description,
        phone,
        lat,
        lng,
        isApproved: false,
        isOfficial: false,
        submittedBy: user.id,
      },
    });

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error("POST /api/places error:", error);
    return NextResponse.json({ error: "Failed to report place" }, { status: 500 });
  }
}
