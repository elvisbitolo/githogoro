"use client"

import { useState, useRef } from "react"
import { X, Camera, Type, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

const COLORS = [
  "#059669", "#d97706", "#dc2626", "#7c3aed",
  "#2563eb", "#db2777", "#0891b2", "#4f46e5",
  "#9333ea", "#c2410c", "#15803d", "#be123c",
  "#1e40af", "#6d28d9", "#b91c1c", "#047857",
]

interface StoryCreatorProps {
  onClose: () => void
  onCreated: () => void
}

export default function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
  const [mode, setMode] = useState<"text" | "photo">("text")
  const [text, setText] = useState("")
  const [bgColor, setBgColor] = useState(COLORS[0])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handlePost = async () => {
    if (mode === "text" && !text.trim()) return
    if (mode === "photo" && !photoFile) return

    setSubmitting(true)
    try {
      let mediaUrl: string | null = null

      if (mode === "photo" && photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        formData.append("bucket", "avatars")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          mediaUrl = url
        }
      }

      const content = mode === "text" ? JSON.stringify({ text, bgColor }) : "Photo status"

      await fetch("/api/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mediaUrl }),
      })

      onCreated()
    } catch (error) {
      console.error("Failed to create status:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h3 className="font-semibold">New Status</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 p-4 pb-2">
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "text" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Type className="h-4 w-4" />
            Text
          </button>
          <button
            onClick={() => setMode("photo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "photo" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Camera className="h-4 w-4" />
            Photo
          </button>
        </div>

        <div className="p-4">
          {mode === "text" ? (
            <div className="space-y-4">
              <div
                className="w-full aspect-[4/3] rounded-xl flex items-center justify-center p-6"
                style={{ backgroundColor: bgColor }}
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-white text-center text-lg font-medium placeholder:text-white/60 resize-none outline-none min-h-[120px]"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Background Color</p>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBgColor(color)}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        bgColor === color ? "ring-2 ring-offset-2 ring-zinc-900 scale-110" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-400 text-right">{text.length}/500</p>
            </div>
          ) : (
            <div className="space-y-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setPhotoPreview(null)
                      setPhotoFile(null)
                    }}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
                >
                  <ImagePlus className="h-10 w-10 text-zinc-300" />
                  <span className="text-sm text-zinc-500">Tap to add a photo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-100">
          <Button
            onClick={handlePost}
            disabled={
              submitting ||
              (mode === "text" && !text.trim()) ||
              (mode === "photo" && !photoFile)
            }
            className="w-full"
          >
            {submitting ? "Posting..." : "Post Status"}
          </Button>
        </div>
      </div>
    </div>
  )
}
