"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

export default function MarketplacePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">Marketplace Coming Soon</p>
          <p className="text-sm text-zinc-400 mt-1 text-center max-w-sm">
            Buy and sell items within Githogoro. This feature is being rolled out.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
