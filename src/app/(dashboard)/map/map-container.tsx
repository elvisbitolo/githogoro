"use client"

import { useEffect, useRef } from "react"

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

const DEFAULT_COLOR = "#6b7280"

export interface Place {
  id: string
  name: string
  category: string
  description?: string
  lat: number
  lng: number
  phone?: string
  isOfficial: boolean
}

interface MapContainerProps {
  places: Place[]
  selectedCategory: string | null
  onPlaceClick?: (place: Place) => void
}

export function MapContainer({ places, selectedCategory, onPlaceClick }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!mapContainerRef.current) return

    async function initMap() {
      const L = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      if (!mapContainerRef.current) return

      const map = L.map(mapContainerRef.current, {
        center: [-1.213, 36.824] as any,
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      renderMarkers(L, map)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!mapRef.current) return

    async function updateMarkers() {
      const L = await import("leaflet")
      renderMarkers(L, mapRef.current)
    }

    updateMarkers()
  }, [places, selectedCategory])

  function renderMarkers(L: any, map: any) {
    markersRef.current.forEach((m: any) => map.removeLayer(m))
    markersRef.current = []

    const filtered = selectedCategory
      ? places.filter((p) => p.category === selectedCategory)
      : places

    filtered.forEach((place) => {
      const color = CATEGORY_COLORS[place.category] || DEFAULT_COLOR

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: 12px;
          height: 12px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "><div style="
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
        "></div></div>`,
        iconSize: [12, 12] as any,
        iconAnchor: [6, 6] as any,
        popupAnchor: [0, -8] as any,
      })

      const marker = L.marker([place.lat, place.lng] as any, { icon }).addTo(map)

      let popupHtml = `<strong>${place.name}</strong><br/>${place.category}`
      if (place.description) popupHtml += `<br/>${place.description}`
      if (place.phone) popupHtml += `<br/>📞 ${place.phone}`

      marker.bindPopup(popupHtml)

      if (onPlaceClick) {
        marker.on("click", () => onPlaceClick(place))
      }

      markersRef.current.push(marker)
    })
  }

  return (
    <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[500px] lg:h-[600px]" />
  )
}
