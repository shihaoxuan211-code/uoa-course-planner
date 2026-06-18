import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "UOA Course Planner",
  description:
    "University of Auckland Course Planner — Search courses, compare assessments, check exam modes, and plan your study pathway using public UOA information."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <footer className="mx-auto max-w-6xl px-4 pb-8 pt-12">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs leading-5 text-slate-500">
            <p className="font-semibold text-slate-600">
              Course Planner is an independent student-created platform and is not affiliated with,
              endorsed by, or operated by the University of Auckland.
            </p>
            <p className="mt-1">
              Course information is sourced from publicly available university catalogues and may be
              incomplete or outdated. University names and course information are referenced for
              informational purposes only. Please verify important information using official
              University of Auckland sources before making enrolment decisions.
            </p>
            <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <a href="/privacy" className="underline decoration-dotted underline-offset-2 hover:text-ink">Privacy Policy</a>
              <a href="/terms" className="underline decoration-dotted underline-offset-2 hover:text-ink">Terms of Use</a>
              <a href="/disclaimer" className="underline decoration-dotted underline-offset-2 hover:text-ink">Disclaimer</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
