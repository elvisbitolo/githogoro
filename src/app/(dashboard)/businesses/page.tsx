import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Star, MapPin } from "lucide-react"
import Link from "next/link"
import BusinessesPageClient from "./page-client"

export default async function BusinessesPage() {
  let businesses: any[] = []
  try {
    businesses = await prisma.business.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        reviews: { select: { rating: true } },
      },
    })
  } catch {
    // DB not available
  }

  const businessList = businesses.map((biz) => ({
    ...biz,
    avgRating: biz.reviews.length > 0
      ? biz.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / biz.reviews.length
      : 0,
    reviewCount: biz.reviews.length,
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Local Businesses</h1>
          <p className="text-zinc-500 mt-1">Support Githogoro businesses</p>
        </div>
        <Link href="/businesses/new">
          <span className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            + Add Business
          </span>
        </Link>
      </div>

      <p className="text-zinc-500 mb-4">
        Discover local businesses in Githogoro, Nairobi. Find shops, services, restaurants, and professionals near Runda, Northern Bypass, and Westlands.
      </p>

      {businessList.length > 0 ? (
        <div className="space-y-3">
          {businessList.map((biz: any) => (
            <Link key={biz.id} href={`/businesses/${biz.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {biz.photos && biz.photos.length > 0 ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                        <img src={biz.photos[0]} alt={biz.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <Store className="h-8 w-8 text-zinc-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{biz.name}</h3>
                        {biz.isFeatured && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">{biz.category}</Badge>
                      {biz.description && (
                        <p className="text-sm text-zinc-600 mt-1.5 line-clamp-2">{biz.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {biz.avgRating > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= Math.round(biz.avgRating)
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-zinc-200 fill-zinc-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-zinc-500">
                              {biz.avgRating.toFixed(1)} ({biz.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No businesses yet</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to add a business!</p>
          </CardContent>
        </Card>
      )}

      <BusinessesPageClient />
    </div>
  )
}
