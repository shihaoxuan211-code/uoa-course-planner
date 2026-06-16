import { DisclaimerBox } from "@/components/DisclaimerBox";
import { PlanSummary } from "@/components/PlanSummary";
import { courses } from "@/data/courses";

export default function PlanPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">My Course Plan</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Saved courses</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Your selected courses are stored in this browser with localStorage. No login is required.
        </p>
      </div>

      <DisclaimerBox>
        <p>
          This plan is a local planning draft only. Imported course data is based on public catalogue
          information and may be incomplete or outdated. Please verify all information with official
          University of Auckland sources before making enrolment decisions.
        </p>
      </DisclaimerBox>

      <PlanSummary courses={courses} />
    </main>
  );
}
