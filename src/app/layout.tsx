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
    default: "Githogoro — Community App for Githogoro, Nairobi | Jobs, Businesses, Chat",
    template: "%s | Githogoro",
  },
  description:
    "Githogoro is the #1 community app for Githogoro, Nairobi. Chat with neighbors, find local jobs, discover businesses, join groups, buy & sell in the marketplace, and get alerts near Runda and Northern Bypass.",
  keywords: [
    "Githogoro",
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
    "githogoro",
  ],
  authors: [{ name: "Githogoro", url: "https://githogoro.vercel.app" }],
  creator: "Githogoro",
  publisher: "Githogoro",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://githogoro.vercel.app",
    siteName: "Githogoro",
    title: "Githogoro — Community App for Githogoro, Nairobi",
    description:
      "The #1 community app for Githogoro, Nairobi. Chat, jobs, businesses, marketplace, events, and more. Karibu Githogoro!",
    images: [
      {
        url: "https://githogoro.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Githogoro — Community App for Githogoro, Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Githogoro — Community App for Githogoro, Nairobi",
    description:
      "Chat, find jobs, discover businesses, and stay connected with your neighbors in Githogoro, Nairobi.",
    images: ["https://githogoro.vercel.app/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
    apple: "/icons/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app",
  },
  other: {
    "google-site-verification": "EO1A_95MmyPuFD2ULeSrZ2xzliMUJEdAWtRmclDUwPo",
    "application-name": "Githogoro",
    "msapplication-TileColor": "#1B4332",
    "theme-color": "#1B4332",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4332",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://githogoro.vercel.app/#website",
        name: "Githogoro",
        alternateName: ["Githogoro Connect", "Githogoro Community App"],
        url: "https://githogoro.vercel.app",
        description:
          "Githogoro community app for Githogoro, Nairobi. Chat with neighbors, find local jobs, discover businesses, and stay connected.",
        inLanguage: ["en", "sw"],
        about: { "@id": "https://githogoro.vercel.app/#place" },
        publisher: { "@id": "https://githogoro.vercel.app/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://githogoro.vercel.app/jobs?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://githogoro.vercel.app/#organization",
        name: "Githogoro",
        url: "https://githogoro.vercel.app",
        logo: "https://githogoro.vercel.app/icons/icon-512x512.png",
        areaServed: { "@id": "https://githogoro.vercel.app/#place" },
      },
      {
        "@type": "Place",
        "@id": "https://githogoro.vercel.app/#place",
        name: "Githogoro",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressRegion: "Westlands",
          addressCountry: "KE",
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://githogoro.vercel.app/#app",
        name: "Githogoro",
        url: "https://githogoro.vercel.app",
        description:
          "The #1 community app for Githogoro, Nairobi. Chat with neighbors, find local jobs, discover businesses, join groups, buy & sell in the marketplace, and engage with the Githogoro community.",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KES",
        },
        about: { "@id": "https://githogoro.vercel.app/#place" },
        author: { "@id": "https://githogoro.vercel.app/#organization" },
        publisher: { "@id": "https://githogoro.vercel.app/#organization" },
      },
    ],
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
