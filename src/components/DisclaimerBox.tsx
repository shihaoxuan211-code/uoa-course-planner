"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

interface DisclaimerBoxProps {
  children?: ReactNode;
  title?: string;
}

export function DisclaimerBox({ children, title }: DisclaimerBoxProps) {
  const t = useT();
  const resolvedTitle = title ?? t.disclaimer.title;

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
      <span className="font-semibold text-slate-600">{resolvedTitle}</span>
      {children ? (
        <span className="ml-1">{children}</span>
      ) : (
        <span className="ml-1">Course data is collected from public sources and may be incomplete or outdated. Please verify important enrolment details with official university pages.</span>
      )}
    </section>
  );
}
