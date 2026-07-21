"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, UserCheck, AlertTriangle, Route } from "lucide-react"

const CARDS = [
  { title: "Emergency Contacts", desc: "Manage your emergency contacts", href: "/safety/contacts", icon: Phone, color: "bg-red-50 text-red-600" },
  { title: "Child Check-In", desc: "Log your child's safety status", href: "/safety/checkin", icon: UserCheck, color: "bg-blue-50 text-blue-600" },
  { title: "Missing Person", desc: "Report or view missing alerts", href: "/safety/missing", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
  { title: "Safe Routes", desc: "Share and discover safe paths", href: "/safety/routes", icon: Route, color: "bg-emerald-50 text-emerald-600" },
]

export default function SafetyPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Safety Hub</h1>
        <p className="text-zinc-500 text-sm mt-1">Keep your family and community safe</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-sm text-zinc-500">{card.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
