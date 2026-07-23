import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events in Githogoro, Nairobi — Community Calendar",
  description:
    "Find and RSVP to events in Githogoro, Nairobi. Community gatherings, meetings, sports, and social events near Runda and Northern Bypass.",
  keywords: [
    "Githogoro events",
    "Nairobi events",
    "community events Githogoro",
    "Githogoro calendar",
    "events near Runda",
    "Githogoro gatherings",
    "Nairobi community events",
  ],
  openGraph: {
    title: "Events in Githogoro, Nairobi — Githogoro",
    description:
      "Find and RSVP to events in Githogoro, Nairobi.",
    url: "https://githogoro.vercel.app/events",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app/events",
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
