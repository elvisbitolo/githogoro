import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import MarketplacePageClient from "./page-client"

export default async function MarketplacePage() {
  let items: any[] = []
  try {
    items = await prisma.marketplaceItem.findMany({
      where: { status: "available" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { seller: { select: { id: true, name: true, avatarUrl: true } } },
    })
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

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item: any) => (
            <Link key={item.id} href={`/marketplace/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                {item.photos && item.photos.length > 0 ? (
                  <div className="relative aspect-square bg-zinc-100">
                    <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-white/60" />
                  </div>
                )}
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <p className="text-emerald-700 font-bold text-base mt-1">Ksh {item.price.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{item.seller?.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No items yet</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to sell!</p>
          </CardContent>
        </Card>
      )}

      <MarketplacePageClient />
    </div>
  )
}
