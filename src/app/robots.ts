import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/c-panel/"],
      },
    ],
    sitemap: "https://githogoro.netlify.app/sitemap.xml",
  }
}
