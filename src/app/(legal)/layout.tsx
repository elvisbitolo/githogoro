import Link from "next/link"
import { MessageSquare, ArrowLeft } from "lucide-react"

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-dvh bg-[#FAF9F6] dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
              <MessageSquare className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Githogoro</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-emerald-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-emerald-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-emerald-700">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-emerald-700">
              Data Deletion
            </Link>
          </nav>
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Githogoro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
