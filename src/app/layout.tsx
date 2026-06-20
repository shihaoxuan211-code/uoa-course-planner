import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { GA_SCRIPT } from "@/lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Planner",
  description:
    "Course Planner — An independent student planning tool. Search courses, compare assessments, check exam modes, and plan your study pathway using public information."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <head>
        {/* Vercel Analytics */}
        <script defer src="/_vercel/insights/script.js" />
        {GA_SCRIPT ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: GA_SCRIPT }} />
          </>
        ) : null}
      </head>
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
