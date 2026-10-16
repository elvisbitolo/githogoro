import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Data Deletion",
  description:
    "How to request deletion of your Githogoro account and personal data, including data obtained via Google or Facebook sign-in.",
  alternates: { canonical: "https://githogoro.vercel.app/data-deletion" },
}

const CONTACT_EMAIL = "support@githogoro.app"
const LAST_UPDATED = "October 16, 2026"

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
        {number}
      </div>
      <div>
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        <div className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
      </div>
    </div>
  )
}

export default function DataDeletionPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Data Deletion</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You can request deletion of your Githogoro account and the personal data associated with it
        at any time. This page explains how, including data obtained when you sign in with Google or
        Facebook.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Option 1 — Delete from your account settings
        </h2>
        <div className="mt-4 space-y-6">
          <Step number={1} title="Sign in to Githogoro">
            Go to https://githogoro.vercel.app/login and sign in to your account.
          </Step>
          <Step number={2} title="Open Settings">
            Navigate to the Settings page from your dashboard.
          </Step>
          <Step number={3} title="Choose Delete Account">
            Select <strong>Delete Account</strong>, type <strong>DELETE</strong> to confirm, and
            submit. Your account and personal data will be permanently deleted.
          </Step>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Option 2 — Request deletion by email
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          If you cannot sign in, email us at{" "}
          <a className="text-emerald-700 hover:underline" href={`mailto:${CONTACT_EMAIL}?subject=Data%20Deletion%20Request`}>
            {CONTACT_EMAIL}
          </a>{" "}
          with the subject &ldquo;Data Deletion Request&rdquo; and the phone number or email address
          linked to your account. We will verify the request and delete your account and associated
          personal data within 30 days. We will confirm once the deletion is complete.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Data obtained from Google or Facebook
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          When you sign in with Google or Facebook, we receive basic profile information such as
          your name, email address, and profile picture. Deleting your Githogoro account removes
          this information from our systems.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          You can also disconnect Githogoro from your social account at any time:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Facebook:</strong> Settings &amp; Privacy → Settings → Apps and Websites, then
            remove Githogoro.
          </li>
          <li>
            <strong>Google:</strong> visit{" "}
            <a
              className="text-emerald-700 hover:underline"
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>{" "}
            and remove Githogoro&apos;s access.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          What gets deleted
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <li>Your profile information (name, phone number, zone, profile picture).</li>
          <li>Your messages, posts, listings, and other content you created.</li>
          <li>Your authentication account and sign-in credentials.</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Some information may be retained where required by law or for legitimate security and
          fraud-prevention purposes.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          For any questions about data deletion, contact us at{" "}
          <a className="text-emerald-700 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </article>
  )
}
