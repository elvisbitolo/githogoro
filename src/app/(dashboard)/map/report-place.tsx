"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

const CATEGORIES = [
  "school",
  "religious",
  "health",
  "transport",
  "market",
  "sports",
  "government",
  "water",
  "community",
  "emergency",
  "business",
] as const

interface ReportPlaceProps {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

export function ReportPlace({ open, onClose, onSubmitted }: ReportPlaceProps) {
  const { t } = useTranslations()
  const supabase = createClient()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [name, setName] = useState("")
  const [category, setCategory] = useState<string>("business")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || typeof window === "undefined") return

    async function initMap() {
      const L = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [-1.213, 36.824] as any,
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
        maxZoom: 19,
      }).addTo(map)

      map.on("click", (e: any) => {
        setLat(e.latlng.lat)
        setLng(e.latlng.lng)

        if (markerRef.current) map.removeLayer(markerRef.current)

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 12px; height: 12px;
            background: #ef4444;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          "><div style="
            width: 4px; height: 4px;
            background: white;
            border-radius: 50%;
          "></div></div>`,
          iconSize: [12, 12] as any,
          iconAnchor: [6, 6] as any,
        })

        markerRef.current = L.marker([e.latlng.lat, e.latlng.lng] as any, { icon }).addTo(map)
      })

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markerRef.current = null
    }
  }, [open])

  function resetForm() {
    setName("")
    setCategory("business")
    setDescription("")
    setPhone("")
    setLat(null)
    setLng(null)
    setSubmitting(false)
    setSuccess(false)
    setError("")
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !lat || !lng) return

    setSubmitting(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error: insertError } = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || null,
          phone: phone.trim() || null,
          lat,
          lng,
          submitted_by: user?.id || null,
          is_approved: false,
          is_official: false,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: { message: "Failed to submit" } }))
          return { error: { message: body.error?.message || "Failed to submit" } }
        }
        return { error: null }
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onSubmitted()
        onClose()
      }, 1500)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.map.title}</h2>
            <button
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-8 text-center">
              <div className="text-emerald-600 text-lg font-medium mb-2">Place reported successfully!</div>
              <p className="text-zinc-500 text-sm">It will appear on the map once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Place Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g. Githogoro Community Hall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about this place..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+254 7XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Click on the map to set location *
                </label>
                <div ref={mapRef} className="w-full h-[200px] rounded-lg border border-zinc-200 overflow-hidden" />
                {lat && lng ? (
                  <p className="text-xs text-zinc-500 mt-1">
                    Location: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">Please click on the map to pin the location.</p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    onClose()
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !name.trim() || !lat || !lng}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
