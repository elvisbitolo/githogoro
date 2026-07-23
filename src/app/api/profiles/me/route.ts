import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    // Auto-create profile if it doesn't exist (new signup)
    if (!profile) {
      const meta = user.user_metadata || {};
      const phone = meta.phone || user.email?.split("@")[0] || "";
      const name = meta.name || phone || "New Member";

      profile = await prisma.profile.create({
        data: {
          id: user.id,
          name,
          phone,
          zone: meta.zone || null,
          role: "resident",
        },
      });
    }

    const [messageCount, jobCount, eventRsvpCount] = await Promise.all([
      prisma.message.count({ where: { userId: user.id } }),
      prisma.job.count({
        where: {
          OR: [
            { postedBy: user.id },
            { createdBy: user.id },
          ],
        },
      }),
      prisma.eventRSVP.count({
        where: { userId: user.id, status: "going" },
      }),
    ]);

    return NextResponse.json({
      ...profile,
      stats: {
        messagesSent: messageCount,
        itemsPosted: jobCount,
        eventsAttended: eventRsvpCount,
      },
    });
  } catch (error) {
    console.error("GET /api/profiles/me error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatar_url, name, phone, zone, bio, role, settings } = body;

    const updateData: Record<string, unknown> = {
      lastActiveAt: new Date(),
    };

    if (avatar_url !== undefined) updateData.avatarUrl = avatar_url;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (zone !== undefined) updateData.zone = zone;
    if (bio !== undefined) updateData.bio = bio;
    if (role !== undefined && ["resident", "business"].includes(role)) {
      updateData.role = role;
    }
    if (settings !== undefined) updateData.settings = settings;

    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: updateData,
      create: {
        id: user.id,
        name: name || "New Member",
        phone: phone || user.email?.split("@")[0] || "",
        zone: zone || null,
        bio: bio || null,
        role: (role === "resident" || role === "business") ? role : "resident",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("PUT /api/profiles/me error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
