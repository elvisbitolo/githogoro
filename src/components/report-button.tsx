"use client"

import { useState } from "react"
import { Flag, Loader2, Check } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface ReportButtonProps {
  targetType: "user" | "post" | "message" | "marketplace" | "business" | "comment"
  targetId: string
  className?: string
  children?: React.ReactNode
  onClickCloseMenu?: () => void
}

export function ReportButton({ targetType, targetId, className, children, onClickCloseMenu }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const reset = () => {
    setOpen(false)
    setReason("")
    setDetails("")
    setDone(false)
    setSubmitting(false)
  }

  const submit = async () => {
    if (reason.trim().length < 5 || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
          details: details.trim() || undefined,
        }),
      })
      if (res.ok) {
        setDone(true)
        setTimeout(reset, 1500)
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to submit report" }))
        alert(err.error || "Failed to submit report")
      }
    } catch {
      alert("Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { onClickCloseMenu?.(); setOpen(true) }}
        className={className}
      >
        {children || (
          <span className="flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            Report
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent className="bg-white text-zinc-900 border-zinc-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Flag className="h-5 w-5" /> Report content
            </DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">Report submitted</p>
              <p className="text-xs text-zinc-500 mt-1">Our moderation team will review it shortly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Reports are confidential. Please describe why this content violates community guidelines.
              </p>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block font-medium">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="What is wrong with this content?"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block font-medium">Additional details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  placeholder="Any extra context for the moderation team"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={reason.trim().length < 5 || submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit report
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
