import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Githogoro collects, uses, and protects your personal information.",
  alternates: { canonical: "https://githogoro.vercel.app/privacy" },
}

const CONTACT_EMAIL = "support@githogoro.app"
const LAST_UPDATED = "October 16, 2026"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Githogoro (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the Githogoro
        community platform available at https://githogoro.vercel.app. This Privacy Policy explains
        what information we collect, how we use it, and the choices you have. By using Githogoro,
        you agree to the practices described here.
      </p>

      <Section title="1. Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong> — your name, phone number, zone/neighbourhood,
            and password (stored securely by our authentication provider).
          </li>
          <li>
            <strong>Sign-in with Google or Facebook</strong> — when you choose to sign in with a
            third-party provider, we receive your basic profile information shared by that
            provider, such as your name, email address, and profile picture.
          </li>
          <li>
            <strong>Content you create</strong> — posts, messages, listings, events, and other
            content you submit to the platform.
          </li>
          <li>
            <strong>Usage and device data</strong> — basic technical information such as browser
            type and pages visited, used to keep the service secure and working properly.
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To create and manage your account and keep you signed in.</li>
          <li>To provide community features such as chat, jobs, businesses, and alerts.</li>
          <li>To show content relevant to your zone and community.</li>
          <li>To protect the platform against abuse, fraud, and security threats.</li>
          <li>To communicate with you about your account and important updates.</li>
        </ul>
      </Section>

      <Section title="3. How We Share Information">
        <p>
          We do not sell your personal information. We share information only with:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Service providers</strong> — such as Supabase (authentication and database
            hosting) and Vercel (application hosting), which process data on our behalf.
          </li>
          <li>
            <strong>Third-party sign-in providers</strong> — Google and Facebook, when you choose
            to sign in with them, in accordance with their own privacy policies.
          </li>
          <li>
            <strong>Other community members</strong> — the content you choose to post publicly on
            the platform.
          </li>
          <li>
            <strong>Legal requirements</strong> — where required by law or to protect the rights
            and safety of our users.
          </li>
        </ul>
      </Section>

      <Section title="4. Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed to
          provide the service. You may request deletion of your account and data at any time (see
          our{" "}
          <a className="text-emerald-700 hover:underline" href="/data-deletion">
            Data Deletion
          </a>{" "}
          page).
        </p>
      </Section>

      <Section title="5. Security">
        <p>
          We use industry-standard measures, including encryption in transit and access controls,
          to protect your information. No method of transmission or storage is completely secure,
          and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="6. Children's Privacy">
        <p>
          Githogoro is not directed to children under the age of 13 (or the minimum age required in
          your jurisdiction). We do not knowingly collect personal information from children.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>
          Depending on where you live, you may have the right to access, correct, or delete your
          personal information, or object to certain processing. To exercise these rights, contact
          us at{" "}
          <a className="text-emerald-700 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version on
          this page and update the &ldquo;Last updated&rdquo; date above.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a className="text-emerald-700 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </article>
  )
}
