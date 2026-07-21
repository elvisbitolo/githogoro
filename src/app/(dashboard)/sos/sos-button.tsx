"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SOSButtonProps {
  onTrigger: (message: string) => void
  loading: boolean
}

export function SOSButton({ onTrigger, loading }: SOSButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleConfirm = () => {
    onTrigger(message)
    setOpen(false)
    setMessage("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="relative group"
      >
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 group-hover:opacity-50" />
        <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
          <div className="text-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">SOS</span>
            <p className="text-xs sm:text-sm mt-1 opacity-90 font-medium">
              {loading ? "Sending..." : "Tap for Emergency"}
            </p>
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-xl">Emergency SOS</DialogTitle>
            <p className="text-sm text-zinc-500">
              This will send an emergency alert to all community admins and nearby members
              with your location. Are you sure you want to proceed?
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Optional message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Describe your emergency (optional)..."
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? "Sending..." : "Send SOS"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
