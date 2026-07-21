"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"

export function AdminAccessDot() {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/access-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })

      if (res.ok) {
        router.push("/c-panel")
      } else {
        setError("Invalid key")
      }
    } catch {
      setError("Something went wrong")
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500 transition-colors opacity-40 hover:opacity-80"
        aria-label="Admin access"
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-6 w-80 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Lock className="h-4 w-4 text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin Access</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter access key"
                autoFocus
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-3"
              />

              {error && (
                <p className="text-xs text-red-500 mb-3">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setKey(""); setError("") }}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!key || loading}
                  className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                  {loading ? "Verifying..." : "Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
