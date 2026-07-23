import type { MetadataRoute } from "next"

const BASE_URL = "https://githogoro.onrender.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Public pages that Googlebot can reach without authentication.
  // /jobs, /businesses, /marketplace, /events are publicly accessible.
  // All other dashboard routes (/feed, /chat, etc.) require login.
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
    { path: "/businesses", priority: 0.9, changeFrequency: "daily" },
    { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.8, changeFrequency: "daily" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
