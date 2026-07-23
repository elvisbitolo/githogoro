"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  ExternalLink,
  Heart,
  Users,
  Leaf,
  Shield,
  Dumbbell,
  Stethoscope,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface Partner {
  id: string
  name: string
  description: string | null
  category: string
  contactPhone: string | null
  contactEmail: string | null
  website: string | null
  location: string | null
  isVerified: boolean
}

const iconMap: Record<string, React.ElementType> = {
  education: GraduationCap,
  health: Stethoscope,
  environment: Leaf,
  sports: Dumbbell,
  youth: Users,
  default: Shield,
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  education: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  health: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  environment: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  sports: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  default: { bg: "bg-zinc-50", text: "text-zinc-600", border: "border-zinc-200" },
}

const fallbackPartners = [
  {
    id: "fallback-1",
    name: "Brilliant Angels Academy",
    description: "Community-Based Organisation transforming lives in Githogoro through education, environmental stewardship, youth empowerment, and community development since 2018.",
    category: "education",
    contactPhone: "+254796595995",
    contactEmail: "brilliantangelacademy@gmail.com",
    website: "https://brilliant-angel-cbo.vercel.app",
    location: "Githogoro Slums, Westlands, Nairobi",
    isVerified: true,
  },
]

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partners")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPartners(data)
        } else {
          setPartners(fallbackPartners)
        }
        setLoading(false)
      })
      .catch(() => {
        setPartners(fallbackPartners)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h1 className="text-2xl font-bold text-zinc-900">Community Partners</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Organisations making a difference in Githogoro. Support them, volunteer, or connect.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-40" /></Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {partners.map((partner) => {
            const cat = partner.category?.toLowerCase() || "default"
            const Icon = iconMap[cat] || iconMap.default
            const colors = colorMap[cat] || colorMap.default
            return (
              <Card key={partner.id} className={`border-2 ${colors.border} overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-zinc-900">{partner.name}</h2>
                        {partner.isVerified && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                            Verified Partner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {partner.description && (
                    <p className="text-sm text-zinc-600 mb-4">{partner.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-zinc-500">
                    {partner.location && <span>📍 {partner.location}</span>}
                    {partner.contactPhone && (
                      <>
                        <span>•</span>
                        <span>📱 {partner.contactPhone}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {partner.website && (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <ExternalLink className="h-3.5 w-3.5" /> Visit Website
                        </Button>
                      </a>
                    )}
                    {partner.contactPhone && (
                      <a href={`https://wa.me/${partner.contactPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-2">
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-8 border-dashed border-2 border-zinc-200">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-zinc-500 mb-2">
            Want to list your organisation as a community partner?
          </p>
          <p className="text-xs text-zinc-400">
            Contact us through the app or email us to get verified and listed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
