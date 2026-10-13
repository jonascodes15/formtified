import type { Metadata, Viewport } from "next";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  // Lets every page use short paths ("/templates") for links and images; Next.js adds the domain.
  metadataBase: new URL(siteUrl()),
  title: { default: "Client Onboarding Forms for Freelancers | Formtified", template: "%s · Formtified" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: "Formtified: client onboarding forms for freelancers",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f5f8fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kanit:wght@500;600;700&family=Russo+One&display=swap"
        />
      </head>
      <body>
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
