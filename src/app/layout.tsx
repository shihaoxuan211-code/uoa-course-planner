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
      </body>
    </html>
  );
}
