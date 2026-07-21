"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Place {
  id: string
  name: string
  category: string
  description: string | null
  lat: number
  lng: number
  phone: string | null
  isApproved: boolean
  isOfficial: boolean
  createdAt: string
  submitter?: { name: string } | null
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    variant: "destructive" | "default"
  }>({ open: false, title: "", description: "", action: () => {}, variant: "default" })

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    const res = await fetch("/api/admin/places")
    const data = await res.json()
    setPlaces(data)
    setLoading(false)
  }

  const unapproved = places.filter((p) => !p.isApproved)

  const handleApprove = (place: Place) => {
    setConfirmAction({
      open: true,
      title: "Approve Place",
      description: `Approve "${place.name}" and make it visible to the community?`,
      variant: "default",
      action: async () => {
        await fetch(`/api/admin/places/${place.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved: true }),
        })
        fetchPlaces()
      },
    })
  }

  const handleReject = (place: Place) => {
    setConfirmAction({
      open: true,
      title: "Reject Place",
      description: `Reject "${place.name}"? It will remain hidden from the community.`,
      variant: "destructive",
      action: async () => {
        await fetch(`/api/admin/places/${place.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved: false }),
        })
        fetchPlaces()
      },
    })
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/c-panel" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Panel
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <MapPin className="h-5 w-5 text-pink-500" />
          <h1 className="text-xl font-bold">Place Approvals</h1>
          {unapproved.length > 0 && (
            <Badge variant="destructive">{unapproved.length} pending</Badge>
          )}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">
              Unapproved Community Places
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-zinc-800/50 animate-pulse" />
              ))
            ) : unapproved.length === 0 ? (
              <p className="text-sm text-zinc-600">All places have been reviewed. Nothing pending.</p>
            ) : (
              unapproved.map((place) => (
                <div key={place.id} className="rounded-lg bg-zinc-800/50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{place.name}</p>
                        <Badge variant="outline" className="text-[10px] text-zinc-400">{place.category}</Badge>
                        {place.isOfficial && (
                          <Badge className="text-[10px] bg-emerald-600">Official</Badge>
                        )}
                      </div>
                      {place.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-1">{place.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-zinc-600">
                        {place.submitter && <span>by {place.submitter.name}</span>}
                        <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
                        <span>{new Date(place.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApprove(place)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(place)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmAction.open} onOpenChange={(open) => setConfirmAction((d) => ({ ...d, open }))}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{confirmAction.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">{confirmAction.description}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirmAction((d) => ({ ...d, open: false }))}>Cancel</Button>
            <Button
              variant={confirmAction.variant === "destructive" ? "destructive" : "default"}
              onClick={() => { confirmAction.action(); setConfirmAction((d) => ({ ...d, open: false })) }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
