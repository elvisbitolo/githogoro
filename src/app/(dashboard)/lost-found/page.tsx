"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function LostFoundPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lost & Found</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Search className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">Coming Soon</p>
          <p className="text-sm text-zinc-400 mt-1 text-center max-w-sm">
            Post and find lost items in Githogoro. This feature is coming in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
