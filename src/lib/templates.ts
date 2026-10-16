import { TEMPLATE_CATEGORIES as CATEGORIES, type FormField, type FieldType, type TemplateCategory as Category } from "./types";

/**
 * The template library. Each template is both a ready-made form in the app
 * and a public page at /templates/<key>, written to be found on Google.
 * `why` is shown on the public page only; it is removed when a form is created.
 */

export interface TemplateField extends FormField {
  why?: string;
}

export { CATEGORIES };

export interface Template {
  key: string; // also the public page's address: /templates/<key>
  name: string; // short name for cards
  category: Category;
  summary: string; // one line for cards
  title: string; // the form title clients see
  description: string; // the form intro clients see
  seoTitle: string; // page heading and browser title
  metaDescription: string; // Google's snippet
  intro: string; // the public page's opening paragraph
  fields: TemplateField[];
}

let n = 0;
const f = (type: FieldType, label: string, extra: Partial<TemplateField> = {}): TemplateField => ({
  id: `t${++n}`,
  type,
  label,
  ...(type === "section" ? {} : { required: false }),
  ...extra,
});
const req = { required: true };

const contact = ({ business = true } = {}): TemplateField[] => [
  f("section", "About you", { help: "So we know who we are working with." }),
  f("short_text", "Full name", { ...req, why: "So you know who you're dealing with and can address them properly in your proposal." }),
  f("email", "Email address", { ...req, why: "Where you'll send the quote, contract and updates." }),
  f("phone", "Phone / WhatsApp number", { why: "Most clients reply faster on WhatsApp than email, especially for quick approvals." }),
  ...(business ? [f("short_text", "Business or brand name", { why: "Lets you look up their current website and social pages before your first call." })] : []),
];

const BUDGET_WHY = "Ranges are easier for clients to answer than an exact number, and they tell you straight away which package to quote.";
const ANYTHING_ELSE_WHY = "Catches deal-breakers early: tight deadlines, bad past experiences, or other people who need to approve the work.";

const budgetTimeline = (
  budgets: string[],
  { budgetLabel = "What budget range are you working with?", dateLabel = "When do you need this completed?", date = true } = {},
): TemplateField[] => [
  f("section", "Budget and timeline"),
  f("single_choice", budgetLabel, { ...req, options: budgets, why: BUDGET_WHY }),
  ...(date
    ? [f("date", dateLabel, { help: "Pick your ideal launch or delivery date.", why: "A target date tells you whether the project fits your schedule before you spend time on a proposal." })]
    : []),
  f("long_text", "Anything else we should know?", { placeholder: "Deadlines, concerns, past experiences with other providers...", why: ANYTHING_ELSE_WHY }),
];

const anythingElse = () =>
  f("long_text", "Anything else we should know?", { placeholder: "Deadlines, concerns, special requests...", why: ANYTHING_ELSE_WHY });

