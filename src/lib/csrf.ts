import { NextRequest, NextResponse } from "next/server"

const CSRF_COOKIE = "csrf_token"
const CSRF_LENGTH = 32

export function generateToken(): string {
  const bytes = new Uint8Array(CSRF_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function validateToken(token: string, stored: string): boolean {
  if (!token || !stored || token.length !== stored.length) return false
  const a = new TextEncoder().encode(token)
  const b = new TextEncoder().encode(stored)
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

export function setCsrfCookie(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateToken()
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return response
}

export function getCsrfFromRequest(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE)?.value ?? null
}
