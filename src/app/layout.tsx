import type { Metadata, Viewport } from "next";
import "./globals.css";
import { VisitTracker } from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: { default: "Formtified: AI client onboarding forms", template: "%s · Formtified" },
  description:
    "Describe your client's project, answer a few questions, and get a ready-to-share onboarding form in seconds.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kanit:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}
