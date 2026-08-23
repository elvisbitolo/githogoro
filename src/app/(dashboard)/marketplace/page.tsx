import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MarketplacePageClient from "./page-client"

interface MarketplaceItemWithSeller {
  id: string
  title: string
  price: number
  category: string
  photos: string[]
  status: string
  seller: { id: string; name: string; avatarUrl: string | null }
}

export default async function MarketplacePage() {
  let items: MarketplaceItemWithSeller[] = []
  try {
    items = (await prisma.marketplaceItem.findMany({
      where: { status: "available" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { seller: { select: { id: true, name: true, avatarUrl: true } } },
    })) as unknown as MarketplaceItemWithSeller[]
  } catch {
    // DB not available
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <Link href="/marketplace/new">
          <span className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            Sell Item
          </span>
        </Link>
      </div>

      <p className="text-zinc-500 mb-4">
        Buy and sell goods in the Githogoro community marketplace. Find deals on electronics, furniture, clothing, and more from your neighbors.
      </p>

      <MarketplacePageClient initialItems={items} />
    </div>
  )
}
