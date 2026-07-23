import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/c-panel/"],
      },
      {
        userAgent: "*",
        allow: "/api/stats",
      },
    ],
    sitemap: "https://githogoro.onrender.com/sitemap.xml",
  }
}
