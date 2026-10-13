import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Formtified: your account, your content, AI-written forms, credits and acceptable use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Terms of Service" updated="12 October 2026">
      <p>
        These terms are the agreement between you and Formtified when you use the website and app. By creating an account or using Formtified, you agree to
        them. If you don&apos;t agree, please don&apos;t use Formtified.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details and use an email address you can receive mail at.</li>
        <li>Keep your password private. You&apos;re responsible for what happens in your account.</li>
        <li>Tell us straight away at {mail} if you think someone else has accessed it.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Your forms and the responses your clients send belong to you. You give Formtified permission to store, display and process them only as needed to
        run the service for you, for example to show a form to your clients and deliver their answers to you.
      </p>
      <p>You are responsible for what your forms ask and for how you use your clients&apos; answers, including following the privacy laws that apply to you.</p>

      <h2>Acceptable use</h2>
      <p>Don&apos;t use Formtified to:</p>
      <ul>
        <li>collect passwords, bank or card details, or pretend to be another person or company (phishing);</li>
        <li>send spam, or share forms with people who haven&apos;t agreed to hear from you;</li>
        <li>collect information illegally, or harass, threaten or deceive anyone;</li>
        <li>break, overload or get around the limits and security of the service.</li>
      </ul>
      <p>We may remove forms or suspend accounts that break these rules, without notice where needed to protect others.</p>

      <h2>AI-written forms</h2>
      <p>
        Forms written by AI are a starting point. They can contain mistakes or miss things, so review and edit every form before you send it. You&apos;re
        responsible for the final form.
      </p>

      <h2>Credits and plans</h2>
      <p>
        One AI credit creates one AI-written form. Free credits have no cash value and can&apos;t be transferred. If we sell credit packs or plans, the
        price and what&apos;s included will be shown before you pay. We may change what&apos;s free, with notice for anything you&apos;ve already paid for.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep Formtified running and your data safe, but the service is provided &ldquo;as is&rdquo;. It may sometimes be unavailable, and we
        can&apos;t promise it will be free of errors. Keep your own copy of anything important; you can export responses to a spreadsheet at any time.
      </p>

      <h2>Liability</h2>
      <p>
        As far as the law allows, Formtified is not liable for indirect losses, such as lost profits or lost clients, from using or not being able to use the
        service. Our total liability to you is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using Formtified at any time and ask us to delete your account at {mail}. We may close accounts that break these terms.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms. We&apos;ll change the date at the top and tell you about significant changes. These terms are governed by the laws of
        Nigeria. Our <Link href="/privacy">Privacy Policy</Link> explains how we handle personal data.
      </p>
    </LegalPage>
  );
}
