"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Phone,
  MapPin,
  Award,
  Calendar,
  Camera,
  Loader2,
  Pencil,
  X,
  Check,
  MessageSquare,
  Briefcase,
  CalendarCheck,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/context"

interface ProfileData {
  id: string
  name: string
  phone: string
  zone: string | null
  bio: string | null
  avatarUrl: string | null
  coverUrl: string | null
  role: string
  reputationScore: number
  reputationPoints: number
  badges: string[]
  isVerified: boolean
  createdAt: string
  lastActiveAt: string | null
  stats: {
    messagesSent: number
    itemsPosted: number
    eventsAttended: number
  }
}

function getReputationTier(score: number) {
  if (score >= 501) return { label: "Leader", color: "text-purple-600 bg-purple-50 border-purple-200", icon: "🏆" }
  if (score >= 201) return { label: "Trusted", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: "✅" }
  if (score >= 51) return { label: "Regular", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "⭐" }
  return { label: "Newcomer", color: "text-zinc-600 bg-zinc-50 border-zinc-200", icon: "🌱" }
}

function getTierProgress(score: number) {
  if (score >= 501) return 100
  if (score >= 201) return ((score - 200) / 300) * 100
  if (score >= 51) return ((score - 50) / 150) * 100
  return (score / 50) * 100
}

function getNextTier(score: number) {
  if (score >= 501) return null
  if (score >= 201) return { label: "Leader", threshold: 501 }
  if (score >= 51) return { label: "Trusted", threshold: 201 }
  return { label: "Regular", threshold: 51 }
}

const ZONES = [
  "Matopeni",
  "72 Estate",
  "Blue Estate",
  "Green Estate",
  "Mji wa Huruma",
  "Shantii",
  "Runda Meadows",
  "Muringa Farm",
  "Githogoro Zone 1",
  "Githogoro Zone 2",
  "Githogoro Zone 3",
  "Githogoro Zone 4",
  "Githogoro Zone 5",
  "Githogoro Stage",
  "Northern Bypass",
  "Kiwaru",
  "Other",
]

export default function ProfilePage() {
  const { t } = useTranslations()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", phone: "", zone: "", bio: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      fetch("/api/profiles/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setProfile(data)
            setEditForm({
              name: data.name || "",
              phone: data.phone || "",
              zone: data.zone || "",
              bio: data.bio || "",
            })
          }
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
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const avatarUrl = urlData.publicUrl

    await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    })
    setProfile((prev) => prev ? { ...prev, avatarUrl } : prev)
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile((prev) => prev ? { ...prev, ...updated, stats: prev.stats } : prev)
      setEditing(false)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
        zone: profile.zone || "",
        bio: profile.bio || "",
      })
    }
    setEditing(false)
  }

  const handleRoleUpgrade = async (newRole: string) => {
    const res = await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile((prev) => prev ? { ...prev, role: updated.role } : prev)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-40 mb-6" />
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tier = profile ? getReputationTier(profile.reputationScore) : null
  const progress = profile ? getTierProgress(profile.reputationScore) : 0
  const nextTier = profile ? getNextTier(profile.reputationScore) : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.profile.title}</h1>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                  {(profile?.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
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
                <Badge variant={profile?.isVerified ? "default" : "secondary"}>
                  {profile?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="outline">{profile?.role || "resident"}</Badge>
                {tier && (
                  <Badge className={tier.color} variant="outline">
                    {tier.icon} {tier.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {editing ? (
            <div className="mt-6 pt-6 border-t border-zinc-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <User className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                  Full Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <Phone className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                  Phone Number
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <MapPin className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                  Zone
                </label>
                <select
                  value={editForm.zone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, zone: e.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
                >
                  <option value="">Select your zone...</option>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  About You
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell the community about yourself, your skills, or your business..."
                  rows={3}
                  maxLength={200}
                  className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-none"
                />
                <p className="text-xs text-zinc-400 mt-1">{editForm.bio.length}/200</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Save Changes
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {profile?.bio && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <p className="text-sm text-zinc-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-100">
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
                  <span>Score: {profile?.reputationScore || 0}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span>
                    Joined{" "}
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {tier && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Reputation
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl font-bold text-zinc-900">{profile?.reputationScore || 0}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${tier.color.split(" ")[0]}`}>
                    {tier.icon} {tier.label}
                  </span>
                  {nextTier && (
                    <span className="text-xs text-zinc-500">
                      {nextTier.threshold - (profile?.reputationScore || 0)} pts to {nextTier.label}
                    </span>
                  )}
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-100">
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900">{profile?.reputationPoints || 0}</div>
                <div className="text-xs text-zinc-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900">{tier.label}</div>
                <div className="text-xs text-zinc-500">Current Tier</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900">
                  {nextTier ? `${nextTier.threshold}` : "MAX"}
                </div>
                <div className="text-xs text-zinc-500">Next Tier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.badges && profile.badges.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge: string) => (
                <Badge key={badge} variant="warning" className="text-sm">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!profile?.role || profile.role === "resident") && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900">Run a Business?</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Upgrade to a Business profile to list your services, stand out to the community, and get featured on the businesses page.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleRoleUpgrade("business")}
                  >
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    Switch to Business
                  </Button>
                  <Link
                    href="/businesses/new"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    List My Business
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.role === "business" && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900">Business Profile</h3>
                  <Badge className="bg-amber-500 text-white text-[10px]">Active</Badge>
                </div>
                <p className="text-sm text-zinc-500 mt-1">
                  Your profile is set to Business mode. You appear as a business on the People page and can list services.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link
                    href="/businesses/new"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    Add a Business
                  </Link>
                  <Link
                    href="/businesses"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    View All Businesses
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">Activity Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <MessageSquare className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">
                {profile?.stats?.messagesSent || 0}
              </div>
              <div className="text-xs text-emerald-600 mt-0.5">Messages Sent</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-100">
              <Briefcase className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">
                {profile?.stats?.itemsPosted || 0}
              </div>
              <div className="text-xs text-amber-600 mt-0.5">Jobs Posted</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
              <CalendarCheck className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {profile?.stats?.eventsAttended || 0}
              </div>
              <div className="text-xs text-blue-600 mt-0.5">Events Attended</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
