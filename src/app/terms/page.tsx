import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/LegalPage";
import { COMPANY, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Formtified: your account, your content, AI-written forms, credits and acceptable use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Terms of Service" updated="16 October 2026">
      <p>
        Formtified is built and run by <strong>{COMPANY.name}</strong> ({COMPANY.rc}), a company registered in Nigeria and based in {COMPANY.location}.
        In these terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean {COMPANY.name}.
      </p>
      <p>
        These terms are the agreement between you and {COMPANY.name} when you use the Formtified website and app. By creating an account or using
        Formtified, you agree to them. If you don&apos;t agree, please don&apos;t use Formtified.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details and use an email address you can receive mail at.</li>
        <li>Keep your password private. You&apos;re responsible for what happens in your account.</li>
        <li>Tell us straight away at {mail} if you think someone else has accessed it.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Your forms and the responses your clients send belong to you. You give us permission to store, display and process them only as needed to
        run the service for you, for example to show a form to your clients and deliver their answers to you.
      </p>
      <p>You are responsible for what your forms ask and for how you use your clients&apos; answers, including following the privacy laws that apply to you.</p>

      <h2>Acceptable use</h2>
      <p>Don&apos;t use Formtified to:</p>
      <ul>
        <li>collect passwords, bank or card details, or pretend to be another person or company (phishing);</li>
        <li>collect or share malware, illegal content, or files you have no right to receive;</li>
        <li>send spam, or share forms with people who haven&apos;t agreed to hear from you;</li>
        <li>collect information illegally, or harass, threaten or deceive anyone;</li>
        <li>break, overload or get around the limits and security of the service.</li>
      </ul>
      <p>We may remove forms or suspend accounts that break these rules, without notice where needed to protect others.</p>

      <h2>AI-written forms and briefs</h2>
      <p>
        Forms and response briefs written by AI are a starting point. They can contain mistakes or miss things, so review every form before you send it
        and check every brief against your client&apos;s full answers. You&apos;re responsible for the final form and for any quote or decision you make.
      </p>

      <h2>Files</h2>
      <p>
        Files your clients upload are stored privately for you. Don&apos;t ask clients to upload anything illegal or anything you don&apos;t have a right to
        receive. We may remove files that break these terms.
      </p>

      <h2>Credits and payments</h2>
      <p>
        AI credits are used for AI-written forms and AI briefs; the Credits page shows how many each one uses. Credit packs are paid in Naira through
        Paystack, and the price and number of credits are shown before you pay. Credits never expire, have no cash value and can&apos;t be transferred to
        another account.
      </p>
      <p>
        If you were charged but didn&apos;t receive your credits, or were charged twice, email {mail} with the payment reference and we&apos;ll add the
        credits or refund the payment. Otherwise, payments for credits are not refundable, except where the law requires a refund. We may change prices
        and what&apos;s free, but credits you&apos;ve already bought keep working.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep Formtified running and your data safe, but the service is provided &ldquo;as is&rdquo;. It may sometimes be unavailable, and we
        can&apos;t promise it will be free of errors. Keep your own copy of anything important; you can export responses to a spreadsheet at any time.
      </p>

      <h2>Liability</h2>
      <p>
        As far as the law allows, {COMPANY.name} is not liable for indirect losses, such as lost profits or lost clients, from using or not being able to use the
        service. Our total liability to you is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using Formtified at any time and ask us to delete your account at {mail}. We may close accounts that break these terms.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms. We&apos;ll change the date at the top and tell you about significant changes. These terms are governed by the laws of
        the Federal Republic of Nigeria, and the courts of Lagos State will deal with any dispute we can&apos;t settle together. Our{" "}
        <Link href="/privacy">Privacy Policy</Link> explains how we handle personal data.
      </p>

      <h2>Contact</h2>
      <p>
        {COMPANY.name}, {COMPANY.location}. Email {mail}.
      </p>
    </LegalPage>
  );
}
