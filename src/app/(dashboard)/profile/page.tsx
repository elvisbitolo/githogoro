"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Phone, MapPin, Award, Calendar, Camera, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) setProfile(data)
        setLoading(false)
      })
    })
  }, [supabase])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      return
    }

    const fileExt = file.name.split(".").pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert("Upload failed: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const avatarUrl = urlData.publicUrl

    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
    setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
    setUploading(false)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                  {(profile?.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                  {profile?.is_verified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="outline">{profile?.role || "resident"}</Badge>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-zinc-400" />
              <span>{profile?.phone || "No phone"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span>{profile?.zone || "No zone set"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="h-4 w-4 text-zinc-400" />
              <span>Score: {profile?.reputation_score || 0}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>

          {profile?.badges && profile.badges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" /> Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge: string) => (
                  <Badge key={badge} variant="warning">{badge}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
