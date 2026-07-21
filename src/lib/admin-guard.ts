import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/supabase/admin"

export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const adminStatus = await isAdmin(user.id)
  if (!adminStatus) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { userId: user.id }
}
