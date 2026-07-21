"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Phone, Trash2, Star } from "lucide-react"

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
  bloodType: string | null
  allergies: string | null
  conditions: string | null
  isDefault: boolean
  createdAt: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", relationship: "", bloodType: "", allergies: "", conditions: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/safety/contacts")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContacts(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.phone || !form.relationship) return
    setSaving(true)
    try {
      const res = await fetch("/api/safety/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const newContact = await res.json()
        setContacts((prev) => [newContact, ...prev])
        setForm({ name: "", phone: "", relationship: "", bloodType: "", allergies: "", conditions: "" })
        setShowForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emergency Contacts</h1>
          <p className="text-zinc-500 text-sm mt-1">People to contact in an emergency</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Relationship (e.g. Parent, Sibling)" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
              <Input placeholder="Blood type (optional)" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} />
              <Input placeholder="Allergies (optional)" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              <Input placeholder="Medical conditions (optional)" value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? "Saving..." : "Save Contact"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No emergency contacts yet</p>
            <p className="text-sm text-zinc-400 mt-1">Add contacts who should be reached in an emergency</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{contact.name}</h3>
                        {contact.isDefault && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                            <Star className="h-3 w-3 mr-1" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{contact.relationship} &middot; {contact.phone}</p>
                      {(contact.bloodType || contact.allergies || contact.conditions) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contact.bloodType && <Badge variant="secondary" className="text-[10px]">Blood: {contact.bloodType}</Badge>}
                          {contact.allergies && <Badge variant="secondary" className="text-[10px]">Allergies: {contact.allergies}</Badge>}
                          {contact.conditions && <Badge variant="secondary" className="text-[10px]">Conditions: {contact.conditions}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
