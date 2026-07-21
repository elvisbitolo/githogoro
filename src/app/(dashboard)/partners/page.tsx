"use client"

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

const partners = [
  {
    name: "Brilliant Angels Academy",
    tagline: "Empowering Change, Inspiring Hope",
    description:
      "Community-Based Organisation transforming lives in Githogoro through education, environmental stewardship, youth empowerment, and community development since 2018.",
    url: "https://brilliant-angel-cbo.vercel.app",
    phone: "+254796595995",
    email: "brilliantangelacademy@gmail.com",
    location: "Githogoro Slums, Westlands, Nairobi",
    established: "2018",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-200",
    programs: [
      { name: "Education", icon: GraduationCap, desc: "Scholarships, meals, uniforms & supplies for vulnerable children" },
      { name: "Environment", icon: Leaf, desc: "Waste management, tree planting & community cleanups" },
      { name: "Sports & Arts", icon: Dumbbell, desc: "Football, rugby, and dance crew for youth development" },
      { name: "Youth & Women", icon: Users, desc: "Tailoring, soap making, hairdressing & entrepreneurship" },
      { name: "Health & Wellness", icon: Stethoscope, desc: "Medical camps, HIV awareness & mental health support" },
      { name: "Disaster Management", icon: Shield, desc: "Preparedness training & emergency response" },
    ],
    highlights: [
      "Sulwe Mentorship & Scholarship — top students visit Makini School",
      "Adopt a Child — sponsor 1 child when a family enrolls 3",
      "M-Pesa Pay Bill: 522533 (Acc: 7902003)",
    ],
    social: {
      facebook: "https://web.facebook.com/BrilliantAngelsAcademy/",
    },
  },
]

export default function PartnersPage() {
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

      <div className="space-y-6">
        {partners.map((partner) => {
          const Icon = partner.icon
          return (
            <Card key={partner.name} className={`border-2 ${partner.borderColor} overflow-hidden`}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl ${partner.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-zinc-900">{partner.name}</h2>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                          Official Partner
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 italic">{partner.tagline}</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 mb-4">{partner.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-zinc-500">
                    <span>📍 {partner.location}</span>
                    <span>•</span>
                    <span>Est. {partner.established}</span>
                    <span>•</span>
                    <span>📱 {partner.phone}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {partner.programs.map((prog) => {
                      const PIcon = prog.icon
                      return (
                        <div
                          key={prog.name}
                          className="rounded-lg bg-zinc-50 p-3 border border-zinc-100"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <PIcon className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="text-xs font-semibold text-zinc-700">{prog.name}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-tight">{prog.desc}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 mb-4">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Key Programmes</p>
                    <ul className="space-y-1">
                      {partner.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-emerald-600 flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={partner.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <ExternalLink className="h-3.5 w-3.5" /> Visit Website
                      </Button>
                    </a>
                    <a href={`https://wa.me/${partner.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        💬 WhatsApp
                      </Button>
                    </a>
                    {partner.social?.facebook && (
                      <a href={partner.social.facebook} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-2">
                          Facebook
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
