import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const recipes = await prisma.recipe.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(recipes)
  } catch (error) {
    console.error("GET /api/recipes error:", error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, ingredients, steps, photo } = body

    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        ingredients: ingredients || [],
        steps,
        photo: photo || null,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true, zone: true } } },
    })
    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error("POST /api/recipes error:", error)
    return NextResponse.json({ error: "Failed to share recipe" }, { status: 500 })
  }
}
