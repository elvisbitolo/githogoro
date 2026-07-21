import type { MetadataRoute } from "next"

const BASE_URL = "https://githogoro.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/feed", priority: 0.9, changeFrequency: "daily" },
    { path: "/dashboard", priority: 0.9, changeFrequency: "daily" },
    { path: "/map", priority: 0.8, changeFrequency: "weekly" },
    { path: "/people", priority: 0.8, changeFrequency: "weekly" },
    { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
    { path: "/businesses", priority: 0.9, changeFrequency: "daily" },
    { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.8, changeFrequency: "daily" },
    { path: "/groups", priority: 0.8, changeFrequency: "weekly" },
    { path: "/chat", priority: 0.7, changeFrequency: "daily" },
    { path: "/videos", priority: 0.8, changeFrequency: "daily" },
    { path: "/alerts", priority: 0.7, changeFrequency: "weekly" },
    { path: "/bundles", priority: 0.8, changeFrequency: "weekly" },
    { path: "/polls", priority: 0.7, changeFrequency: "weekly" },
    { path: "/leaderboard", priority: 0.6, changeFrequency: "weekly" },
    { path: "/lost-found", priority: 0.7, changeFrequency: "weekly" },
    { path: "/stories", priority: 0.7, changeFrequency: "weekly" },
    { path: "/skills", priority: 0.7, changeFrequency: "weekly" },
    { path: "/harambee", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tontine", priority: 0.8, changeFrequency: "weekly" },
    { path: "/loans", priority: 0.7, changeFrequency: "weekly" },
    { path: "/savings", priority: 0.7, changeFrequency: "weekly" },
    { path: "/group-buy", priority: 0.7, changeFrequency: "weekly" },
    { path: "/errands", priority: 0.7, changeFrequency: "weekly" },
    { path: "/rides", priority: 0.7, changeFrequency: "weekly" },
    { path: "/meals", priority: 0.6, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.6, changeFrequency: "weekly" },
    { path: "/obituaries", priority: 0.6, changeFrequency: "weekly" },
    { path: "/talents", priority: 0.7, changeFrequency: "weekly" },
    { path: "/recipes", priority: 0.6, changeFrequency: "weekly" },
    { path: "/petitions", priority: 0.7, changeFrequency: "weekly" },
    { path: "/parenting", priority: 0.6, changeFrequency: "weekly" },
    { path: "/memories", priority: 0.6, changeFrequency: "weekly" },
    { path: "/health", priority: 0.7, changeFrequency: "weekly" },
    { path: "/governance", priority: 0.7, changeFrequency: "weekly" },
    { path: "/prices", priority: 0.7, changeFrequency: "weekly" },
    { path: "/sos", priority: 0.6, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/messages", priority: 0.6, changeFrequency: "daily" },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
