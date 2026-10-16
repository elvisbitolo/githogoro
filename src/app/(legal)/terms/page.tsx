import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules and conditions for using the Githogoro community platform.",
  alternates: { canonical: "https://githogoro.vercel.app/terms" },
}

const CONTACT_EMAIL = "elvisbitolo11@gmail.com"
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

export default function TermsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Welcome to Githogoro. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of the Githogoro community platform at https://githogoro.vercel.app. By creating an
        account or using the service, you agree to these Terms.
      </p>

      <Section title="1. Eligibility and Accounts">
        <p>
          You must be at least 13 years old (or the minimum age required in your jurisdiction) to
          use Githogoro. You are responsible for maintaining the confidentiality of your account
          credentials and for all activity that occurs under your account.
        </p>
      </Section>

      <Section title="2. Acceptable Use">
        <p>You agree not to use Githogoro to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Post unlawful, harmful, threatening, abusive, or hateful content.</li>
          <li>Harass, impersonate, or harm other members.</li>
          <li>Post spam, scams, or misleading information.</li>
          <li>Violate any applicable law or the rights of others.</li>
          <li>Attempt to gain unauthorised access to the platform or other users&apos; accounts.</li>
        </ul>
      </Section>

      <Section title="3. Your Content">
        <p>
          You retain ownership of the content you post. By posting content, you grant Githogoro a
          non-exclusive, worldwide, royalty-free licence to host, display, and distribute that
          content as part of operating the service. You are solely responsible for the content you
          post and must have the right to share it.
        </p>
      </Section>

      <Section title="4. Third-Party Sign-In">
        <p>
          You may sign in using Google or Facebook. Your use of those services is governed by their
          own terms and privacy policies. You are responsible for any activity that occurs through
          your linked social account.
        </p>
      </Section>

      <Section title="5. Community Safety">
        <p>
          Githogoro is a community platform. We may remove content or suspend accounts that violate
          these Terms or that we reasonably believe pose a risk to the community. Emergency
          services should always be contacted directly in an emergency.
        </p>
      </Section>

      <Section title="6. Disclaimers">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
          warranties of any kind. We do not guarantee that the service will be uninterrupted,
          error-free, or that any information posted by members is accurate.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Githogoro and its operators will not be liable for
          any indirect, incidental, or consequential damages arising from your use of the service.
        </p>
      </Section>

      <Section title="8. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the service after changes
          take effect constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a className="text-emerald-700 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </article>
  )
}
