import Link from "next/link"
import { MessageSquare, ArrowLeft } from "lucide-react"

export default function BlogLayout({
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
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Home
            </Link>
            <Link href="/news" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              News
            </Link>
            <Link href="/jobs" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Jobs
            </Link>
            <Link href="/businesses" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Businesses
            </Link>
            <Link href="/marketplace" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Marketplace
            </Link>
            <Link href="/events" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Events
            </Link>
            <Link href="/privacy" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Terms
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
