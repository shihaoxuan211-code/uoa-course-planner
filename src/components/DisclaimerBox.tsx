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
    <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">{resolvedTitle}</p>
      <div className="mt-1 leading-6">
        {children ?? (
          <div className="space-y-2">
            <p>{t.disclaimer.body1}</p>
            <p>{t.disclaimer.body2}</p>
          </div>
        )}
      </div>
    </section>
  );
}
