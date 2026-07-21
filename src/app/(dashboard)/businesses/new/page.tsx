"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  "food",
  "retail",
  "services",
  "health",
  "education",
  "transport",
  "beauty",
  "tech",
  "other",
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function NewBusinessPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("food")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [locationLat, setLocationLat] = useState("")
  const [locationLng, setLocationLng] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    Object.fromEntries(
      DAYS.map((day) => [day, { open: "08:00", close: "17:00", closed: false }])
    )
  )

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setPhotos((prev) => [...prev, data.url])
      }
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleDay = (day: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }))
  }

  const updateHour = (day: string, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          phone,
          locationLat: locationLat || null,
          locationLng: locationLng || null,
          photos,
          openingHours,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/businesses/${data.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/businesses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Business</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-zinc-800">Basic Info</h2>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Business Name *</label>
              <Input placeholder="e.g. Mama Njeri's Kitchen" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
              <textarea
                placeholder="What does this business offer?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 block">Phone *</label>
              <Input placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-zinc-800">Location</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Latitude</label>
                <Input placeholder="-1.2921" value={locationLat} onChange={(e) => setLocationLat(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1 block">Longitude</label>
                <Input placeholder="36.8219" value={locationLng} onChange={(e) => setLocationLng(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-zinc-800">Photos</h2>
            <div className="flex flex-wrap gap-3">
              {photos.map((url, i) => (
                <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
              <label className="h-24 w-24 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                {uploadingPhoto ? (
                  <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-zinc-400" />
                    <span className="text-xs text-zinc-400 mt-1">Add</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-zinc-800">Opening Hours</h2>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <label className="w-24 text-sm text-zinc-700 flex-shrink-0">{day.slice(0, 3)}</label>
                  <input
                    type="checkbox"
                    checked={!openingHours[day].closed}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  />
                  {!openingHours[day].closed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={openingHours[day].open}
                        onChange={(e) => updateHour(day, "open", e.target.value)}
                        className="h-9 rounded-lg border border-zinc-200 px-2 text-sm flex-1"
                      />
                      <span className="text-zinc-400 text-sm">to</span>
                      <input
                        type="time"
                        value={openingHours[day].close}
                        onChange={(e) => updateHour(day, "close", e.target.value)}
                        className="h-9 rounded-lg border border-zinc-200 px-2 text-sm flex-1"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-400">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !phone.trim()}
          className="w-full h-12 text-base"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Create Business
        </Button>
      </div>
    </div>
  )
}
