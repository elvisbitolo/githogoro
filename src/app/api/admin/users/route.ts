import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth) return auth.error;

  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
