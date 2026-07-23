"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Stethoscope,
  Droplets,
  Brain,
} from "lucide-react"

const healthSections = [
  {
    href: "/health/clinics",
    label: "Clinics",
    description: "Find nearby clinics and health centers",
    icon: Stethoscope,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/health/blood-donors",
    label: "Blood Donors",
    description: "Find or register as a blood donor",
    icon: Droplets,
    color: "bg-red-50 text-red-700",
  },
  {
    href: "/health/mood",
    label: "Mental Health",
    description: "Check in with your mood and well-being",
    icon: Brain,
    color: "bg-purple-50 text-purple-700",
  },
]

export default function HealthPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Health Hub</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Your community health resources
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthSections.map((section) => (
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
