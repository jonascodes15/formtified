import Link from "next/link";
import { FORM_COST, PACKS, SUMMARY_COST, naira } from "@/lib/credits";
import { UPLOAD_MAX_FILES, UPLOAD_MAX_MB } from "@/lib/files";
import { FIELD_LABELS, FIELD_TYPES } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * The help center. Each article is a page at /docs/<slug>.
 * Keep them short, task-first, and in the same words the app uses on its buttons.
 */

export const DOC_GROUPS = ["Getting started", "Building forms", "Sharing", "Responses", "Account and credits"] as const;

export interface Doc {
  slug: string;
  title: string;
  description: string;
  group: (typeof DOC_GROUPS)[number];
  body: React.ReactNode;
}

const Steps = ({ children }: { children: React.ReactNode }) => <ol className="steps">{children}</ol>;
const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="tip">
    <strong>Tip: </strong>
    {children}
  </div>
);
const Mail = () => <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export const DOCS: Doc[] = [
  {
    slug: "getting-started",
    title: "Get started with Formtified",
    description: "Create your account, make your first client form and send it, in about five minutes.",
    group: "Getting started",
    body: (
      <>
        <p>
          Formtified helps you get a complete brief from a client before you quote. You create a form, send your client one link, and their answers
          arrive in your dashboard. Your clients don&apos;t need an account.
        </p>
        <h2>1. Create your account</h2>
        <Steps>
          <li>Go to <Link href="/signup">formtified.com/signup</Link> and enter your name, email and a password of at least 8 characters.</li>
          <li>We email you a 6-digit code. Type it in to confirm your email. The code expires after 15 minutes; tap <em>Send a new code</em> if it does.</li>
          <li>You get 20 free AI credits to start.</li>
        </Steps>
        <h2>2. Create your first form</h2>
        <p>There are three ways to start:</p>
        <ul>
          <li><strong>With AI:</strong> describe the project in a sentence and the AI writes the form. See <Link href="/docs/create-a-form-with-ai">Write a form with AI</Link>.</li>
          <li><strong>From a template:</strong> pick one of {TEMPLATES.length} ready-made client questionnaires. Free. See <Link href="/docs/use-a-template">Start from a template</Link>.</li>
          <li><strong>Blank form:</strong> on the Templates page, choose <em>Blank form</em> and add your own questions.</li>
        </ul>
        <h2>3. Check it and send it</h2>
        <Steps>
          <li>Read through the questions in the editor, change anything that doesn&apos;t fit, then click <em>Save changes</em>.</li>
          <li>Click <em>Preview</em> to see the form as your client will.</li>
          <li>Copy the share link, or tap <em>WhatsApp</em> to send it straight to your client.</li>
        </Steps>
        <h2>4. Read the answers</h2>
        <p>
          When your client submits, you get a notification in the app (the bell) and an email. Open <em>Responses</em> to read everything, turn it
          into a one-page brief with AI, or export it to Excel.
        </p>
      </>
    ),
  },
  {
    slug: "create-a-form-with-ai",
    title: "Write a form with AI",
    description: "Describe a project in a sentence and get a complete client questionnaire in seconds. How to get the best result.",
    group: "Getting started",
    body: (
      <>
        <p>The AI writes a client questionnaire for one specific project. It takes about 30 seconds and uses {FORM_COST} credit.</p>
        <Steps>
          <li>Click <em>Generate</em> in the menu.</li>
          <li>Describe what your client wants, in one or two sentences.</li>
          <li>The AI asks up to 4 quick questions so the form fits the project. Tap an answer, or type your own.</li>
          <li>Click <em>Generate form</em>. When it&apos;s ready, open it in the editor to change anything.</li>
        </Steps>
        <h2>Describe the project well</h2>
        <p>The more specific you are, the better the questions. Mention:</p>
        <ul>
          <li><strong>What you&apos;re making:</strong> a website, an app, a logo, a video, an event.</li>
          <li><strong>Who it&apos;s for:</strong> the type of business and its customers.</li>
          <li><strong>Anything special:</strong> payments, bookings, a deadline, a location.</li>
        </ul>
        <p>Good examples:</p>
        <ul>
          <li>&ldquo;A client wants a website for their bakery in Lekki with online ordering and delivery.&rdquo;</li>
          <li>&ldquo;A fitness coach needs a mobile app for workout plans, progress tracking and subscriptions.&rdquo;</li>
          <li>&ldquo;A musician needs a brand identity and logo for their new album release.&rdquo;</li>
        </ul>
        <Tip>Always read the form before you send it. AI can miss things or ask something that doesn&apos;t apply. You&apos;re in control of the final form.</Tip>
        <h2>Credits and limits</h2>
        <ul>
          <li>Each AI form uses {FORM_COST} credit. If something goes wrong and no form is created, the credit is given back.</li>
          <li>To protect the service, each account can make a limited number of AI requests per hour. If you hit it, wait a little and try again.</li>
          <li>Templates, editing and collecting responses never use credits. See <Link href="/docs/credits-and-payments">Credits and payments</Link>.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "use-a-template",
    title: "Start from a template",
    description: `Use one of ${TEMPLATES.length} free client questionnaires for websites, logos, photography, events and more.`,
    group: "Getting started",
    body: (
      <>
        <p>
          Templates are ready-made client questionnaires, written for common freelance jobs. They&apos;re free: no credits needed.
        </p>
        <Steps>
          <li>Open <em>Templates</em> from the menu (or the dashboard).</li>
          <li>Filter by category, then tap a template to preview it.</li>
          <li>Click <em>Use template</em>. A copy is added to your forms and opens in the editor.</li>
        </Steps>
        <p>
          You can also browse every template, with a note on why each question matters, on the public{" "}
          <Link href="/templates">template library</Link>. The <em>Use this template</em> button there adds it to your account (you&apos;ll be asked to
          sign in first).
        </p>
        <Tip>Change the budget ranges to match your own prices before you send a template. They&apos;re in Naira by default.</Tip>
        <h2>Prefer to start from nothing?</h2>
        <p>On the Templates page, choose <em>Blank form</em>, then add your own questions.</p>
      </>
    ),
  },
  {
    slug: "edit-your-form",
    title: "Edit questions and question types",
    description: "Add, reorder and remove questions, choose question types, mark questions as required and preview the form.",
    group: "Building forms",
    body: (
      <>
        <p>Every form opens in the editor, whether it came from AI, a template or a blank page.</p>
        <h2>Change a question</h2>
        <ul>
          <li>Click the question text to change it. Add an optional hint underneath to help your client answer.</li>
          <li>Pick a different question type from the dropdown next to it.</li>
          <li>Tick <em>Required</em> if your client must answer it before submitting.</li>
          <li>Use the arrows to move a question up or down, the copy icon to duplicate it, and the bin to delete it.</li>
        </ul>
        <h2>Question types</h2>
        <ul>
          {FIELD_TYPES.map((t) => (
            <li key={t}>
              <strong>{FIELD_LABELS[t]}</strong>
              {
                {
                  section: ": a heading that splits the form into parts. It isn't a question.",
                  short_text: ": one line, like a name or business name.",
                  long_text: ": a big box for describing features, goals or examples.",
                  email: ": checks that the answer is a real email address.",
                  phone: ": opens the number keypad on phones.",
                  url: ": a link to a website or social page.",
                  number: ": numbers only, like a guest count.",
                  date: ": a date picker, for deadlines and event dates.",
                  single_choice: ": your client picks one option.",
                  multi_choice: ": your client ticks as many options as apply.",
                  dropdown: ": one option from a list, good for long lists.",
                  file: ": your client attaches files. See Let clients upload files.",
                }[t]
              }
            </li>
          ))}
        </ul>
        <h2>Add a question</h2>
        <p>Scroll to the bottom of the form, click <em>Add question</em> and choose a type.</p>
        <h2>Save and preview</h2>
        <p>
          Changes aren&apos;t live until you click <em>Save changes</em> (on phones, a <em>Save</em> bar appears at the bottom). Click <em>Preview</em> at
          the top to see exactly what your client will see.
        </p>
        <Tip>You can edit a form after sharing it. The link stays the same, and new clients see the updated form.</Tip>
      </>
    ),
  },
  {
    slug: "file-uploads",
    title: "Let clients upload files",
    description: `Add a File upload question so clients can send logos, photos, documents and voice notes: up to ${UPLOAD_MAX_FILES} files, ${UPLOAD_MAX_MB} MB each.`,
    group: "Building forms",
    body: (
      <>
        <p>
          A <em>File upload</em> question lets your client attach files with their answers: their logo, photos of a space, reference images, a
          document or a voice note. No more &ldquo;send it on WhatsApp later&rdquo;.
        </p>
        <Steps>
          <li>In the editor, click <em>Add question</em> and choose <em>File upload</em>.</li>
          <li>Write what you want, for example &ldquo;Upload your current logo&rdquo;.</li>
          <li>Tick <em>Required</em> only if you can&apos;t start without the files.</li>
          <li>Click <em>Save changes</em>.</li>
        </Steps>
        <h2>What clients can upload</h2>
        <ul>
          <li>Up to {UPLOAD_MAX_FILES} files per question, up to {UPLOAD_MAX_MB} MB each.</li>
          <li>Images (JPG, PNG, WebP, GIF, HEIC, SVG), PDFs, Word, Excel and PowerPoint files, text and CSV files, ZIP files, Photoshop and Illustrator files, audio (MP3, M4A, WAV, OGG) and short videos (MP4, MOV).</li>
        </ul>
        <p>Several templates, like the logo, website, interior design, clothing and cake templates, already include a file question.</p>
        <h2>Where the files go</h2>
        <p>
          Files are stored privately. Only you can open them, from the response in <em>Responses</em>: photos show as thumbnails, and every file has a
          download button. The CSV export lists each file with a link that opens it (you need to be signed in).
        </p>
        <p>
          If a client uploads a file but never submits the form, the file is deleted automatically after a day. When you delete a response or a
          form, its files are deleted too.
        </p>
      </>
    ),
  },
  {
    slug: "share-your-form",
    title: "Share your form on WhatsApp, email or anywhere",
    description: "Send one link, see the link preview, close a form when you're done, and reuse forms for new clients.",
    group: "Sharing",
    body: (
      <>
        <p>Every form has its own link, like <code>formtified.com/f/abc123</code>. Anyone with the link can fill the form; they don&apos;t need an account.</p>
        <h2>Send it</h2>
        <ul>
          <li><strong>WhatsApp:</strong> in the editor, tap <em>WhatsApp</em>. It opens WhatsApp with a short message and the link, ready to send.</li>
          <li><strong>Anywhere else:</strong> click the copy button next to the link and paste it into an email, DM or text.</li>
          <li><strong>From your forms list:</strong> open the ⋯ menu on a form and choose <em>Copy share link</em>.</li>
        </ul>
        <p>
          When you paste the link into WhatsApp, X, LinkedIn or Slack, it shows a preview card with the form&apos;s title and your name, so your client
          knows it&apos;s from you.
        </p>
        <h2>Stop accepting responses</h2>
        <p>
          In the editor, switch off <em>Accepting responses</em>. Anyone who opens the link sees that the form is closed. Switch it back on at any
          time.
        </p>
        <h2>Use a form for another client</h2>
        <p>
          You can send the same link to as many clients as you like; each submission arrives as its own response. To change the form for one client
          without touching the original, open the ⋯ menu on the form and choose <em>Duplicate</em>.
        </p>
        <Tip>Forms work well on phones. Most clients fill them on their phone straight from WhatsApp.</Tip>
      </>
    ),
  },
  {
    slug: "read-and-export-responses",
    title: "Read, search and export responses",
    description: "Get alerts when clients submit, read and search their answers, reply by email and export everything to Excel or Google Sheets.",
    group: "Responses",
    body: (
      <>
        <h2>Get notified</h2>
        <p>
          When a client submits, you see a dot on the bell at the top of the app and get an email. You can turn the emails off in{" "}
          <em>Account → Notifications</em>; in-app notifications stay on.
        </p>
        <h2>Read responses</h2>
        <Steps>
          <li>Open <em>Responses</em>. New responses have a green dot.</li>
          <li>Pick a form from the dropdown to see only its responses, or search names, emails and answers.</li>
          <li>Click a response to read every answer and open any attached files.</li>
        </Steps>
        <p>
          To reply, click the envelope icon; it opens an email to the client with the form&apos;s name in the subject. To turn a response into a short
          brief, see <Link href="/docs/ai-brief-summary">Summarise a response into a brief</Link>.
        </p>
        <h2>Export to Excel or Google Sheets</h2>
        <p>
          Pick a form in the dropdown, then click <em>Export CSV</em>. The file opens in Excel, Google Sheets or Numbers, with one row per response and
          one column per question.
        </p>
        <h2>Delete a response</h2>
        <p>Open it and click the bin icon. This deletes the answers and any attached files, and can&apos;t be undone.</p>
      </>
    ),
  },
  {
    slug: "ai-brief-summary",
    title: "Summarise a response into a brief",
    description: "Turn a long client response into a one-page project brief with goals, scope, budget, timeline, risks and follow-up questions, then save it as a PDF.",
    group: "Responses",
    body: (
      <>
        <p>
          Long responses take time to read and are easy to misread. The AI brief turns one response into a single page you can quote from. It uses{" "}
          {SUMMARY_COST} credit; opening it again later is free.
        </p>
        <Steps>
          <li>Open a response in <em>Responses</em>.</li>
          <li>Click <em>Summarise with AI</em>. The brief appears in a few seconds and is saved with the response.</li>
        </Steps>
        <h2>What&apos;s in the brief</h2>
        <ul>
          <li><strong>Overview:</strong> who the client is and what they want, in two or three sentences.</li>
          <li><strong>Budget and timeline:</strong> exactly as the client wrote them.</li>
          <li><strong>Goals, scope and notes:</strong> what success looks like, every deliverable or feature, and preferences like style or examples.</li>
          <li><strong>Watch out for:</strong> possible problems, like a big scope with a short deadline.</li>
          <li><strong>Ask before you quote:</strong> questions to send the client because an answer is missing or unclear.</li>
        </ul>
        <h2>Send the follow-up questions</h2>
        <p>
          Under <em>Ask before you quote</em>, click <em>Copy questions</em> to copy a ready-to-send message, or <em>Send on WhatsApp</em> to open it in
          WhatsApp.
        </p>
        <h2>Download it as a PDF</h2>
        <p>
          Click <em>Download PDF</em>. A clean page opens with the brief and every answer. In the print window, choose <em>Save as PDF</em> as the
          printer. On a phone, use your browser&apos;s Share or Print option.
        </p>
        <Tip>The brief is written by AI from your client&apos;s answers. It doesn&apos;t invent prices or dates, but always check it against the full response before you rely on it.</Tip>
        <p>Click <em>Redo</em> to write a fresh brief (it uses another credit).</p>
      </>
    ),
  },
  {
    slug: "credits-and-payments",
    title: "Credits and payments",
    description: "What uses credits, how to buy a credit pack with Paystack, and what to do if a payment goes wrong.",
    group: "Account and credits",
    body: (
      <>
        <h2>What uses credits</h2>
        <ul>
          <li>An AI-written form: {FORM_COST} credit.</li>
          <li>An AI brief of a response: {SUMMARY_COST} credit.</li>
        </ul>
        <p>
          Everything else is free: templates, blank forms, editing, sharing, file uploads, unlimited responses, alerts and CSV export. New accounts get
          20 free credits. Credits never expire.
        </p>
        <h2>Buy more credits</h2>
        <Steps>
          <li>Open <em>Credits</em> from the menu.</li>
          <li>
            Choose a pack:{" "}
            {PACKS.map((p, i) => (
              <span key={p.id}>
                {i > 0 && (i === PACKS.length - 1 ? " or " : ", ")}
                {p.name} ({p.credits} credits, {naira(p.naira)})
              </span>
            ))}
            .
          </li>
          <li>You&apos;re taken to Paystack&apos;s secure checkout. Pay by card, bank transfer or USSD.</li>
          <li>You come back to Formtified and the credits are added straight away. You also get a receipt by email.</li>
        </Steps>
        <p>Formtified never sees or stores your card details; Paystack handles the payment.</p>
        <h2>If something goes wrong</h2>
        <ul>
          <li>
            <strong>You paid but closed the page:</strong> your credits are still added once Paystack confirms the payment, usually within a minute.
          </li>
          <li><strong>Your payment is &ldquo;still processing&rdquo;:</strong> bank transfers can take a few minutes. Refresh the Credits page.</li>
          <li>
            <strong>You were charged but got no credits, or were charged twice:</strong> email <Mail /> with the payment reference from your receipt or
            bank alert, and we&apos;ll fix it.
          </li>
        </ul>
        <p>Your successful payments are listed under <em>Payment history</em> on the Credits page.</p>
      </>
    ),
  },
  {
    slug: "account-and-security",
    title: "Account, password and security",
    description: "Sign-in codes, resetting a forgotten password, changing your details, email settings and deleting your data.",
    group: "Account and credits",
    body: (
      <>
        <h2>Confirming your email</h2>
        <p>
          When you sign up, we email you a 6-digit code to confirm the address is yours. It expires after 15 minutes. If it doesn&apos;t arrive, check
          your spam folder, then use <em>Send a new code</em> (you can ask for a new one every 45 seconds).
        </p>
        <h2>Forgot your password</h2>
        <Steps>
          <li>On the sign-in page, click <em>Forgot password?</em> and enter your email.</li>
          <li>Open the link we email you. It works once and expires after 1 hour.</li>
          <li>Choose a new password. For your safety, you&apos;re signed out on every other device.</li>
        </Steps>
        <h2>Change your details</h2>
        <p>
          In <em>Account</em> you can change your name (clients see it on your forms), update your password, and turn response emails on or off. To
          change the email address on your account, email <Mail />.
        </p>
        <h2>Keeping your account safe</h2>
        <ul>
          <li>Use a password you don&apos;t use anywhere else, at least 8 characters long.</li>
          <li>We will never ask for your password by email or WhatsApp.</li>
          <li>If you think someone else has used your account, reset your password straight away and email <Mail />.</li>
        </ul>
        <h2>Delete your data</h2>
        <p>
          You can delete any form or response yourself; deleting a form deletes its responses and files. To delete your whole account, email{" "}
          <Mail /> from your account&apos;s email address. See our <Link href="/privacy">Privacy Policy</Link> for more.
        </p>
      </>
    ),
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug) ?? null;
