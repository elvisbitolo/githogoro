import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const sort = searchParams.get("sort") || "newest";

    const where: any = { isActive: true };

    if (type && type !== "all") {
      where.jobType = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { employerName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    const orderBy: any =
      sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

    const jobs = await prisma.job.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, employer_name, location, job_type, salary_range, contact_phone, description } = body;

    const job = await prisma.job.create({
      data: {
        title,
        employerName: employer_name,
        location,
        jobType: job_type,
        salaryRange: salary_range,
        contactPhone: contact_phone,
        description,
        createdBy: user.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
