import { DisclaimerBox } from "@/components/DisclaimerBox";
import { CourseExplorer } from "@/components/CourseExplorer";
import { courseDataSource, courses } from "@/data/courses";

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Course search</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Browse courses</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Search by course code or title, then narrow results by subject, semester, and stage.
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Current data source: {courseDataSource === "imported" ? "Imported public catalogue data" : "Mock fallback data"}
        </p>
      </div>
      <div className="mb-6">
        <DisclaimerBox>
          <p>
            Imported course data is based on public catalogue information and may be incomplete or outdated.
            Please verify all information with official University of Auckland sources before making enrolment decisions.
          </p>
        </DisclaimerBox>
      </div>
      <CourseExplorer courses={courses} />
    </main>
  );
}
