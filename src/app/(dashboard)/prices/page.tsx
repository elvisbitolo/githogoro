"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Tag, Plus, TrendingDown, TrendingUp, MapPin } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface PriceReport {
  id: string
  product: string
  shop: string
  price: number
  zone: string | null
  createdAt: string
  user: { id: string; name: string }
}

export default function PricesPage() {
  const [reports, setReports] = useState<PriceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportProduct, setReportProduct] = useState("")
  const [reportShop, setReportShop] = useState("")
  const [reportPrice, setReportPrice] = useState("")
  const [reportZone, setReportZone] = useState("")
  const [reportError, setReportError] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("product", search)

    setLoading(true)
    fetch(`/api/prices?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
  }, [])

  const handleReport = useCallback(async () => {
    setReportSubmitting(true)
    setReportError("")

    const res = await fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: reportProduct,
        shop: reportShop,
        price: reportPrice,
        zone: reportZone || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setReportError(data.error || "Failed to report price")
      setReportSubmitting(false)
      return
    }

    const newReport = await res.json()
    setReports((prev) => [newReport, ...prev])
    setReportDialogOpen(false)
    setReportProduct("")
    setReportShop("")
    setReportPrice("")
    setReportZone("")
    setReportSubmitting(false)
  }, [reportProduct, reportShop, reportPrice, reportZone])

  function getGroupedProducts() {
    const groups: Record<string, PriceReport[]> = {}
    for (const r of reports) {
      const key = r.product.toLowerCase()
      if (!groups[key]) groups[key] = []
      groups[key].push(r)
    }
    return Object.entries(groups)
  }

  const groupedProducts = getGroupedProducts()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Price Watch</h1>
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
              <Plus className="h-4 w-4 mr-1" />
              Report Price
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report a Price</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Product <span className="text-red-500">*</span>
                </label>
                <Input
                  value={reportProduct}
                  onChange={(e) => setReportProduct(e.target.value)}
                  placeholder="e.g. Milk 500ml"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Shop <span className="text-red-500">*</span>
                </label>
                <Input
                  value={reportShop}
                  onChange={(e) => setReportShop(e.target.value)}
                  placeholder="e.g. Quickmart"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Price (Ksh) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reportPrice}
                    onChange={(e) => setReportPrice(e.target.value)}
                    placeholder="e.g. 65"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Zone</label>
                  <Input
                    value={reportZone}
                    onChange={(e) => setReportZone(e.target.value)}
                    placeholder="e.g. Zone A"
                  />
                </div>
              </div>
              {reportError && (
                <p className="text-sm text-red-600">{reportError}</p>
              )}
              <Button onClick={handleReport} disabled={reportSubmitting} className="w-full">
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
        />
      </form>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse h-24" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Tag className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No price reports found</p>
            <p className="text-sm text-zinc-400 mt-1">Be the first to report a price!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedProducts.map(([product, items]) => {
            const prices = items.map((i) => i.price)
            const lowest = Math.min(...prices)
            const highest = Math.max(...prices)

            return (
              <Card key={product}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{items[0].product}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingDown className="h-3 w-3" />
                        Ksh {lowest.toLocaleString()}
                      </span>
                      {highest !== lowest && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <TrendingUp className="h-3 w-3" />
                          Ksh {highest.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-1.5 border-t border-zinc-50 first:border-0">
                        <div>
                          <p className="text-sm font-medium">{r.shop}</p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{r.user.name}</span>
                            {r.zone && (
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {r.zone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm ${r.price === lowest ? "text-emerald-700" : ""}`}>
                            Ksh {r.price.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400">{formatRelativeTime(r.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
