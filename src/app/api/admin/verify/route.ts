import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    const adminStatus = await isAdmin(user.id)

    return NextResponse.json({ isAdmin: adminStatus })
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
