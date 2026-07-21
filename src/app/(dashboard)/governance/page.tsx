"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Wallet,
  AlertCircle,
  FileText,
  HandHeart,
} from "lucide-react"

const governanceSections = [
  {
    href: "/governance/budget",
    label: "Budget Tracker",
    description: "Track community income and expenses",
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/governance/complaints",
    label: "Complaints",
    description: "Submit and track community complaints",
    icon: AlertCircle,
    color: "bg-red-50 text-red-700",
  },
  {
    href: "/governance/meetings",
    label: "Meeting Minutes",
    description: "View community meeting records",
    icon: FileText,
    color: "bg-blue-50 text-blue-700",
  },
  {
    href: "/governance/volunteer",
    label: "Volunteer Board",
    description: "Find and sign up for volunteer opportunities",
    icon: HandHeart,
    color: "bg-purple-50 text-purple-700",
  },
]

export default function GovernancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Governance</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Community governance and participation
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {governanceSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6">
                <div
                  className={`h-12 w-12 rounded-xl ${section.color} flex items-center justify-center mb-4`}
                >
                  <section.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  {section.label}
                </h3>
                <p className="text-sm text-zinc-500">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
