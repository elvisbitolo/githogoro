"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">Something went wrong</h1>
      <pre className="text-sm text-red-400 mb-4 max-w-xl text-center whitespace-pre-wrap">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        Try again
      </button>
    </div>
  )
}