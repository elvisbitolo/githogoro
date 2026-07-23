const COOKIE_NAME = "admin_access_token"
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_ACCESS_KEY
  if (!secret) {
    throw new Error("ADMIN_ACCESS_KEY environment variable is not set")
  }
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

export async function signAdminToken(userId: string): Promise<string> {
  const key = await getKey()
  const expiry = Date.now() + TOKEN_EXPIRY_MS
  const payload = `${userId}:${expiry}`
  const encoder = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${payload}:${signature}`
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(":")
    if (parts.length !== 3) return false

    const [userId, expiryStr, signature] = parts
    const expiry = parseInt(expiryStr, 10)

    if (Date.now() > expiry) return false

    const key = await getKey()
    const payload = `${userId}:${expiry}`
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const sigBytes = new Uint8Array(
      signature.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    )

    return crypto.subtle.verify("HMAC", key, sigBytes, data)
  } catch {
    return false
  }
}

export { COOKIE_NAME }
