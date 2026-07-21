export const SITE_NAME = "Githogoro Connect"
export const SITE_DESCRIPTION = "Karibu Githogoro — The Heart of Our Community. Chat, jobs, businesses, events, and everything Githogoro in one place."
export const SITE_URL = "https://githogoroconnect.com"
export const ADMIN_ID_PROCESS = process.env.ADMIN_USER_ID || ""
export const APP_VERSION = "1.0.0"

export const ZONES = [
  "Matopeni", "72 Estate", "Blue Estate", "Green Estate",
  "Mji wa Huruma", "Shantii", "Runda Meadows", "Muringa Farm",
  "Zone A", "Zone B", "Zone C", "Zone D",
  "Githogoro Stage", "Northern Bypass", "Kiwaru", "Other",
] as const

export const JOB_TYPES = ["full-time", "part-time", "casual", "contract", "internship"] as const

export const BUSINESS_CATEGORIES = [
  "Food & Drinks", "Salon & Barber", "Hardware", "Boda Boda",
  "Retail Shop", "Health", "Education", "Transport", "Other"
] as const

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/chat", label: "Chat", icon: "MessageSquare" },
  { href: "/jobs", label: "Jobs", icon: "Briefcase" },
  { href: "/map", label: "Map", icon: "MapPin" },
  { href: "/businesses", label: "Businesses", icon: "Store" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const
