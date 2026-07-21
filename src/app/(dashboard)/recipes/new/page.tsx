"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChefHat, ArrowLeft, Plus, X } from "lucide-react"

export default function NewRecipePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "", steps: "", photo: "" })
  const [ingredients, setIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState("")
  const [saving, setSaving] = useState(false)

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()])
      setIngredientInput("")
    }
  }

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.steps) return
    setSaving(true)
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ingredients }),
      })
      if (res.ok) router.push("/recipes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-emerald-600" />
          Share a Recipe
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Share your favorite dish with the community</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Recipe Name *</label>
            <Input placeholder="e.g. Nyama Choma, Ugali, Chapati" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <textarea
              className="flex min-h-[60px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="A brief description of the dish..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Ingredients</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add an ingredient"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIngredient() } }}
              />
              <Button type="button" variant="outline" onClick={addIngredient} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ing, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {ing}
                    <button onClick={() => removeIngredient(i)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Steps *</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              placeholder="Step-by-step cooking instructions..."
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Photo URL</label>
            <Input placeholder="Link to a photo of the dish" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Sharing..." : "Share Recipe"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
