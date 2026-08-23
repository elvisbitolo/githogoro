import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/supabase/admin"
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-token"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export type StaffRole = "admin" | "moderator"

async function getStaffStatus(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return profile?.role === "admin" || profile?.role === "moderator"
    ? (profile.role as StaffRole)
    : null
}

async function hasAccessKey() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(COOKIE_NAME)?.value
  return accessToken ? verifyAdminToken(accessToken) : false
}

/**
 * Grants access to full admins only (DB role "admin", the ADMIN_USER_ID env
 * override, or a valid admin access-key cookie).
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const role = await getStaffStatus(user.id)
  if (role === "admin" || (await isAdmin(user.id)) || (await hasAccessKey())) {
    return { userId: user.id, role: "admin" as StaffRole }
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

/**
 * Grants access to full admins and moderators (content moderation only).
 */
export async function verifyModerator() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const role = await getStaffStatus(user.id)
  if (role && (role === "admin" || role === "moderator")) {
    return { userId: user.id, role }
  }

  if ((await isAdmin(user.id)) || (await hasAccessKey())) {
    return { userId: user.id, role: "admin" as StaffRole }
  }

  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

export function isFullAdmin(result: { role: StaffRole } | { error: NextResponse }) {
  return "role" in result && result.role === "admin"
}
