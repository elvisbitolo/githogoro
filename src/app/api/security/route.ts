import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const csrfToken = cookieStore.get("csrf_token")?.value ?? null

    return NextResponse.json({
      csrfEnabled: csrfToken !== null,
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== "false",
      phoneUnique: process.env.PHONE_UNIQUE_ENFORCEMENT !== "false",
      adminSecure: process.env.ADMIN_SECURE_MODE !== "false",
    })
  } catch (error) {
    console.error("GET /api/security error:", error)
    return NextResponse.json({ error: "Failed to fetch security status" }, { status: 500 })
  }
}
