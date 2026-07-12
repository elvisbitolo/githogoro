import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

export async function isAdmin(userId: string) {
  const adminId = process.env.ADMIN_USER_ID
  if (!adminId || !userId) return false
  return userId === adminId
}
