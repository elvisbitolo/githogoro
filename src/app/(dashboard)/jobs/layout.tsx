import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jobs in Githogoro, Nairobi — Find Local Work & Hiring",
  description:
    "Browse and post local jobs in Githogoro, Nairobi. Find work near Runda, Northern Bypass, and Westlands. Community jobs board for Githogoro residents.",
  keywords: [
    "Githogoro jobs",
    "Nairobi jobs",
    "local jobs Githogoro",
    "jobs near Runda",
    "hiring Githogoro",
    "Githogoro employment",
    "work Githogoro Nairobi",
    "community jobs board",
  ],
  openGraph: {
    title: "Jobs in Githogoro, Nairobi — Githogoro",
    description:
      "Browse and post local jobs in Githogoro, Nairobi. Find work near Runda, Northern Bypass, and Westlands.",
    url: "https://githogoro.vercel.app/jobs",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app/jobs",
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children
}
