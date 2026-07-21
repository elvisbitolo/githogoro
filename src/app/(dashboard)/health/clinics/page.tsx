"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Clock, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Clinic {
  id: string
  name: string
  category: string
  description: string | null
  phone: string | null
  location: string | null
  openingHours: string | null
  rating: number
  reviewCount: number
}

const categories = ["all", "hospital", "pharmacy", "clinic", "dental", "laboratory", "optical", "mental health"]

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category !== "all") params.set("category", category)

    fetch(`/api/health/clinics?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setClinics(Array.isArray(data) ? data : []))
      .catch(() => setClinics([]))
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clinics</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Find clinics and health centers near you
          </p>
        </div>
        <Link href="/health/clinics/new">
          <Button size="sm">Add Clinic</Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search clinics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No clinics found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-zinc-900">{clinic.name}</h3>
                      <Badge variant="secondary">{clinic.category}</Badge>
                    </div>
                    {clinic.description && (
                      <p className="text-sm text-zinc-500 mb-2">{clinic.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                      {clinic.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {clinic.location}
                        </span>
                      )}
                      {clinic.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {clinic.phone}
                        </span>
                      )}
                      {clinic.openingHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {clinic.openingHours}
                        </span>
                      )}
                    </div>
                  </div>
                  {clinic.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{clinic.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Stethoscope(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 2v2" /><path d="M5 2v2" /><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" /><path d="M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" />
    </svg>
  )
}
