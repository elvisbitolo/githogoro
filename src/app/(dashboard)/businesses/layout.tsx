import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Businesses in Githogoro, Nairobi — Local Directory",
  description:
    "Discover local businesses in Githogoro, Nairobi. Find shops, services, restaurants, and professionals near Runda, Northern Bypass, and Westlands.",
  keywords: [
    "Githogoro businesses",
    "Nairobi businesses",
    "local businesses Githogoro",
    "Githogoro directory",
    "shops Githogoro",
    "services Githogoro Nairobi",
    "business directory",
  ],
  openGraph: {
    title: "Businesses in Githogoro, Nairobi — Githogoro",
    description:
      "Discover local businesses in Githogoro, Nairobi.",
    url: "https://githogoro.vercel.app/businesses",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app/businesses",
  },
}

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return children
}
