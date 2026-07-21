"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ChefHat, Star, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  steps: string
  photo: string | null
  likesCount: number
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRecipes(data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community Recipes</h1>
          <p className="text-zinc-500 text-sm mt-1">Share and discover delicious recipes</p>
        </div>
        <Link href="/recipes/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Share Recipe
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-48" /></Card>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChefHat className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No recipes shared yet</p>
            <p className="text-sm text-zinc-400 mt-1">Share your favorite recipes with the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              {recipe.photo && (
                <img src={recipe.photo} alt={recipe.title} className="w-full h-40 object-cover" />
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                    <ChefHat className="h-3 w-3" />Recipe
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Star className="h-3 w-3" />{recipe.likesCount}
                  </Badge>
                </div>
                <h3 className="font-semibold">{recipe.title}</h3>
                {recipe.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{recipe.description}</p>}
                {recipe.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.ingredients.slice(0, 4).map((ing, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{typeof ing === "string" ? ing : String(ing)}</Badge>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <Badge variant="secondary" className="text-[10px]">+{recipe.ingredients.length - 4} more</Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                  <span>{recipe.user.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{formatRelativeTime(recipe.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
