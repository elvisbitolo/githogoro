"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Place } from "./map-container"
import { ReportPlace } from "./report-place"

const MapContainer = dynamic(() => import("./map-container").then((m) => m.MapContainer), { ssr: false })

const CATEGORY_COLORS: Record<string, string> = {
  school: "#3b82f6",
  religious: "#8b5cf6",
  health: "#ef4444",
  transport: "#f97316",
  market: "#f59e0b",
  sports: "#22c55e",
  government: "#64748b",
  water: "#06b6d4",
  community: "#ec4899",
  emergency: "#dc2626",
  business: "#10b981",
}

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPlaces() {
      const [placesResult, businessesResult] = await Promise.all([
        supabase.from("community_places").select("*").eq("is_approved", true),
        supabase
          .from("businesses")
          .select("id, name, category, description, location_lat, location_lng, phone")
          .not("location_lat", "is", null)
          .not("location_lng", "is", null),
      ])

      const allPlaces: Place[] = []

      if (placesResult.data) {
        for (const p of placesResult.data) {
          allPlaces.push({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description ?? undefined,
            lat: p.lat,
            lng: p.lng,
            phone: p.phone ?? undefined,
            isOfficial: p.is_official ?? false,
          })
        }
      }

      if (businessesResult.data) {
        for (const b of businessesResult.data) {
          allPlaces.push({
            id: b.id,
            name: b.name,
            category: b.category,
            description: b.description ?? undefined,
            lat: b.location_lat!,
            lng: b.location_lng!,
            phone: b.phone ?? undefined,
            isOfficial: true,
          })
        }
      }

      setPlaces(allPlaces)
      setLoading(false)
    }

    fetchPlaces()
  }, [supabase])

  const categories = Array.from(new Set(places.map((p) => p.category)))
  const filteredPlaces = selectedCategory
    ? places.filter((p) => p.category === selectedCategory)
    : places

  const categoryCount = places.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Githogoro Map</h1>
            <p className="text-zinc-500 mt-1">Discover businesses and landmarks near you.</p>
          </div>
          <Button onClick={() => setShowReportForm(true)} variant="amber" size="sm">
            Report a Place
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
              selectedCategory === cat
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full inline-block"
              style={{ backgroundColor: CATEGORY_COLORS[cat] || "#6b7280" }}
            />
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-3 text-sm text-zinc-500">
        {filteredPlaces.length} of {places.length} places shown
        {selectedCategory && (
          <span className="ml-1">
            ({categoryCount[selectedCategory] || 0} in {selectedCategory})
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        <MapContainer
          places={filteredPlaces}
          selectedCategory={selectedCategory}
        />
      </Card>

      <ReportPlace
        open={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmitted={() => {
          setLoading(true)
          supabase
            .from("community_places")
            .select("*")
            .eq("is_approved", true)
            .then(({ data }) => {
              if (data) {
                setPlaces((prev) => {
                  const existingIds = new Set(prev.map((p) => p.id))
                  const newPlaces: Place[] = data
                    .filter((p) => !existingIds.has(p.id))
                    .map((p) => ({
                      id: p.id,
                      name: p.name,
                      category: p.category,
                      description: p.description ?? undefined,
                      lat: p.lat,
                      lng: p.lng,
                      phone: p.phone ?? undefined,
                      isOfficial: p.is_official ?? false,
                    }))
                  return [...prev, ...newPlaces]
                })
              }
              setLoading(false)
            })
        }}
      />
    </div>
  )
}
