import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { signAdminToken, COOKIE_NAME } from "@/lib/admin-token"
import { timingSafeEqual } from "crypto"

export async function POST(request: Request) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Access key required" }, { status: 400 })
    }

    const adminKey = process.env.ADMIN_ACCESS_KEY
    if (!adminKey) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 })
    }

    const keyBuf = Buffer.from(key)
    const adminKeyBuf = Buffer.from(adminKey)
    if (keyBuf.length !== adminKeyBuf.length || !timingSafeEqual(keyBuf, adminKeyBuf)) {
      return NextResponse.json({ error: "Invalid access key" }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = await signAdminToken(user.id)

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
