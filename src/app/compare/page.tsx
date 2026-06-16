import { ComparisonTable } from "@/components/ComparisonTable";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { courses } from "@/data/courses";

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Course Comparison</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Compare courses</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Compare 2 to 4 sample courses using planning fields such as workload, assessment, final exam
          status, historical exam mode, and notes.
        </p>
      </div>

      <DisclaimerBox>
        <p>
          Comparison data is planning information only. Imported course data is based on public catalogue
          information and may be incomplete or outdated. Please verify all information with official University
          of Auckland sources before making enrolment decisions.
        </p>
      </DisclaimerBox>

      <ComparisonTable courses={courses} />
    </main>
  );
}
