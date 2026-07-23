import { type NextRequest, type NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 100

function rateLimit(request: NextRequest, response: NextResponse): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  const cookieName = `_rl_${ip.replace(/[.:]/g, "_")}`
  const cookieVal = request.cookies.get(cookieName)?.value

  let count = 0
  let windowStart = 0

  if (cookieVal) {
    const [c, w] = cookieVal.split(":")
    count = parseInt(c, 10) || 0
    windowStart = parseInt(w, 10) || 0
  }

  const now = Date.now()
  if (!windowStart || now - windowStart > RATE_LIMIT_WINDOW) {
    count = 1
    windowStart = now
  } else {
    count++
  }

  if (count > RATE_LIMIT_MAX) {
    return false
  }

  response.cookies.set(cookieName, `${count}:${windowStart}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  })

  return true
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  if (!rateLimit(request, response)) {
    return new Response("Too many requests. Please try again later.", {
      status: 429,
      headers: { "Retry-After": "60" },
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
