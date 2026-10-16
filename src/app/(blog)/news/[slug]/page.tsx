import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
  formatArticleDate,
} from "@/lib/news"

const BASE_URL = "https://githogoro.vercel.app"

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return { title: "Article not found" }
  }

  const url = `${BASE_URL}/news/${article.slug}`

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Githogoro",
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const related = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: article.author, url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "Githogoro",
      url: BASE_URL,
      logo: `${BASE_URL}/icons/icon-512x512.png`,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/news/${article.slug}` },
    keywords: article.tags.join(", "),
    about: { "@type": "Place", name: "Githogoro", address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" } },
    inLanguage: "en",
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
        <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
        <span aria-hidden="true">&middot;</span>
        <span>{article.readingMinutes} min read</span>
        <span aria-hidden="true">&middot;</span>
        <span>{article.author}</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 dark:text-zinc-100">
        {article.title}
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{article.description}</p>

      <div className="mt-8 space-y-4">
        {article.content.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2
                key={i}
                className="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {block.text}
              </h2>
            )
          }
          if (block.type === "ul") {
            return (
              <ul
                key={i}
                className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )
          }
          return (
            <p key={i} className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              {block.text}
            </p>
          )
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-emerald-700 p-6 text-center text-white dark:bg-emerald-800">
        <p className="text-lg font-semibold">Join the Githogoro community</p>
        <p className="mt-1 text-sm text-emerald-100">
          Chat with neighbours, find local jobs, and support businesses in Githogoro.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Get started free
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            More from Githogoro
          </h2>
          <ul className="mt-4 space-y-3">
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/news/${a.slug}`}
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
