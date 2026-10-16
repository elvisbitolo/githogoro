import type { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/news"

const BASE_URL = "https://githogoro.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Public pages that Googlebot can reach without authentication.
  // /jobs, /businesses, /marketplace, /events are publicly accessible.
  // All other dashboard routes (/feed, /chat, etc.) require login.
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/news", priority: 0.9, changeFrequency: "weekly" },
    { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
    { path: "/businesses", priority: 0.9, changeFrequency: "daily" },
    { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.8, changeFrequency: "daily" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/data-deletion", priority: 0.3, changeFrequency: "yearly" },
  ]

  const staticPages = pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const articlePages = getAllArticles().map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages]
}
