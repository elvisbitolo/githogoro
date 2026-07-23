import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketplace in Githogoro — Buy & Sell Locally",
  description:
    "Buy and sell goods in the Githogoro community marketplace. Find deals on electronics, furniture, clothing, and more from your neighbors in Githogoro, Nairobi.",
  keywords: [
    "Githogoro marketplace",
    "buy and sell Githogoro",
    "Nairobi marketplace",
    "local marketplace",
    "Githogoro classifieds",
    "community marketplace Nairobi",
    "Githogoro deals",
  ],
  openGraph: {
    title: "Marketplace in Githogoro — Githogoro",
    description:
      "Buy and sell goods in the Githogoro community marketplace.",
    url: "https://githogoro.vercel.app/marketplace",
  },
  alternates: {
    canonical: "https://githogoro.vercel.app/marketplace",
  },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
