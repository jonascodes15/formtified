import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Formtified collects, why, who it's shared with, and how to get your data deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Privacy Policy" updated="12 October 2026">
      <p>
        This policy explains what information Formtified collects, why, and what you can do about it. Formtified is run from Lagos, Nigeria. If you have
        any question about your data, email {mail}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your name, email address and password. Your password is stored only as a one-way hash, so nobody (including us) can
          read it. We also keep your plan, credits, email settings, when you signed up and when you were last active.
        </li>
        <li>
          <strong>Your forms:</strong> the forms you create, and the project descriptions and answers you give the AI when it writes a form for you.
        </li>
        <li>
          <strong>Your clients&apos; responses:</strong> whatever your clients type into your forms. This can include their name, email, phone number and
          project details.
        </li>
        <li>
          <strong>Visits:</strong> the page visited, the website that sent the visitor (its domain only), the country, device type and browser. We don&apos;t
          store IP addresses. Visitors are counted with a code that changes every day, so we can&apos;t follow anyone over time.
        </li>
        <li>
          <strong>AI usage:</strong> for each AI request, its type and size, so we can apply limits and track costs.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>We use one cookie, to keep you signed in. We don&apos;t use advertising or tracking cookies.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To run your account, store your forms and deliver your clients&apos; responses to you.</li>
        <li>To send emails you need: sign-up codes, password resets, response alerts and occasional announcements about Formtified.</li>
        <li>To write forms with AI when you ask us to.</li>
        <li>To keep Formtified secure, prevent abuse, and understand which pages are used so we can improve them.</li>
      </ul>
      <p>We don&apos;t sell your data, and we don&apos;t use your forms or your clients&apos; answers for advertising.</p>

      <h2>Who we share it with</h2>
      <p>Only the companies that help us run Formtified, and only what they need:</p>
      <ul>
        <li><strong>Vercel</strong> hosts the website.</li>
        <li><strong>Neon</strong> hosts the database.</li>
        <li><strong>Resend</strong> delivers our emails.</li>
        <li>
          <strong>Our AI provider</strong> receives the project description and answers you type when you generate a form, so it can write the questions.
          Your clients&apos; responses are not sent to the AI.
        </li>
      </ul>
      <p>We may also share information if the law requires it.</p>

      <h2>Your clients&apos; information</h2>
      <p>
        When you send a form, you decide what to ask your clients and what to do with their answers. We store and deliver those answers for you. Please
        only ask for what you need, and don&apos;t use Formtified to collect passwords, card numbers or other sensitive details.
      </p>

      <h2>Keeping and deleting data</h2>
      <p>
        We keep your data while your account is open. You can delete any form or response in your dashboard at any time; deleting a form also deletes its
        responses. To delete your whole account and everything in it, email {mail} from your account&apos;s email address.
      </p>

      <h2>Security</h2>
      <p>
        Formtified uses HTTPS everywhere, hashes passwords, confirms email addresses at sign-up and signs accounts out on every device after a password
        reset. No system is perfectly secure, but we work to keep your data safe.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Nigeria&apos;s Data Protection Act and similar laws elsewhere, you can ask to see, correct, export or delete your personal data, or object
        to how we use it. Email {mail} and we&apos;ll respond within 30 days.
      </p>

      <h2>Children</h2>
      <p>Formtified is for people running a business or freelance work. It isn&apos;t meant for anyone under 16.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we&apos;ll update the date at the top, and tell you by email or in the app if the change is significant. See also
        our <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
