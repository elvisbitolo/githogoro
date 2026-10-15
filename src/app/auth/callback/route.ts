import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

async function ensureProfile(user: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}) {
  const existing = await prisma.profile.findUnique({ where: { id: user.id } })
  if (existing) return

  const meta = user.user_metadata || {}
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    user.email?.split("@")[0] ||
    "New Member"
  const phone = (meta.phone as string) || ""
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || null

  await prisma.profile
    .create({
      data: {
        id: user.id,
        name,
        phone,
        avatarUrl,
        zone: (meta.zone as string) || null,
        role: "resident",
      },
    })
    .catch(() => {})
}

function getRedirectBase(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  if (isLocalEnv) {
    return request.nextUrl.origin
  }
  if (forwardedHost) {
    return `https://${forwardedHost}`
  }
  return request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const base = getRedirectBase(request)
  const safeNext = next.startsWith("/") ? next : "/dashboard"

  if (error) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      await ensureProfile(data.user)
      return NextResponse.redirect(`${base}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth-failed`)
}
