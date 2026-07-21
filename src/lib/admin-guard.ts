import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/supabase/admin"
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-token"
import { cookies } from "next/headers"

export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  // Check 1: admin role in database
  const adminStatus = await isAdmin(user.id)
  if (adminStatus) {
    return { userId: user.id }
  }

  // Check 2: valid admin access key cookie
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(COOKIE_NAME)?.value
  if (accessToken && await verifyAdminToken(accessToken)) {
    return { userId: user.id }
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}
