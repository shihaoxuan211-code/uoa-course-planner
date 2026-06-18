import type { ReactNode } from "react";

interface DisclaimerBoxProps {
  children?: ReactNode;
  title?: string;
}

export function DisclaimerBox({ children, title = "Planning reference only" }: DisclaimerBoxProps) {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 leading-6">
        {children ?? (
          <div className="space-y-2">
            <p>
              UOA Course Planner is an independent student-created platform. This website is not
              affiliated with, endorsed by, or operated by the University of Auckland.
            </p>
            <p>
              Course information is sourced from publicly available university catalogues and may
              be incomplete or outdated. Please verify important information using official
              University of Auckland sources.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
