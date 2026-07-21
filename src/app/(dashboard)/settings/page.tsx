"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Phone,
  MapPin,
  Bell,
  BellOff,
  Moon,
  Sun,
  Globe,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Save,
  Settings,
  Clock,
  Volume2,
  VolumeX,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/context"
import { LanguageToggle } from "@/components/LanguageToggle"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { useRouter } from "next/navigation"

interface ProfileData {
  id: string
  name: string
  phone: string
  zone: string | null
  bio: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
}

interface NotificationPrefs {
  pushEnabled: boolean
  emailEnabled: boolean
  quietHours: boolean
  digestMode: boolean
  categories: {
    URGENT: boolean
    ACTION_NEEDED: boolean
    COMMUNITY: boolean
    SOCIAL: boolean
  }
}

interface PrivacyPrefs {
  showPhone: boolean
  showOnlineStatus: boolean
  profileVisibility: "neighbors" | "everyone"
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

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  pushEnabled: true,
  emailEnabled: false,
  quietHours: false,
  digestMode: false,
  categories: {
    URGENT: true,
    ACTION_NEEDED: true,
    COMMUNITY: true,
    SOCIAL: true,
  },
}

const DEFAULT_PRIVACY: PrivacyPrefs = {
  showPhone: true,
  showOnlineStatus: true,
  profileVisibility: "neighbors",
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-emerald-600" : "bg-zinc-200"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType
  title: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="h-4 w-4 text-zinc-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{label}</p>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslations()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState("")
  const [zone, setZone] = useState("")
  const [bio, setBio] = useState("")

  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS)
  const [privacy, setPrivacy] = useState<PrivacyPrefs>(DEFAULT_PRIVACY)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState("")

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
            setName(data.name || "")
            setZone(data.zone || "")
            setBio(data.bio || "")
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })

    try {
      const stored = localStorage.getItem("notificationPrefs")
      if (stored) setNotifications(JSON.parse(stored))
    } catch {}

    try {
      const stored = localStorage.getItem("privacyPrefs")
      if (stored) setPrivacy(JSON.parse(stored))
    } catch {}
  }, [supabase])

  const persistNotifications = useCallback((prefs: NotificationPrefs) => {
    setNotifications(prefs)
    localStorage.setItem("notificationPrefs", JSON.stringify(prefs))
  }, [])

  const persistPrivacy = useCallback((prefs: PrivacyPrefs) => {
    setPrivacy(prefs)
    localStorage.setItem("privacyPrefs", JSON.stringify(prefs))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, zone, bio }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters")
      return
    }
    setChangingPassword(true)
    setPasswordMsg("")
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordMsg(error.message)
      } else {
        setPasswordMsg("Password updated successfully")
        setNewPassword("")
        setTimeout(() => {
          setPasswordOpen(false)
          setPasswordMsg("")
        }, 1500)
      }
    } catch {
      setPasswordMsg("Something went wrong. Please try again.")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetch(`/api/profiles/${user.id}`, { method: "DELETE" })
      }
      await supabase.auth.signOut()
      router.push("/login")
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-zinc-100 rounded-lg animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-zinc-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-emerald-700" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <SectionHeader icon={User} title="Account" color="bg-emerald-50 text-emerald-700" />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                <User className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                <Phone className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                Phone Number
              </label>
              <Input
                value={profile?.phone || ""}
                disabled
                className="bg-zinc-50 text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Phone number cannot be changed for security reasons
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                <MapPin className="inline h-4 w-4 mr-1.5 text-zinc-400" />
                Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
              >
                <option value="">Select your zone...</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                rows={3}
                maxLength={200}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors resize-none"
              />
              <p className="text-xs text-zinc-400 mt-1">{bio.length}/200</p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4 mr-1.5" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <SectionHeader
            icon={Bell}
            title="Notifications"
            color="bg-blue-50 text-blue-700"
          />

          <div className="divide-y divide-zinc-100">
            <SettingRow
              icon={notifications.pushEnabled ? Bell : BellOff}
              label="Push Notifications"
              description="Receive push notifications on your device"
            >
              <Toggle
                checked={notifications.pushEnabled}
                onChange={(v) =>
                  persistNotifications({ ...notifications, pushEnabled: v })
                }
              />
            </SettingRow>

            <SettingRow
              icon={Globe}
              label="Email Notifications"
              description="Receive daily summaries via email"
            >
              <Toggle
                checked={notifications.emailEnabled}
                onChange={(v) =>
                  persistNotifications({ ...notifications, emailEnabled: v })
                }
              />
            </SettingRow>

            <SettingRow
              icon={Clock}
              label="Quiet Hours"
              description="Mute notifications from 10pm to 7am"
            >
              <Toggle
                checked={notifications.quietHours}
                onChange={(v) =>
                  persistNotifications({ ...notifications, quietHours: v })
                }
              />
            </SettingRow>

            <SettingRow
              icon={notifications.digestMode ? VolumeX : Volume2}
              label="Digest Mode"
              description="Get a daily summary instead of individual notifications"
            >
              <Toggle
                checked={notifications.digestMode}
                onChange={(v) =>
                  persistNotifications({ ...notifications, digestMode: v })
                }
              />
            </SettingRow>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-sm font-medium text-zinc-700 mb-3">
              Notification Categories
            </p>
            <div className="space-y-1">
              {(
                ["URGENT", "ACTION_NEEDED", "COMMUNITY", "SOCIAL"] as const
              ).map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-zinc-600">
                    {cat === "ACTION_NEEDED"
                      ? "Action Needed"
                      : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </span>
                  <Toggle
                    checked={notifications.categories[cat]}
                    onChange={(v) =>
                      persistNotifications({
                        ...notifications,
                        categories: {
                          ...notifications.categories,
                          [cat]: v,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <SectionHeader
            icon={Sun}
            title="Appearance"
            color="bg-amber-50 text-amber-700"
          />

          <div className="divide-y divide-zinc-100">
            <SettingRow
              icon={Moon}
              label="Dark Mode"
              description="Switch between light and dark themes"
            >
              <DarkModeToggle />
            </SettingRow>

            <SettingRow
              icon={Globe}
              label="Language"
              description="Switch between English and Kiswahili"
            >
              <LanguageToggle />
            </SettingRow>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <SectionHeader icon={Shield} title="Privacy" color="bg-violet-50 text-violet-700" />

          <div className="divide-y divide-zinc-100">
            <SettingRow
              icon={privacy.showPhone ? Eye : EyeOff}
              label="Show Phone Number"
              description="Allow others to see your phone number"
            >
              <Toggle
                checked={privacy.showPhone}
                onChange={(v) => persistPrivacy({ ...privacy, showPhone: v })}
              />
            </SettingRow>

            <SettingRow
              icon={privacy.showOnlineStatus ? Eye : EyeOff}
              label="Show Online Status"
              description="Let others see when you are online"
            >
              <Toggle
                checked={privacy.showOnlineStatus}
                onChange={(v) =>
                  persistPrivacy({ ...privacy, showOnlineStatus: v })
                }
              />
            </SettingRow>

            <div className="py-3">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Profile Visibility
                  </p>
                  <p className="text-xs text-zinc-500">
                    Control who can see your full profile
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-7">
                <button
                  onClick={() =>
                    persistPrivacy({ ...privacy, profileVisibility: "neighbors" })
                  }
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    privacy.profileVisibility === "neighbors"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  Neighbors Only
                </button>
                <button
                  onClick={() =>
                    persistPrivacy({ ...privacy, profileVisibility: "everyone" })
                  }
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    privacy.profileVisibility === "everyone"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  Everyone
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-red-100">
        <CardContent className="p-6">
          <SectionHeader
            icon={Lock}
            title="Account Actions"
            color="bg-red-50 text-red-700"
          />

          <div className="space-y-3">
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                >
                  <Lock className="h-4 w-4 text-zinc-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Change Password</p>
                    <p className="text-xs text-zinc-500">
                      Update your account password
                    </p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  {passwordMsg && (
                    <p
                      className={`text-sm ${
                        passwordMsg.includes("success")
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordMsg}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      {changingPassword ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-1.5" />
                      )}
                      Update Password
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPasswordOpen(false)
                        setNewPassword("")
                        setPasswordMsg("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-zinc-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <p className="text-sm text-zinc-600">
                    This action is <strong>permanent and cannot be undone</strong>.
                    All your data including messages, posts, and profile information
                    will be permanently deleted.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Type <span className="font-mono font-bold">DELETE</span> to
                      confirm
                    </label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="border-red-200 focus-visible:ring-red-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE" || deleting}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1.5" />
                      )}
                      Delete Permanently
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDeleteOpen(false)
                        setDeleteConfirm("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
