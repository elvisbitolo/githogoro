"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, UtensilsCrossed, MapPin, Clock, Users } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface Meal {
  id: string
  title: string
  description: string | null
  servings: number
  location: string | null
  availableUntil: string | null
  photo: string | null
  isClaimed: boolean
  createdAt: string
  user: { id: string; name: string; avatarUrl: string | null; zone: string | null }
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/meals")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMeals(data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meal Sharing</h1>
          <p className="text-zinc-500 text-sm mt-1">Share surplus food with your neighbors</p>
        </div>
        <Link href="/meals/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Share Meal
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-28" /></Card>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No meals available</p>
            <p className="text-sm text-zinc-400 mt-1">Share your surplus food with the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="overflow-hidden">
              {meal.photo && (
                <img src={meal.photo} alt={meal.title} className="w-full h-40 object-cover" />
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold">{meal.title}</h3>
                {meal.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{meal.description}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                    <Users className="h-3 w-3" />{meal.servings} serving{meal.servings !== 1 ? "s" : ""}
                  </Badge>
                  {meal.location && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <MapPin className="h-3 w-3" />{meal.location}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                  <span>{meal.user.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{formatRelativeTime(meal.createdAt)}
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
