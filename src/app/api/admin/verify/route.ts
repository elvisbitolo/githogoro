import { NextResponse } from "next/server"
import { verifyAdmin, verifyModerator } from "@/lib/admin-guard"

export async function GET() {
  try {
    const adminResult = await verifyAdmin()

    if ("error" in adminResult) {
      // Fall back: maybe a moderator
      const modResult = await verifyModerator()
      if ("error" in modResult) {
        return NextResponse.json(
          { isAdmin: false, isModerator: false, role: null },
          { status: 401 }
        )
      }
      return NextResponse.json({
        isAdmin: false,
        isModerator: true,
        role: modResult.role,
      })
    }

    return NextResponse.json({
      isAdmin: true,
      isModerator: true,
      role: adminResult.role,
    })
  } catch {
    return NextResponse.json(
      { isAdmin: false, isModerator: false, role: null },
      { status: 500 }
    )
  }
}
