"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Droplets, User, MapPin, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Donor {
  id: string
  bloodType: string
  isWilling: boolean
  lastDonation: string | null
  user: {
    id: string
    name: string
    phone: string | null
    zone: string | null
  }
}

const bloodTypes = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function BloodDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [registering, setRegistering] = useState(false)
  const [selectedType, setSelectedType] = useState("O+")
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterType !== "all") params.set("bloodType", filterType)

    fetch(`/api/health/blood-donors?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDonors(Array.isArray(data) ? data : []))
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }, [filterType])

  const handleRegister = async () => {
    setRegistering(true)
    try {
      const res = await fetch("/api/health/blood-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodType: selectedType }),
      })
      if (res.ok) {
        setFilterType("all")
      }
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Blood Donors</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Find willing blood donors in your community
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Droplets className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Register as a Blood Donor</p>
              <p className="text-xs text-zinc-500">Help save lives in your community</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {bloodTypes.filter((t) => t !== "all").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Button size="sm" onClick={handleRegister} disabled={registering || !userId}>
                {registering ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {bloodTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === type
                ? "bg-red-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {type === "all" ? "All Types" : type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No donors found for this blood type</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donors.map((donor) => (
            <Card key={donor.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-red-600">{donor.bloodType}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900">{donor.user.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mt-1">
                    {donor.user.zone && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {donor.user.zone}
                      </span>
                    )}
                    {donor.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {donor.user.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={donor.isWilling ? "default" : "secondary"}>
                  {donor.isWilling ? "Available" : "Unavailable"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
