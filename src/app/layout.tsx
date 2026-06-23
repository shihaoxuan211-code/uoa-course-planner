import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { GA_SCRIPT } from "@/lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Planner",
  description:
    "Course Planner — An independent student planning tool. Search courses, compare assessments, check exam modes, and plan your study pathway using public information."
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
        <Script defer src="/_vercel/insights/script.js" strategy="afterInteractive" />
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: GA_SCRIPT }}
            />
          </>
        )}
      </body>
    </html>
  );
}