export const TEMPLATES: Template[] = [
  // ---------- Web & apps ----------
  {
    key: "website-design-client-questionnaire",
    name: "Website project",
    category: "Web & apps",
    summary: "Business or portfolio websites: pages, features, content and hosting.",
    title: "Website Project Onboarding",
    description: "Tell us everything about the website you want. The more detail, the better the result.",
    seoTitle: "Website Design Client Questionnaire",
    metaDescription:
      "Free website design client questionnaire covering goals, pages, features, content, domain, budget and timeline. Send it as one link and get a complete brief.",
    intro:
      "Before you quote a website, you need to know what the business does, what the site must achieve, which pages and features it needs, and whether the content is ready. This questionnaire covers all of it, so your first call starts with answers instead of questions.",
    fields: [
      ...contact(),
      f("section", "Your website"),
      f("url", "Current website (if any)", { why: "Shows you what exists today: what to keep, what to fix and what to move over." }),
      f("long_text", "What does your business do, and who are your customers?", { ...req, why: "The site is for their customers, not for them. This shapes the structure, wording and design." }),
      f("single_choice", "What is the main goal of the website?", { ...req, options: ["Get leads/enquiries", "Sell products", "Showcase work", "Share information", "Bookings"], why: "One main goal decides the homepage layout and what the main button says." }),
      f("multi_choice", "Which pages do you need?", { options: ["Home", "About", "Services", "Portfolio", "Blog", "Contact", "FAQ", "Pricing"], why: "The number of pages is one of the biggest drivers of price and time." }),
      f("long_text", "List every feature you want on the website", { ...req, help: "For example: contact form, booking, live chat, payments, newsletter signup.", placeholder: "1. ...\n2. ...\n3. ...", why: "Features like bookings, payments or logins change the scope far more than design does. Getting them in writing prevents \"I thought that was included\" later." }),
      f("section", "Content and design"),
      f("single_choice", "Do you have your content (text, images) ready?", { options: ["Yes, all of it", "Some of it", "No, I need help"], why: "Missing content is the most common reason website projects stall. Knowing early lets you quote for writing or set a content deadline." }),
      f("single_choice", "Do you have a logo and brand colours?", { options: ["Yes", "Logo only", "No"], why: "Tells you whether branding work needs to come first." }),
      f("file", "Upload your logo and any photos you want on the site", { help: "Optional. You can also send them later.", why: "Getting the files with the brief lets you check their quality before you quote, instead of chasing them mid-project." }),
      f("long_text", "Share 2-3 websites you like and what you like about them", { why: "Examples say more than words like \"clean\" or \"modern\", and show the level of polish they expect." }),
      f("single_choice", "Do you already have a domain and hosting?", { options: ["Both", "Domain only", "Neither", "Not sure"], why: "Avoids launch-day surprises and tells you whether to include setup in the quote." }),
      ...budgetTimeline(["Under ₦300k", "₦300k - ₦800k", "₦800k - ₦2m", "Above ₦2m"]),
    ],
  },
  {
    key: "website-redesign-questionnaire",
    name: "Website redesign",
    category: "Web & apps",
    summary: "Redesigns: what's broken, what to keep, SEO and new features.",
    title: "Website Redesign Brief",
    description: "Tell us about your current website and what you want the new one to do better.",
    seoTitle: "Website Redesign Questionnaire",
    metaDescription:
      "Free website redesign questionnaire: find out what isn't working, what to keep, who updates the site, SEO traffic to protect and new features, before you quote.",
    intro:
      "A redesign is different from a new build: there's an existing site, existing traffic and usually a list of frustrations. These questions find out what isn't working, what must be kept, and what success looks like after launch.",
    fields: [
      ...contact(),
      f("section", "Your current website"),
      f("url", "Current website address", { ...req, why: "You can review the site before your call and point to real problems." }),
      f("long_text", "What's not working on your current website?", { ...req, why: "The reasons for the redesign become your list of priorities." }),
      f("long_text", "What do you want to keep?", { help: "Pages, content, features or design elements that work well.", why: "Protects what already works, like pages that bring in enquiries." }),
      f("multi_choice", "What do you want to improve?", { options: ["Look and feel", "Speed", "Mobile experience", "Getting more enquiries/sales", "Easier to update", "Search ranking (SEO)"], why: "Shows whether this is a visual refresh or a deeper rebuild." }),
      f("single_choice", "Who updates the website today?", { options: ["Me", "Someone on my team", "A developer/agency", "Nobody, it's out of date"], why: "Tells you whether they need an easy editor and training as part of the handover." }),
      f("single_choice", "Does the website get visitors from Google today?", { options: ["Yes, a lot", "Some", "Very little", "Not sure"], why: "If it does, you'll need to keep page addresses or set up redirects so rankings aren't lost." }),
      f("section", "The new website"),
      f("long_text", "List any new pages or features you need", { why: "New features are where redesign budgets grow, so it's best to know them now." }),
      f("long_text", "Share 2-3 websites you like and what you like about them", { why: "Shows the direction they have in mind and the quality they expect." }),
      f("single_choice", "Is your logo or branding changing too?", { options: ["No, keep it", "Small refresh", "Yes, completely new"], why: "A brand change affects every page, so it has to be planned first." }),
      ...budgetTimeline(["Under ₦300k", "₦300k - ₦800k", "₦800k - ₦2m", "Above ₦2m"]),
    ],
  },
  {
    key: "landing-page-design-brief",
    name: "Landing page",
    category: "Web & apps",
    summary: "One-page campaigns: the offer, the action, the audience and traffic.",
    title: "Landing Page Brief",
    description: "Tell us about the offer and who the page is for, so we can design a page that converts.",
    seoTitle: "Landing Page Design Brief",
    metaDescription:
      "Free landing page design brief template: capture the offer, the one action visitors should take, the audience, traffic sources and content before you design.",
    intro:
      "A landing page has one job: get visitors to take one action. This brief pins down that action, the offer, the audience and where visitors come from, which is what you need to design a page that converts.",
    fields: [
      ...contact(),
      f("section", "The campaign"),
      f("long_text", "What are you promoting?", { ...req, help: "A product, service, event, course or offer.", why: "The offer is the centre of the page; everything else supports it." }),
      f("single_choice", "What should visitors do on the page?", { ...req, options: ["Buy", "Sign up / join a waitlist", "Book a call", "Download something", "Register for an event", "Send a WhatsApp message"], why: "A landing page should have one main action. This decides the button, the form and how success is measured." }),
      f("long_text", "Who is the page for?", { ...req, why: "Wording that speaks to one kind of person converts better than wording for everyone." }),
      f("multi_choice", "Where will visitors come from?", { options: ["Instagram/Facebook ads", "Google ads", "TikTok", "Email list", "WhatsApp", "Influencers"], why: "Visitors from ads need the page to match the ad they clicked; email subscribers already know the brand." }),
      f("section", "Content"),
      f("long_text", "What makes your offer better than the alternatives?", { why: "These points become the headline and the main selling points." }),
      f("multi_choice", "What do you already have?", { options: ["Written copy", "Product photos", "Testimonials/reviews", "Logo and brand colours", "Video"], why: "Shows what you need to create and what you can use straight away." }),
      f("url", "Link to a landing page you like", { why: "A quick way to agree on style and length." }),
      f("multi_choice", "Does the page need any of these?", { options: ["Payments", "Countdown timer", "Signup form linked to an email tool", "WhatsApp button", "Ad tracking pixels"], why: "Connecting other tools takes time, so it belongs in the quote." }),
      ...budgetTimeline(["Under ₦100k", "₦100k - ₦250k", "₦250k - ₦500k", "Above ₦500k"]),
    ],
  },
  {
    key: "ecommerce-website-questionnaire",
    name: "E-commerce store",
    category: "Web & apps",
    summary: "Online stores: products, payments, delivery and store management.",
    title: "Online Store Onboarding",
    description: "Tell us about your products and how you want to sell online.",
    seoTitle: "E-commerce Website Questionnaire",
    metaDescription:
      "Free e-commerce website questionnaire covering products, variants, payment methods, delivery, store features, budget and timeline for online store projects.",
    intro:
      "Online stores have more moving parts than other websites: products, variants, payments, delivery and stock. This questionnaire gets those details up front, so your quote covers the real work.",
    fields: [
      ...contact(),
      f("section", "Your products"),
      f("long_text", "What do you sell?", { ...req, why: "The product type affects the store layout, the photos needed and which features matter." }),
      f("single_choice", "How many products will you list at launch?", { ...req, options: ["1-20", "21-100", "101-500", "500+"], why: "Product count decides how much setup there is and whether you need bulk import." }),
      f("single_choice", "Do products have variants (size, colour)?", { options: ["Yes", "No", "Some"], why: "Sizes and colours change how products, stock and photos are set up." }),
      f("section", "Selling and delivery"),
      f("multi_choice", "Which payment options do you need?", { ...req, options: ["Card (Paystack/Flutterwave)", "Bank transfer", "Pay on delivery", "USSD"], why: "Each payment method needs its own setup and testing, and some need a registered business." }),
      f("long_text", "How do you handle delivery?", { help: "Locations you deliver to, delivery partners, pickup options.", why: "Delivery rules (zones, fees, pickup) are often the most complicated part of checkout." }),
      f("long_text", "List every feature you need in the store", { ...req, placeholder: "Discount codes, reviews, wishlist, order tracking...", why: "Discount codes, reviews and order tracking each add time. Listing them now prevents scope creep." }),
      f("url", "Link to your Instagram or current store", { why: "Shows the products, photos and brand the store needs to match." }),
      ...budgetTimeline(["Under ₦500k", "₦500k - ₦1.5m", "₦1.5m - ₦4m", "Above ₦4m"]),
    ],
  },
  {
    key: "mobile-app-development-questionnaire",
    name: "Mobile app",
    category: "Web & apps",
    summary: "iOS/Android apps: users, screens, features, integrations.",
    title: "Mobile App Project Onboarding",
    description: "Walk us through the app you want to build, feature by feature.",
    seoTitle: "Mobile App Development Questionnaire",
    metaDescription:
      "Free mobile app development questionnaire: capture the idea, users, platforms, screen-by-screen features, designs, budget and timeline before you estimate.",
    intro:
      "App ideas usually arrive as one exciting sentence. This questionnaire turns that sentence into users, platforms and a screen-by-screen feature list you can actually estimate.",
    fields: [
      ...contact(),
      f("section", "The idea"),
      f("long_text", "Describe your app idea in a few sentences", { ...req, why: "Gets the core idea in their own words before the details take over." }),
      f("long_text", "Who will use the app?", { ...req, help: "Describe your users and the problem the app solves for them.", why: "Different users (customers, drivers, admins) often mean separate apps or dashboards." }),
      f("multi_choice", "Which platforms?", { ...req, options: ["Android", "iOS", "Web app", "Admin dashboard"], why: "Android, iOS, web and an admin dashboard can each add a lot of build time." }),
      f("section", "Features"),
      f("long_text", "Walk us through every feature, screen by screen", { ...req, placeholder: "Sign up → Home → ...", why: "A screen-by-screen description is the closest thing to a specification most clients can write, and it makes your estimate far more accurate." }),
      f("multi_choice", "Which of these does the app need?", { options: ["User accounts", "Payments", "Push notifications", "Chat/messaging", "Maps/location", "File uploads", "Admin panel"], why: "Payments, chat and maps are big features that move the price; a checklist makes sure none are forgotten." }),
      f("long_text", "Any apps similar to yours? What would you do differently?", { why: "Similar apps give you a reference for features, and for what they don't want." }),
      f("single_choice", "Do you have designs (UI/UX) already?", { options: ["Yes, complete", "Rough sketches", "No, I need design too"], why: "Tells you whether design needs to be quoted before development." }),
      ...budgetTimeline(["Under ₦1m", "₦1m - ₦3m", "₦3m - ₦7m", "Above ₦7m"]),
    ],
  },
  {
    key: "software-requirements-questionnaire",
    name: "Web app / SaaS",
    category: "Web & apps",
    summary: "Custom software: users, workflows, integrations and data.",
    title: "Software Project Requirements",
    description: "Help us understand the problem, the people who'll use the software and what it needs to do.",
    seoTitle: "Software Requirements Questionnaire",
    metaDescription:
      "Free software requirements questionnaire for web apps and SaaS: gather users, roles, workflows, integrations, data migration and scale before you estimate.",
    intro:
      "Custom software projects go wrong when requirements are vague. Use this questionnaire to gather the users, workflows, data, integrations and rules a web app or SaaS product needs before you estimate it.",
    fields: [
      ...contact(),
      f("section", "The problem"),
      f("long_text", "What problem should this software solve?", { ...req, why: "Starting with the problem, not the features, lets you suggest a simpler solution where one exists." }),
      f("long_text", "How is this done today?", { help: "Spreadsheets, paper, WhatsApp, another tool...", why: "The current process shows the real workflow, and the data you may need to import." }),
      f("long_text", "Who will use it, and what can each type of user do?", { ...req, help: "For example: customers place orders, staff process them, managers see reports.", why: "User roles and permissions are a big part of the build and easy to underestimate." }),
      f("section", "Requirements"),
      f("long_text", "List the main features or workflows", { ...req, placeholder: "1. ...\n2. ...\n3. ...", why: "This becomes the first draft of your scope of work." }),
      f("multi_choice", "Which of these are needed?", { options: ["User accounts and roles", "Payments or subscriptions", "Reports and dashboards", "Email/SMS notifications", "File uploads", "Mobile app", "Admin panel"], why: "A checklist catches the big-ticket items clients forget to mention." }),
      f("long_text", "Does it need to connect to other tools?", { help: "Payment providers, accounting software, CRMs, existing databases...", why: "Integrations depend on other companies' systems and are often the riskiest part of a project." }),
      f("single_choice", "Roughly how many people will use it in the first year?", { options: ["Under 100", "100 - 1,000", "1,000 - 10,000", "Over 10,000"], why: "Expected usage affects hosting, performance work and running costs." }),
      f("single_choice", "Is there existing data to move over?", { options: ["No", "Yes, in spreadsheets", "Yes, in another system", "Not sure"], why: "Moving data is real work and should be quoted on its own." }),
      ...budgetTimeline(["Under ₦1.5m", "₦1.5m - ₦4m", "₦4m - ₦10m", "Above ₦10m"]),
    ],
  },

  // ---------- Design ----------
  {
    key: "logo-design-questionnaire",
    name: "Logo design",
    category: "Design",
    summary: "Logos: name, style, references, where it's used and files needed.",
    title: "Logo Design Brief",
    description: "Tell us about your business and the kind of logo you have in mind.",
    seoTitle: "Logo Design Questionnaire",
    metaDescription:
      "Free logo design questionnaire: get the exact name, audience, logo style, colours, references, where it will be used and the files needed before you sketch.",
    intro:
      "A good logo brief saves rounds of revisions. These questions capture the business, the audience, the style the client likes and where the logo will be used, so your first concepts land closer to the mark.",
    fields: [
      ...contact(),
      f("section", "Your business"),
      f("short_text", "Exactly how should the name appear in the logo?", { ...req, help: "Spelling, capital letters and any tagline.", why: "Spelling and capitalisation mistakes are an avoidable revision. Get it in writing." }),
      f("long_text", "What does your business do?", { ...req, why: "The logo should make sense for the industry and the customers." }),
      f("long_text", "Who are your customers?", { why: "A logo for a children's brand looks very different from one for a law firm." }),
      f("section", "Style"),
      f("single_choice", "What type of logo do you prefer?", { options: ["Text only (wordmark)", "Symbol + text", "Letters/initials (monogram)", "Badge/emblem", "Not sure, show me options"], why: "Agreeing on the type early stops you designing directions the client was never going to choose." }),
      f("multi_choice", "Which words describe the feel you want?", { options: ["Modern", "Classic", "Bold", "Elegant", "Playful", "Minimal", "Luxury", "Friendly"], why: "Shared words make feedback easier: you can ask whether a concept feels \"bold\" enough." }),
      f("short_text", "Colours you love or want to avoid", { why: "Clients often have strong feelings about colour that they only mention after the first draft." }),
      f("long_text", "Share logos you like and what you like about them", { why: "Examples are faster than descriptions, and show what \"simple\" or \"premium\" means to this client." }),
      f("file", "Upload your current logo, sketches or logos you like", { help: "Optional. Screenshots are fine.", why: "Seeing the current logo tells you what to keep; a rough sketch often shows an idea the client can't put into words." }),
      f("long_text", "Anything you don't want in the logo?", { why: "Things to avoid, like a competitor's colour or an overused symbol, save whole rounds of revisions." }),
      f("multi_choice", "Where will the logo be used?", { options: ["Website", "Social media", "Signage", "Packaging", "Clothing/merch", "Vehicles", "Printed materials"], why: "Tiny social icons or embroidery limit how detailed the logo can be." }),
      f("multi_choice", "What files and extras do you need?", { options: ["Logo files only", "Colour palette", "Fonts", "Social media profile versions", "Business cards", "Brand guidelines"], why: "Defines the deliverables, so the project has a clear end." }),
      ...budgetTimeline(["Under ₦50k", "₦50k - ₦150k", "₦150k - ₦400k", "Above ₦400k"]),
    ],
  },
  {
    key: "brand-identity-questionnaire",
    name: "Brand identity",
    category: "Design",
    summary: "Brand identity: story, personality, audience, colours and deliverables.",
    title: "Brand Identity Onboarding",
    description: "Help us understand your brand so we can design something that fits.",
    seoTitle: "Brand Identity Questionnaire",
    metaDescription:
      "Free brand identity questionnaire for designers: uncover the brand story, audience, competitors, personality, colours, references and deliverables.",
    intro:
      "Brand identity work goes deeper than a logo: personality, audience, colours, type and the rules that tie them together. This questionnaire draws out the story and positioning you need before you start designing.",
    fields: [
      ...contact(),
      f("section", "Your brand"),
      f("long_text", "Tell us the story behind your brand", { ...req, why: "The story gives you meaningful ideas to design with, not just nice shapes." }),
      f("long_text", "Who is your target audience?", { ...req, why: "The identity has to appeal to the customer, which may differ from the owner's personal taste." }),
      f("long_text", "Who are your main competitors?", { why: "The brand should stand apart from competitors, not look like them." }),
      f("multi_choice", "Pick words that describe your brand's personality", { options: ["Bold", "Friendly", "Luxury", "Playful", "Minimal", "Trustworthy", "Youthful", "Traditional"], why: "Personality words become the yardstick for every design decision and every piece of feedback." }),
      f("short_text", "Colours you love or want to avoid", { why: "Brings out strong preferences and cultural meanings early." }),
      f("long_text", "Share brands or logos you admire and why", { why: "Shows the positioning they're aiming for, such as premium, playful or established." }),
      f("section", "Deliverables"),
      f("multi_choice", "What do you need?", { ...req, options: ["Logo", "Colour palette", "Typography", "Brand guidelines", "Business cards", "Social media kit", "Packaging"], why: "Brand projects grow quietly; a clear list of deliverables keeps the scope fixed." }),
      ...budgetTimeline(["Under ₦150k", "₦150k - ₦400k", "₦400k - ₦1m", "Above ₦1m"]),
    ],
  },
  {
    key: "graphic-design-brief",
    name: "Graphic design",
    category: "Design",
    summary: "Flyers, posters, social graphics: text, sizes, style and deadline.",
    title: "Graphic Design Brief",
    description: "Tell us what you need designed, what it should say and where it will be used.",
    seoTitle: "Graphic Design Brief Template",
    metaDescription:
      "Free graphic design brief template for flyers, posters, banners and social graphics: collect the final text, sizes, print or online, style and deadline.",
    intro:
      "Flyers, posters, social graphics, menus and banners all go faster with a proper brief. This one collects the exact text, sizes, deadline and style, which are the details that usually arrive late or in pieces over chat.",
    fields: [
      ...contact(),
      f("section", "The design"),
      f("multi_choice", "What do you need designed?", { ...req, options: ["Flyer", "Poster/banner", "Social media graphics", "Menu", "Business card", "Brochure", "Presentation", "Event materials"], why: "Each item is a separate piece of work, so this sets the quote." }),
      f("long_text", "What is it for?", { ...req, help: "An event, a promotion, a launch...", why: "The purpose decides what should stand out first." }),
      f("long_text", "Paste all the text that must appear", { ...req, help: "Headlines, dates, prices, addresses, phone numbers.", why: "Final text up front is the biggest time saver; most revision rounds are text changes." }),
      f("short_text", "Sizes or formats needed", { help: "For example: A5 flyer, Instagram post and story, 6x3ft banner.", why: "Print and screen designs are set up differently, and resizing later costs time." }),
      f("single_choice", "Is it for print or online?", { options: ["Print", "Online", "Both"], why: "Print needs bleed, print colours and high resolution; screens don't." }),
      f("section", "Style"),
      f("single_choice", "Do you have a logo and brand colours?", { options: ["Yes, I'll send them", "Logo only", "No"], why: "Tells you whether you're working within an existing brand or creating the look." }),
      f("long_text", "Share designs you like", { why: "Shows the style and the level of detail they expect." }),
      f("file", "Upload your logo, brand files or designs you like", { why: "Working files and examples up front mean you can start designing straight away, in the right colours and fonts." }),
      f("short_text", "How many design options would you like to see?", { why: "Sets expectations for concepts and revisions before work starts." }),
      ...budgetTimeline(["Under ₦20k", "₦20k - ₦60k", "₦60k - ₦150k", "Above ₦150k"], { dateLabel: "When do you need the final files?" }),
    ],
  },
  {
    key: "ui-ux-design-brief",
    name: "UI/UX design",
    category: "Design",
    summary: "Product design: users, journeys, screens and what's in scope.",
    title: "UI/UX Design Brief",
    description: "Tell us about the product, its users and the screens you need designed.",
    seoTitle: "UI/UX Design Brief",
    metaDescription:
      "Free UI/UX design brief template: capture the product, stage, platforms, users, key journeys, design scope and developer handover before you start.",
    intro:
      "Product design starts with users and flows, not colours. This brief covers who the product is for, the key journeys, the screens involved and what already exists, so you can scope research, wireframes and visual design properly.",
    fields: [
      ...contact(),
      f("section", "The product"),
      f("long_text", "What is the product, and what does it help people do?", { ...req, why: "A one-line purpose keeps design decisions focused." }),
      f("single_choice", "What stage is it at?", { ...req, options: ["Just an idea", "Wireframes/sketches", "Live, needs a redesign", "Live, needs new features"], why: "Designing from scratch and improving a live product are different projects with different methods." }),
      f("multi_choice", "Which platforms?", { options: ["Mobile app (iOS)", "Mobile app (Android)", "Website", "Web app/dashboard", "Tablet"], why: "Each platform needs its own layouts and patterns." }),
      f("long_text", "Who are the users?", { ...req, why: "Their skill level and situation change everything from text size to navigation." }),
      f("section", "Scope"),
      f("long_text", "List the main user journeys or screens", { help: "For example: sign up, browse products, checkout, track order.", why: "The number of screens and flows is the main driver of design time." }),
      f("multi_choice", "What do you need from us?", { options: ["User research", "Wireframes", "Visual (UI) design", "Clickable prototype", "Design system", "Developer handover"], why: "Makes clear which design stages are included and which are not." }),
      f("single_choice", "Do you have brand guidelines?", { options: ["Yes", "Partly", "No"], why: "Existing brand rules speed up visual design; without them you may need to define styles first." }),
      f("long_text", "Apps or websites you think are well designed", { why: "Shared references make design reviews faster and more objective." }),
      f("single_choice", "Who will build it?", { options: ["Our developers", "Your team", "Not decided yet"], why: "Tells you what the developers need at handover, such as Figma files, specs or a design system." }),
      ...budgetTimeline(["Under ₦300k", "₦300k - ₦800k", "₦800k - ₦2m", "Above ₦2m"]),
    ],
  },
  {
    key: "packaging-design-brief",
    name: "Packaging design",
    category: "Design",
    summary: "Boxes and labels: product, sizes, required text and printing.",
    title: "Packaging Design Brief",
    description: "Tell us about your product and the packaging you need.",
    seoTitle: "Packaging Design Brief",
    metaDescription:
      "Free packaging design brief template: product details, packaging type, exact dimensions, required label text, printing and quantities in one questionnaire.",
    intro:
      "Packaging has to look good on a shelf, survive printing and include the right information. This brief gathers the product details, sizes, printing plans and required text a packaging designer needs.",
    fields: [
      ...contact(),
      f("section", "The product"),
      f("long_text", "What is the product?", { ...req, why: "The product and its price point set the style of the packaging." }),
      f("multi_choice", "What packaging do you need?", { ...req, options: ["Box", "Label/sticker", "Pouch/bag", "Bottle/jar label", "Wrapper", "Carrier bag", "Not sure yet"], why: "Each format is a different template and print process." }),
      f("short_text", "Size and dimensions", { help: "Width x height x depth, or the container size.", why: "Exact sizes are needed for the dieline, the flat template the printer cuts and folds." }),
      f("long_text", "Who buys it, and where is it sold?", { why: "A product on a supermarket shelf needs to stand out; one sold online needs to photograph well." }),
      f("section", "Content and printing"),
      f("long_text", "List everything that must appear on the pack", { help: "Product name, weight, ingredients, NAFDAC number, barcode, contact details...", why: "Required details like ingredients and registration numbers take space and can't be left out." }),
      f("single_choice", "Do you have a printer already?", { options: ["Yes", "No, please recommend one", "Not sure"], why: "Printers have their own file requirements; talking to them early avoids reprints." }),
      f("short_text", "How many units will you print first?", { why: "Quantity affects which printing methods make sense." }),
      f("long_text", "Share packaging you like", { why: "Shows the finish and how premium they want it to feel." }),
      ...budgetTimeline(["Under ₦80k", "₦80k - ₦200k", "₦200k - ₦500k", "Above ₦500k"]),
    ],
  },
  {
    key: "interior-design-client-questionnaire",
    name: "Interior design",
    category: "Design",
    summary: "Homes and spaces: rooms, how they're used, style and budget.",
    title: "Interior Design Questionnaire",
    description: "Tell us about your space, how you use it and the style you love.",
    seoTitle: "Interior Design Client Questionnaire",
    metaDescription:
      "Free interior design client questionnaire: learn about the space, rooms, project type, how it's used, style preferences, pieces to keep and budget before the site visit.",
    intro:
      "Interior design is personal. Before a site visit, learn about the space, the people who use it, their style and how much is changing, so the visit is spent on measurements and ideas, not basic questions.",
    fields: [
      ...contact({ business: false }),
      f("section", "The space"),
      f("single_choice", "What type of space is it?", { ...req, options: ["Home", "Office", "Shop/showroom", "Restaurant/café", "Hotel/short-let", "Other"], why: "Homes and commercial spaces have different requirements and timelines." }),
      f("short_text", "Which rooms or areas are included?", { ...req, why: "The number of rooms is the main factor in fees and timeline." }),
      f("short_text", "Where is the property?", { why: "Needed for site visits and for planning local suppliers." }),
      f("single_choice", "What kind of project is it?", { options: ["Full design and renovation", "Furnishing and decor only", "Styling a few pieces", "Consultation only"], why: "Shows whether building work is involved, which changes everything." }),
      f("section", "How you use the space"),
      f("long_text", "Who uses the space, and how?", { help: "Family members, pets, staff, guests, and how you spend time there.", why: "A design that suits how people really use a space beats one that only looks good in photos." }),
      f("multi_choice", "Which styles do you like?", { options: ["Modern", "Minimal", "Classic", "Contemporary African", "Industrial", "Scandinavian", "Luxury", "Not sure"], why: "Style words give you a starting point for mood boards." }),
      f("long_text", "Anything you want to keep?", { help: "Furniture, artwork, fittings.", why: "Existing pieces become fixed points the design has to work around." }),
      f("long_text", "Share photos or Pinterest/Instagram links you love", { why: "Saved images show taste far better than descriptions." }),
      f("file", "Upload photos of the space", { help: "A few photos of each room, taken from the corners.", why: "Photos show the size, light and condition of the space before the site visit, so you arrive with better questions." }),
      ...budgetTimeline(["Under ₦1m", "₦1m - ₦5m", "₦5m - ₦15m", "Above ₦15m"]),
    ],
  },

  // ---------- Marketing ----------
  {
    key: "social-media-client-onboarding-questionnaire",
    name: "Social media management",
    category: "Marketing",
    summary: "Content and account management: platforms, goals, voice and approvals.",
    title: "Social Media Management Onboarding",
    description: "Share your goals and brand voice so we can plan your content.",
    seoTitle: "Social Media Client Onboarding Questionnaire",
    metaDescription:
      "Free social media client onboarding questionnaire: collect platforms, account links, goals, audience, brand voice, posting frequency, approvals and content supply.",
    intro:
      "Managing someone's social media means speaking in their voice. This onboarding questionnaire collects the accounts, goals, audience, tone and approval process you need before you plan the first month of content.",
    fields: [
      ...contact(),
      f("section", "Your accounts"),
      f("multi_choice", "Which platforms should we manage?", { ...req, options: ["Instagram", "TikTok", "X (Twitter)", "LinkedIn", "Facebook", "YouTube"], why: "Each platform needs its own content format and posting plan." }),
      f("long_text", "Paste links to your accounts", { why: "Lets you review their current content and results before you start." }),
      f("long_text", "What are your goals for the next 3 months?", { ...req, why: "Clear goals (followers, enquiries, sales) decide the content mix and how you report results." }),
      f("long_text", "Who is your ideal follower or customer?", { why: "Content aimed at a specific audience performs better than content for everyone." }),
      f("section", "Content"),
      f("long_text", "Describe your brand voice and topics you want to post about", { why: "Getting the voice right is what makes outsourced content feel authentic." }),
      f("single_choice", "How often should we post?", { options: ["Daily", "3-5 times a week", "1-2 times a week"], why: "Posting frequency is the main driver of your monthly fee." }),
      f("single_choice", "Will you provide photos and videos?", { options: ["Yes, regularly", "Sometimes", "No, you'll need to create them"], why: "Creating content is a separate cost from posting and community management." }),
      f("single_choice", "Who approves posts before they go out?", { options: ["Me", "My team", "No approval needed"], why: "Knowing who approves posts, and how fast, keeps your content calendar on schedule." }),
      ...budgetTimeline(["Under ₦100k/month", "₦100k - ₦300k/month", "₦300k - ₦700k/month", "Above ₦700k/month"], { dateLabel: "When would you like to start?" }),
    ],
  },
  {
    key: "digital-marketing-client-onboarding-questionnaire",
    name: "Digital marketing & ads",
    category: "Marketing",
    summary: "Paid ads: offer, goals, customer value, accounts and ad spend.",
    title: "Digital Marketing Onboarding",
    description: "Tell us about your business, your goals and what you've tried, so we can plan your campaigns.",
    seoTitle: "Digital Marketing Client Onboarding Questionnaire",
    metaDescription:
      "Free digital marketing client onboarding questionnaire for ad campaigns: offer, goal, customer value, platforms, past results, tracking setup and ad spend.",
    intro:
      "Running ads for a client starts with numbers: what they sell, what a customer is worth, what they can spend and how results are tracked. This questionnaire collects those details before you plan a single campaign.",
    fields: [
      ...contact(),
      f("section", "Business and goals"),
      f("long_text", "What are you selling, and to whom?", { ...req, why: "The offer and audience decide the platforms and targeting." }),
      f("single_choice", "What's the main goal?", { ...req, options: ["Sales", "Leads/enquiries", "App installs", "Event sign-ups", "Brand awareness"], why: "The goal decides what campaigns are optimised for and how success is measured." }),
      f("short_text", "What is a typical sale or customer worth to you?", { help: "Average order value or project value.", why: "This tells you how much you can afford to pay to win each customer." }),
      f("multi_choice", "Which platforms do you want to advertise on?", { options: ["Instagram/Facebook", "Google Search", "YouTube", "TikTok", "X (Twitter)", "LinkedIn", "Not sure"], why: "Each platform has different costs and audiences." }),
      f("section", "History and setup"),
      f("single_choice", "Have you run ads before?", { options: ["Yes, with good results", "Yes, with poor results", "No"], why: "Past results, good or bad, are useful data, and they shape expectations." }),
      f("multi_choice", "Which of these are already set up?", { options: ["Meta Business account", "Google Ads account", "Meta Pixel on the website", "Google Analytics", "None of these"], why: "Missing accounts and tracking have to be set up before ads can be measured." }),
      f("url", "Website or page the ads will send people to", { why: "A weak landing page wastes ad spend, so you'll want to review it first." }),
      f("single_choice", "Monthly ad spend (paid to the platforms)", { ...req, options: ["Under ₦100k", "₦100k - ₦500k", "₦500k - ₦2m", "Above ₦2m"], why: "Ad spend is separate from your fee, and it decides how much testing is possible." }),
      ...budgetTimeline(["Under ₦100k/month", "₦100k - ₦300k/month", "₦300k - ₦700k/month", "Above ₦700k/month"], { budgetLabel: "Monthly budget for our management fee", dateLabel: "When would you like campaigns to start?" }),
    ],
  },
  {
    key: "seo-client-onboarding-questionnaire",
    name: "SEO",
    category: "Marketing",
    summary: "Search engine optimisation: priorities, keywords, access and history.",
    title: "SEO Onboarding",
    description: "Tell us about your website, your customers and what you want to rank for.",
    seoTitle: "SEO Client Onboarding Questionnaire",
    metaDescription:
      "Free SEO client onboarding questionnaire: website, priority services, target keywords, locations, competitors, tool access and SEO history in one form.",
    intro:
      "SEO work depends on access, history and priorities. This questionnaire gathers the website details, target searches, competitors, locations and past SEO work you need before an audit or proposal.",
    fields: [
      ...contact(),
      f("section", "Website and goals"),
      f("url", "Website address", { ...req, why: "You can run a quick audit before your first call." }),
      f("long_text", "Which products or services matter most to your business?", { ...req, why: "Effort should go first to the pages that bring in money." }),
      f("long_text", "What would people search on Google to find you?", { help: "List the phrases you'd like to rank for.", why: "Their guesses are a starting keyword list, and show what they expect to rank for." }),
      f("short_text", "Which cities or countries do you serve?", { why: "Local and national SEO need different strategies." }),
      f("long_text", "Who are your main competitors online?", { why: "Competitors who rank well show what it will take to beat them." }),
      f("section", "Access and history"),
      f("multi_choice", "Which of these can you give us access to?", { options: ["Google Search Console", "Google Analytics", "Website admin/CMS", "Google Business Profile", "Domain/DNS settings", "None yet"], why: "Without access you can't measure or fix much, so this often decides the start date." }),
      f("single_choice", "Has anyone done SEO on the site before?", { options: ["Yes, recently", "Yes, a while ago", "No", "Not sure"], why: "Past work, including bad links, can help or hurt; you need to know before you start." }),
      f("single_choice", "Who can make changes to the website?", { options: ["You (our SEO provider)", "Our developer", "Our team", "Not sure"], why: "SEO recommendations need someone to put them in place." }),
      ...budgetTimeline(["Under ₦100k/month", "₦100k - ₦300k/month", "₦300k - ₦700k/month", "Above ₦700k/month"], { dateLabel: "When would you like to start?" }),
    ],
  },
  {
    key: "copywriting-brief",
    name: "Copywriting",
    category: "Marketing",
    summary: "Website copy, articles, emails and ads: reader, offer and voice.",
    title: "Copywriting Brief",
    description: "Tell us what you need written, who will read it and how it should sound.",
    seoTitle: "Copywriting Brief Template",
    metaDescription:
      "Free copywriting brief template for website copy, articles, emails and ads: collect the deliverables, offer, reader, call to action, tone and sources.",
    intro:
      "Good copy depends on knowing the reader, the offer and the voice. This brief collects all three, plus the format, length and deadline, so your first draft sounds like the client from the start.",
    fields: [
      ...contact(),
      f("section", "The project"),
      f("multi_choice", "What do you need written?", { ...req, options: ["Website pages", "Product descriptions", "Blog articles", "Email sequence", "Social media captions", "Ad copy", "Company profile"], why: "Each type has a different length and price." }),
      f("short_text", "How many pieces or pages?", { why: "Volume decides the price and timeline." }),
      f("long_text", "What are you selling or promoting?", { ...req, why: "Copy can only sell what the writer understands." }),
      f("long_text", "Who will read it?", { ...req, why: "The reader decides the words, the tone and the doubts the copy needs to answer." }),
      f("long_text", "What should the reader do after reading?", { why: "Every piece needs a clear next step, such as buy, call or sign up." }),
      f("section", "Voice and sources"),
      f("multi_choice", "How should it sound?", { options: ["Professional", "Friendly", "Bold", "Playful", "Inspirational", "Straight to the point"], why: "Agreeing on tone up front prevents rewriting a whole draft." }),
      f("long_text", "Share writing you like, or existing material about your business", { why: "Existing material saves research time and shows what they already say about themselves." }),
      f("short_text", "Words, claims or topics to avoid", { why: "Some industries have legal or brand rules you need to know before writing." }),
      ...budgetTimeline(["Under ₦50k", "₦50k - ₦150k", "₦150k - ₦400k", "Above ₦400k"]),
    ],
  },

  // ---------- Photo, video & events ----------
  {
    key: "video-production-brief",
    name: "Video production",
    category: "Photo, video & events",
    summary: "Video shoots and editing: purpose, style, length and references.",
    title: "Video Project Onboarding",
    description: "Tell us about the video you have in mind.",
    seoTitle: "Video Production Brief Template",
    metaDescription:
      "Free video production brief template: video type, scene-by-scene idea, locations, length, services needed, reference videos and where it will be published.",
    intro:
      "Video projects involve scripts, shoots, locations and editing, and each one affects the cost. This brief captures the type of video, the story, length, deliverables and references before you plan the shoot.",
    fields: [
      ...contact(),
      f("section", "The video"),
      f("single_choice", "What type of video is this?", { ...req, options: ["Brand/promo", "Music video", "Event coverage", "YouTube content", "Ads/short-form", "Documentary"], why: "Each type needs a different crew, schedule and editing style." }),
      f("long_text", "Describe the video you want, scene by scene if you can", { ...req, why: "A rough scene list is the start of the script and shot list." }),
      f("short_text", "Where will filming take place?", { help: "Locations, and whether they're booked.", why: "Locations affect logistics, permits and travel costs." }),
      f("single_choice", "How long should the final video be?", { options: ["Under 30 seconds", "30s - 2 min", "2 - 10 min", "Over 10 min"], why: "Final length drives editing time more than anything else." }),
      f("multi_choice", "What do you need from us?", { options: ["Scriptwriting", "Shooting", "Editing only", "Motion graphics", "Voice-over", "Subtitles"], why: "Separates shooting, editing and extras so each can be priced." }),
      f("long_text", "Share links to videos with a style you like", { why: "Reference videos set the look, pace and quality expected." }),
      f("short_text", "Where will this video be published?", { why: "Platforms decide the shape (vertical or wide) and how many versions to export." }),
      ...budgetTimeline(["Under ₦200k", "₦200k - ₦600k", "₦600k - ₦1.5m", "Above ₦1.5m"]),
    ],
  },
  {
    key: "photography-client-questionnaire",
    name: "Photoshoot",
    category: "Photo, video & events",
    summary: "Product, portrait and brand shoots: shot list, style and usage.",
    title: "Photoshoot Questionnaire",
    description: "Tell us about the shoot so we can plan it properly.",
    seoTitle: "Photography Client Questionnaire",
    metaDescription:
      "Free photography client questionnaire for product, portrait and brand shoots: shoot type, location, must-have shots, style, usage, edits and extras.",
    intro:
      "Whether it's a product shoot, a portrait session or brand photography, a short questionnaire before the shoot means fewer surprises on the day. Collect the shoot type, location, shot list, styling and usage in one go.",
    fields: [
      ...contact(),
      f("section", "The shoot"),
      f("single_choice", "What type of shoot is it?", { ...req, options: ["Portraits/headshots", "Product photography", "Brand/lifestyle", "Family", "Fashion", "Food", "Event", "Real estate"], why: "The shoot type decides the equipment, crew and time needed." }),
      f("date", "Preferred shoot date", { why: "Lets you check availability straight away." }),
      f("short_text", "Location", { help: "Studio, outdoors, your office, or not sure yet.", why: "Location affects lighting, travel and whether you need permits." }),
      f("single_choice", "How many people or products?", { options: ["1", "2 - 5", "6 - 20", "More than 20"], why: "Numbers set how long the shoot takes." }),
      f("long_text", "List the shots you must have", { why: "A must-have list makes sure nothing important is missed on the day." }),
      f("section", "Style and use"),
      f("long_text", "Share photos with a style you like", { why: "References show the lighting, mood and editing style they expect." }),
      f("multi_choice", "Where will the photos be used?", { options: ["Website", "Social media", "Print/billboards", "Ads", "Personal"], why: "Usage affects licensing, and large prints need higher resolution." }),
      f("single_choice", "How many edited photos do you need?", { options: ["Under 10", "10 - 30", "30 - 100", "More than 100"], why: "Editing is often most of the work, so this sets the price." }),
      f("multi_choice", "Do you need any of these?", { options: ["Makeup artist", "Stylist", "Props", "Models", "Studio hire"], why: "Extra crew and props need booking and budgeting in advance." }),
      ...budgetTimeline(["Under ₦50k", "₦50k - ₦150k", "₦150k - ₦400k", "Above ₦400k"], { dateLabel: "When do you need the final photos?" }),
    ],
  },
  {
    key: "wedding-photography-questionnaire",
    name: "Wedding photography",
    category: "Photo, video & events",
    summary: "Weddings: events, venues, schedule, family shots and traditions.",
    title: "Wedding Photography Questionnaire",
    description: "Help us capture every moment that matters on your day.",
    seoTitle: "Wedding Photography Questionnaire",
    metaDescription:
      "Free wedding photography questionnaire for couples: events to cover, venues, schedule, guest count, must-have family shots, traditions and deliverables.",
    intro:
      "Weddings happen once, so the details matter. Send this questionnaire to couples after booking to collect the schedule, venues, key people, must-have shots and cultural moments you can't afford to miss.",
    fields: [
      f("section", "The couple"),
      f("short_text", "Couple's names", { ...req, why: "So you can use their names and know who's who on the day." }),
      f("email", "Email address", { ...req, why: "Where you'll send the contract, schedule and gallery link." }),
      f("phone", "Phone / WhatsApp number", { ...req, why: "On the day, a call is the quickest way to reach the couple or their planner." }),
      f("section", "The day"),
      f("date", "Wedding date", { ...req, why: "Confirms your booking and lets you plan around other events." }),
      f("multi_choice", "Which events should we cover?", { ...req, options: ["Traditional engagement", "Court/registry", "Church/mosque ceremony", "Reception", "Pre-wedding shoot", "Bridal preparation", "After-party"], why: "Many weddings span several events and days, and each one needs time and people." }),
      f("long_text", "Venues and addresses", { ...req, why: "Lets you plan travel time and check the lighting in advance." }),
      f("long_text", "Rough schedule for the day", { help: "Times for preparation, ceremony, reception...", why: "A timeline puts you in the right place for every key moment." }),
      f("short_text", "Approximate number of guests", { why: "Guest numbers decide whether you need a second photographer." }),
      f("section", "Shots and people"),
      f("long_text", "Must-have photos and family groups", { help: "For example: bride with grandparents, groom with university friends.", why: "Group photos are the easiest to forget on a busy day. A list lets someone call people over quickly." }),
      f("long_text", "Cultural moments or traditions we should capture", { why: "Traditions like the money spray or the kneeling ceremony are highlights that can't be repeated." }),
      f("short_text", "Name and phone number of your planner or coordinator", { why: "The planner is your best contact on the day when timings change." }),
      f("multi_choice", "What would you like delivered?", { options: ["Edited digital photos", "Photo album", "Prints", "Highlight video", "Same-day slideshow"], why: "Deliverables vary a lot in cost and turnaround time." }),
      f("single_choice", "Budget for photography", { options: ["Under ₦300k", "₦300k - ₦800k", "₦800k - ₦2m", "Above ₦2m"], why: BUDGET_WHY }),
      anythingElse(),
    ],
  },
  {
    key: "event-planning-client-questionnaire",
    name: "Event planning",
    category: "Photo, video & events",
    summary: "Events: date, guests, venue, services, theme and budget.",
    title: "Event Planning Questionnaire",
    description: "Tell us about your event and how we can help make it a success.",
    seoTitle: "Event Planning Client Questionnaire",
    metaDescription:
      "Free event planning client questionnaire: event type, date, guest count, venue, services needed, theme, inspiration and total budget in one link.",
    intro:
      "Event planning starts with the basics (date, guests, venue, budget) but succeeds on the details. This questionnaire gathers both, so you can build a plan and a quote after one conversation.",
    fields: [
      ...contact(),
      f("section", "The event"),
      f("single_choice", "What type of event?", { ...req, options: ["Wedding", "Birthday", "Corporate event", "Conference", "Product launch", "Burial/memorial", "Party", "Other"], why: "Each type of event has its own suppliers, timing and etiquette." }),
      f("date", "Event date", { ...req, why: "Confirms your availability. Venues and suppliers book up fast." }),
      f("short_text", "Expected number of guests", { ...req, why: "Guest count drives venue size, catering and most of the cost." }),
      f("single_choice", "Do you have a venue?", { options: ["Yes, booked", "Considering some", "No, please help find one"], why: "Finding a venue adds work and shapes your timeline." }),
      f("short_text", "Venue name or preferred area", { why: "Location affects suppliers, logistics and guest travel." }),
      f("section", "Services and style"),
      f("multi_choice", "Which services do you need?", { ...req, options: ["Full planning", "On-the-day coordination", "Decor", "Catering", "Entertainment/MC/DJ", "Photography/video", "Guest management", "Rentals (chairs, tents)"], why: "Defines exactly what you're responsible for, so nothing falls between suppliers." }),
      f("long_text", "Describe the theme, colours or feel you want", { why: "The theme guides decor, invitations and supplier choices." }),
      f("long_text", "Share photos of events you love", { why: "Pictures help you price the level of decor they have in mind." }),
      f("file", "Upload inspiration photos", { help: "Optional. Screenshots from Instagram or Pinterest are fine.", why: "Saved pictures show the decor, colours and scale they expect better than any description." }),
      ...budgetTimeline(["Under ₦1m", "₦1m - ₦5m", "₦5m - ₦15m", "Above ₦15m"], { budgetLabel: "What is your total budget for the event?", date: false }),
    ],
  },

  // ---------- Business & services ----------
  {
    key: "creative-brief-template",
    name: "Creative brief",
    category: "Business & services",
    summary: "Any creative project: goal, audience, message and deliverables.",
    title: "Creative Brief",
    description: "Tell us what you need created, why, and who it's for.",
    seoTitle: "Creative Brief Template",
    metaDescription:
      "Free creative brief template: project summary, measurable goal, audience, key message, deliverables, brand assets, references and approver in one form.",
    intro:
      "A creative brief is the one-page agreement behind any creative project: what you're making, why, for whom and by when. Use this template for campaigns, content or any project that doesn't fit a more specific brief.",
    fields: [
      ...contact(),
      f("section", "The project"),
      f("long_text", "Project summary: what needs to be created?", { ...req, why: "A short summary keeps everyone describing the same project." }),
      f("long_text", "What is the goal, and how will you measure success?", { ...req, why: "Measurable goals make it easier to judge the work and agree when it's finished." }),
      f("long_text", "Who is the audience?", { ...req, why: "Creative work needs a clear audience to be effective." }),
      f("long_text", "What is the key message?", { help: "The one thing the audience should remember.", why: "One clear message prevents work that tries to say everything." }),
      f("multi_choice", "Deliverables", { options: ["Design", "Video", "Copy", "Photos", "Social content", "Website/digital", "Print"], why: "A list of deliverables sets the scope and the price." }),
      f("section", "Context"),
      f("long_text", "Brand guidelines, assets or references", { help: "Paste links, or upload files below.", why: "Existing assets keep the work consistent with the brand." }),
      f("file", "Upload brand files or references", { why: "Logos, fonts and guidelines in hand mean the first draft already looks on-brand." }),
      f("long_text", "Competitors or work you admire", { why: "Gives you a quality benchmark and shows what to stand apart from." }),
      f("short_text", "Who approves the work?", { why: "Knowing the decision-maker avoids surprise feedback late in the project." }),
      ...budgetTimeline(["Under ₦200k", "₦200k - ₦600k", "₦600k - ₦2m", "Above ₦2m"]),
    ],
  },
  {
    key: "freelance-client-intake-form",
    name: "Freelance client intake",
    category: "Business & services",
    summary: "Qualify any new enquiry: project, goals, timing and budget.",
    title: "New Project Enquiry",
    description: "Tell us a little about your project so we can see how we can help.",
    seoTitle: "Freelance Client Intake Form",
    metaDescription:
      "Free freelance client intake form for any service: qualify new enquiries with the project, goals, past experience, start date, budget and how they found you.",
    intro:
      "A general-purpose intake form for any freelance service. It qualifies new enquiries by collecting the project, goals, timing, budget and how they found you, before you agree to a call.",
    fields: [
      ...contact(),
      f("section", "Your project"),
      f("single_choice", "Which service are you interested in?", { ...req, options: ["Design", "Development", "Writing", "Marketing", "Video/photo", "Consulting", "Other"], why: "Routes the enquiry and tells you which follow-up questions to ask. Edit the options to match your services." }),
      f("long_text", "Tell us about your project", { ...req, why: "Their own description shows how clear their needs are." }),
      f("long_text", "What does success look like for you?", { why: "Shows the outcome they're paying for, which shapes your proposal." }),
      f("single_choice", "Have you worked with a freelancer before?", { options: ["Yes, it went well", "Yes, it didn't go well", "No, this is my first time"], why: "First-time clients may need more guidance on how the process works." }),
      f("single_choice", "When would you like to start?", { options: ["Immediately", "Within a month", "In 1-3 months", "Just exploring"], why: "Separates urgent projects from people still exploring." }),
      f("single_choice", "How did you hear about us?", { options: ["Instagram", "X (Twitter)", "Referral", "Google", "LinkedIn", "WhatsApp", "Other"], why: "Shows which channels bring you clients, so you know where to spend your time." }),
      ...budgetTimeline(["Under ₦100k", "₦100k - ₦500k", "₦500k - ₦2m", "Above ₦2m"], { date: false }),
    ],
  },
  {
    key: "consulting-client-intake-form",
    name: "Consulting / coaching",
    category: "Business & services",
    summary: "Consultants and coaches: situation, goals and decision-makers.",
    title: "Consulting Intake Form",
    description: "Tell us about your situation and goals before our first session.",
    seoTitle: "Consulting Client Intake Form",
    metaDescription:
      "Free consulting client intake form for consultants and coaches: role, challenge, past attempts, desired outcome, decision-makers and preferred way of working.",
    intro:
      "Consultants, coaches and advisers can send this intake form before a first session. It collects the client's situation, goals, past attempts and decision process, so the first meeting starts with understanding rather than background questions.",
    fields: [
      ...contact(),
      f("section", "Your situation"),
      f("short_text", "Your role and company", { why: "Context on the role and company helps you tailor your advice." }),
      f("long_text", "What challenge would you like help with?", { ...req, why: "The core problem becomes the focus of your first session." }),
      f("long_text", "What have you already tried?", { why: "Avoids repeating ideas that already failed, and shows what the client has learned." }),
      f("long_text", "What would a great result look like in 3-6 months?", { ...req, why: "A clear outcome gives you both a way to measure progress." }),
      f("short_text", "Who else is involved in the decision?", { why: "Knowing the decision-makers early avoids proposals that stall." }),
      f("section", "Working together"),
      f("single_choice", "How would you like to work together?", { options: ["One-off session", "Short project", "Ongoing monthly support", "Not sure yet"], why: "Shows which offer or package to propose." }),
      f("single_choice", "Preferred meeting format", { options: ["Video call", "Phone call", "In person"], why: "Small, but it saves a round of messages." }),
      ...budgetTimeline(["Under ₦100k", "₦100k - ₦500k", "₦500k - ₦2m", "Above ₦2m"], { date: false }),
    ],
  },
  {
    key: "virtual-assistant-client-onboarding-questionnaire",
    name: "Virtual assistant",
    category: "Business & services",
    summary: "VA onboarding: tasks, hours, tools, access and limits.",
    title: "Virtual Assistant Onboarding",
    description: "Tell me about the work you need help with so I can start quickly.",
    seoTitle: "Virtual Assistant Client Onboarding Questionnaire",
    metaDescription:
      "Free virtual assistant client onboarding questionnaire: tasks, weekly hours, working hours, tools, communication channel and what the VA can do without asking.",
    intro:
      "Virtual assistants need to know the tasks, tools, access, working hours and communication rules before day one. This onboarding questionnaire gathers it all, so you can start helping straight away.",
    fields: [
      ...contact(),
      f("section", "The work"),
      f("multi_choice", "Which tasks do you need help with?", { ...req, options: ["Email management", "Calendar and scheduling", "Social media", "Customer support", "Data entry", "Research", "Bookkeeping", "Travel planning"], why: "A clear task list defines the role and stops extra tasks creeping in later." }),
      f("long_text", "Describe a typical week of tasks", { why: "Real examples show volume and priorities better than a task list alone." }),
      f("single_choice", "How many hours per week?", { ...req, options: ["Under 10", "10 - 20", "20 - 30", "Full-time"], why: "Hours set the fee and how much time you have for other clients." }),
      f("short_text", "Your working hours and time zone", { why: "Defines when you need to be available and how fast to reply." }),
      f("section", "Tools and communication"),
      f("long_text", "Which tools do you use?", { help: "Gmail, Google Drive, Slack, Notion, WhatsApp, accounting software...", why: "Shows what you need access to and any tools you need to learn." }),
      f("single_choice", "How should we communicate?", { options: ["WhatsApp", "Email", "Slack", "Calls"], why: "Agreeing on one channel avoids missed messages." }),
      f("long_text", "What can I do without asking you first?", { why: "Clear limits let you act quickly without overstepping." }),
      ...budgetTimeline(["Under ₦100k/month", "₦100k - ₦250k/month", "₦250k - ₦500k/month", "Above ₦500k/month"], { dateLabel: "When would you like to start?" }),
    ],
  },
  {
    key: "custom-clothing-order-form",
    name: "Custom clothing order",
    category: "Business & services",
    summary: "Tailors and fashion designers: style, fabric, measurements, date.",
    title: "Custom Clothing Order",
    description: "Tell us about the outfit you want and when you need it.",
    seoTitle: "Custom Clothing Order Form",
    metaDescription:
      "Free custom clothing order form for tailors and fashion designers: occasion, style, fabric, number of pieces, measurements, deadline and delivery in one link.",
    intro:
      "Tailors and fashion designers can send this form to collect the outfit details, fabric, measurements and deadline in one message, instead of piecing them together from voice notes and screenshots.",
    fields: [
      ...contact({ business: false }),
      f("section", "The outfit"),
      f("single_choice", "What is the outfit for?", { options: ["Wedding/traditional event", "Party", "Work", "Everyday", "Uniform/group order"], why: "The occasion decides the style, the finish and how fixed the deadline is." }),
      f("long_text", "Describe the style you want", { ...req, help: "Describe it here, and upload pictures below if you have them.", why: "A clear description avoids the most common complaint: \"this isn't what I asked for\"." }),
      f("file", "Upload pictures of the style", { why: "A picture of the exact style, plus the client's description, is the clearest brief a tailor can get." }),
      f("single_choice", "Will you provide the fabric?", { ...req, options: ["Yes, I'll bring it", "No, please source it", "Not sure"], why: "Sourcing fabric adds cost and time." }),
      f("short_text", "How many pieces?", { why: "Group orders need more time and often a different price." }),
      f("section", "Measurements and delivery"),
      f("single_choice", "How will we get your measurements?", { ...req, options: ["I'll come in to be measured", "I'll send them below", "Use my measurements from last time"], why: "Accurate measurements are everything in tailoring; this makes sure you'll have them." }),
      f("long_text", "Measurements (if sending them)", { help: "Bust/chest, waist, hips, shoulder, sleeve length, full length...", why: "Measurements in writing avoid fitting mistakes and arguments later." }),
      f("date", "When do you need it?", { ...req, why: "Event dates don't move, so you need the deadline to plan fittings." }),
      f("single_choice", "Pickup or delivery?", { options: ["Pickup", "Delivery"], why: "Delivery needs an address and adds to the cost." }),
      f("single_choice", "What budget range are you working with?", { options: ["Under ₦30k", "₦30k - ₦80k", "₦80k - ₦200k", "Above ₦200k"], why: BUDGET_WHY }),
      anythingElse(),
    ],
  },
  {
    key: "custom-cake-order-form",
    name: "Custom cake order",
    category: "Business & services",
    summary: "Bakers: date, servings, flavours, design, message and delivery.",
    title: "Custom Cake Order",
    description: "Tell us about the cake you'd like and when you need it.",
    seoTitle: "Custom Cake Order Form",
    metaDescription:
      "Free custom cake order form for bakers: occasion, date, servings, flavours, design, message on the cake, allergies and delivery details in one link.",
    intro:
      "Bakers can use this order form to collect the date, size, flavours, design, message and delivery details for custom cakes, so every order arrives complete and in writing.",
    fields: [
      ...contact({ business: false }),
      f("section", "The cake"),
      f("single_choice", "What is the occasion?", { options: ["Birthday", "Wedding", "Anniversary", "Baby shower", "Corporate event", "Other"], why: "The occasion suggests the design and the usual number of tiers." }),
      f("date", "Date needed", { ...req, why: "Lets you confirm availability before discussing anything else." }),
      f("short_text", "Number of guests (or cake size)", { ...req, why: "Servings decide the size and most of the price." }),
      f("multi_choice", "Flavours", { options: ["Vanilla", "Chocolate", "Red velvet", "Fruit cake", "Carrot", "Lemon", "Other"], why: "Some flavours need special ingredients, so it's best to know early." }),
      f("long_text", "Describe the design", { ...req, help: "Colours, theme, toppers. You can upload a picture below.", why: "A picture or detailed description avoids disappointment on the day." }),
      f("file", "Upload a picture of a cake you like", { why: "A reference picture shows the decoration and finish the client expects, and helps you price it." }),
      f("short_text", "Message or name on the cake", { why: "A spelling mistake on a cake can't be undone. Get the exact text in writing." }),
      f("short_text", "Allergies or dietary needs", { why: "Allergies are a safety issue, not a preference." }),
      f("section", "Delivery"),
      f("single_choice", "Pickup or delivery?", { ...req, options: ["Pickup", "Delivery"], why: "Delivery needs planning, especially for tiered cakes." }),
      f("long_text", "Delivery address and time", { why: "An exact address and time window prevent late or failed deliveries." }),
      f("single_choice", "What budget range are you working with?", { options: ["Under ₦30k", "₦30k - ₦80k", "₦80k - ₦200k", "Above ₦200k"], why: BUDGET_WHY }),
      anythingElse(),
    ],
  },
];

export function getTemplate(key: string) {
  return TEMPLATES.find((t) => t.key === key) ?? null;
}

export const questionCount = (t: Template) => t.fields.filter((x) => x.type !== "section").length;

/** Rough time for a client to fill the form: long answers take longer than taps. */
export function minutesToFill(t: Template) {
  const seconds = t.fields.reduce((s, x) => s + (x.type === "section" ? 0 : x.type === "long_text" || x.type === "file" ? 60 : 15), 0);
  return Math.max(2, Math.round(seconds / 60));
}

/** The form fields without the public page's explanations, ready to save as a form. */
export function templateFormFields(t: Template): FormField[] {
  return t.fields.map((field) => {
    const copy: TemplateField = { ...field };
    delete copy.why;
    return copy;
  });
}
