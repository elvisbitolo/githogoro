import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith("/c-panel")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup")
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
    ["/chat", "/jobs", "/map", "/businesses", "/marketplace", "/events", "/profile", "/alerts", "/lost-found", "/videos", "/people", "/messages", "/groups", "/bundles", "/sos", "/polls", "/leaderboard", "/stories", "/feed", "/skills", "/harambee", "/tontine", "/loans", "/savings", "/group-buy", "/prices", "/errands", "/rides", "/meals", "/tools", "/safety", "/obituaries", "/talents", "/recipes", "/petitions", "/parenting", "/memories", "/health", "/governance", "/partners"].some(p => 
      request.nextUrl.pathname.startsWith(p)
    )

  // Admin route protection - require auth (admin check done at page/API level)
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/404"
      return NextResponse.rewrite(url)
    }
    return supabaseResponse
  }

  // Redirect to login if accessing protected routes without auth
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if already logged in and on auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
