import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n/context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Githogoro Connect — Karibu Githogoro",
    template: "%s | Githogoro Connect",
  },
  description: "Karibu Githogoro — The Heart of Our Community. Chat, find jobs, discover local businesses, and connect with your neighbors in Githogoro, Nairobi.",
  keywords: ["Githogoro", "Runda", "Nairobi", "community", "jobs", "businesses", "Rysa FC", "Githogoro Connect"],
  authors: [{ name: "Githogoro Connect" }],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Githogoro Connect",
    title: "Githogoro Connect — Karibu Githogoro",
    description: "The Heart of Our Community. Chat, jobs, businesses, and events in Githogoro.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Githogoro Connect",
    description: "The Heart of Our Community.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B4332",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-[#FAF9F6] text-zinc-900 font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
