import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Community Feed — Githogoro",
  description:
    "Stay up to date with the Githogoro community feed. Posts, updates, news, and stories from your neighbors in Githogoro, Nairobi.",
  keywords: [
    "Githogoro feed",
    "Githogoro community feed",
    "Githogoro news",
    "Nairobi community posts",
    "Githogoro updates",
    "Githogoro stories",
    "community feed Nairobi",
  ],
  openGraph: {
    title: "Community Feed — Githogoro",
    description:
      "Stay up to date with the Githogoro community feed.",
    url: "https://githogoro.vercel.app/feed",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app/feed",
  },
}

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children
}
