import crypto from "crypto"

const SECRET = process.env.ADMIN_ACCESS_KEY || "caroline"
const COOKIE_NAME = "admin_access_token"
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export function signAdminToken(userId: string): string {
  const expiry = Date.now() + TOKEN_EXPIRY_MS
  const payload = `${userId}:${expiry}`
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
  return `${payload}:${signature}`
}

export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split(":")
    if (parts.length !== 3) return false

    const [userId, expiryStr, signature] = parts
    const expiry = parseInt(expiryStr, 10)

    if (Date.now() > expiry) return false

    const payload = `${userId}:${expiry}`
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex")

    if (signature.length !== expectedSignature.length) return false

    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    return result === 0
  } catch {
    return false
  }
}

export { COOKIE_NAME }
