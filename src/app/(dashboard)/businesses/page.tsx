"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Phone, Star } from "lucide-react"

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from("businesses").select("*").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setBusinesses(data)
      setLoading(false)
    })
  }, [supabase])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Local Businesses</h1>
          <p className="text-zinc-500 mt-1">Support Githogoro businesses</p>
        </div>
      </div>

      <div className="space-y-3">
        {!businesses || businesses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No businesses listed yet</p>
              <p className="text-sm text-zinc-400 mt-1">Businesses from Githogoro will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          businesses.map((biz) => (
            <Card key={biz.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg truncate">{biz.name}</h3>
                      {biz.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <Badge variant="secondary" className="mt-1">{biz.category}</Badge>
                    {biz.description && (
                      <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{biz.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-500">
                      {biz.phone && (
                        <a href={`tel:${biz.phone}`} className="flex items-center gap-1 hover:text-emerald-700">
                          <Phone className="h-3.5 w-3.5" /> {biz.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
