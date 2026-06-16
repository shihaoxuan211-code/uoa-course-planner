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
              This information is for planning reference only. Please confirm details with the official
              University of Auckland course catalogue and exam timetable.
            </p>
            <p>
              Imported course data is based on public catalogue information and may be incomplete or outdated.
              Please verify all information with official University of Auckland sources before making enrolment
              decisions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
