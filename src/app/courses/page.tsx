import { DisclaimerBox } from "@/components/DisclaimerBox";
import { CourseExplorer } from "@/components/CourseExplorer";
import { courseDataSource, courses } from "@/data/courses";
import { getCourseReview } from "@/data/reviewData";

export default function CoursesPage() {
  // Build difficulty map from review data on the server
  const difficultyMap = new Map<string, number>();
  for (const course of courses) {
    const review = getCourseReview(course.code);
    if (review) {
      difficultyMap.set(course.code, review.ratings.difficulty);
    }
  }

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
      <CourseExplorer courses={courses} difficultyMap={difficultyMap} />
    </main>
  );
}
