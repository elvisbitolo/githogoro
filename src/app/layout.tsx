import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n/context"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Githogoro Connect — Community App for Githogoro, Nairobi | Jobs, Businesses, Chat",
    template: "%s | Githogoro Connect",
  },
  description:
    "Githogoro Connect is the #1 community app for Githogoro, Nairobi. Chat with neighbors, find local jobs, discover businesses, join groups, buy & sell in the marketplace, get alerts, and connect with the Githogoro community near Runda and Northern Bypass.",
  keywords: [
    "Githogoro",
    "Githogoro Connect",
    "Githogoro community",
    "Githogoro Nairobi",
    "Githogoro app",
    "Githogoro jobs",
    "Githogoro businesses",
    "Githogoro marketplace",
    "Githogoro chat",
    "Githogoro events",
    "Githogoro news",
    "Githogoro Runda",
    "Githogoro Northern Bypass",
    "Githogoro Westlands",
    "Karura ward",
    "Nairobi community app",
    "Nairobi jobs",
    "Nairobi marketplace",
    "Kenya community",
    "Runda estate",
    "Githogoro harambee",
    "Githogoro tontine",
    "Githogoro loans",
    "Githogoro skills",
    "Githogoro talents",
    "Githogoro groups",
    "Githogoro safety",
    "Githogoro errands",
    "Githogoro rides",
    "Githogoro meals",
    "Githogoro tools",
    "Githogoro stories",
    "Githogoro governance",
    "Githogoro petition",
    "Githogoro lost and found",
    "Githogoro SOS",
    "Githogoro alerts",
    "Githogoro bundles",
    "Githogoro polls",
    "Githogoro leaderboard",
    "Githogoro recipes",
    "Githogoro parenting",
    "Githogoro memories",
    "Githogoro health",
    "Githogoro obituaries",
    "Githogoro prices",
    "Githogoro savings",
    "Githogoro group buy",
    "Githogoro petitions",
    "githogoroconnect",
  ],
  authors: [{ name: "Githogoro Connect", url: "https://githogoroconnect.com" }],
  creator: "Githogoro Connect",
  publisher: "Githogoro Connect",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://githogoroconnect.com",
    siteName: "Githogoro Connect",
    title: "Githogoro Connect — Community App for Githogoro, Nairobi",
    description:
      "The #1 community app for Githogoro, Nairobi. Chat, jobs, businesses, marketplace, events, and more. Karibu Githogoro!",
    images: [
      {
        url: "https://githogoro.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Githogoro Connect — Community App for Githogoro, Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Githogoro Connect — Community App for Githogoro, Nairobi",
    description:
      "Chat, find jobs, discover businesses, and connect with your neighbors in Githogoro, Nairobi.",
    images: ["https://githogoro.vercel.app/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app",
  },
  other: {
    "google-site-verification": "EO1A_95MmyPuFD2ULeSrZ2xzliMUJEdAWtRmclDUwPo",
    "application-name": "Githogoro Connect",
    "msapplication-TileColor": "#1B4332",
    "theme-color": "#1B4332",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Githogoro Connect",
    url: "https://githogoro.vercel.app",
    description:
      "The #1 community app for Githogoro, Nairobi. Chat with neighbors, find local jobs, discover businesses, join groups, buy & sell in the marketplace, and connect with the Githogoro community.",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES",
    },
    about: {
      "@type": "Place",
      name: "Githogoro",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressRegion: "Westlands",
        addressCountry: "KE",
      },
    },
    author: {
      "@type": "Organization",
      name: "Githogoro Connect",
      url: "https://githogoro.vercel.app",
    },
  }

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh bg-[#FAF9F6] text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          <ToastProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
