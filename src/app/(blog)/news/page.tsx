import type { Metadata } from "next"
import Link from "next/link"
import { getAllArticles, formatArticleDate } from "@/lib/news"

export const metadata: Metadata = {
  title: "Githogoro News & Community Guides",
  description:
    "News, guides, and stories about Githogoro, Nairobi — community life, local jobs, businesses, the marketplace, safety, and events.",
  keywords: [
    "Githogoro news",
    "Githogoro guide",
    "Githogoro community",
    "Githogoro Nairobi",
    "Githogoro jobs",
    "Githogoro businesses",
  ],
  alternates: { canonical: "https://githogoro.vercel.app/news" },
  openGraph: {
    type: "website",
    url: "https://githogoro.vercel.app/news",
    siteName: "Githogoro",
    title: "Githogoro News & Community Guides",
    description:
      "News, guides, and stories about Githogoro, Nairobi — community life, jobs, businesses, marketplace, safety, and events.",
  },
}

export default function NewsIndexPage() {
  const articles = getAllArticles()

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Githogoro News &amp; Community Guides
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Stories and practical guides about life in Githogoro, Nairobi — from finding
        work and supporting local businesses to staying safe and keeping up with
        community events.
      </p>

      <div className="mt-10 space-y-6">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
              <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{article.readingMinutes} min read</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              <Link
                href={`/news/${article.slug}`}
                className="hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {article.description}
            </p>
            <Link
              href={`/news/${article.slug}`}
              className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Read article &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
