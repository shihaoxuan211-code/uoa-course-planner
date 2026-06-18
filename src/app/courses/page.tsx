import { CoursesPageClient } from "@/components/CoursesPageClient";
import { courseDataSource, courses } from "@/data/courses";
import { getCourseReview } from "@/data/reviewData";
import { getDifficulty } from "@/lib/difficultyEstimator";

export default function CoursesPage() {
  // Build difficulty map for ALL courses (real review data or estimated)
  const difficultyMap = new Map<string, number>();
  for (const course of courses) {
    const review = getCourseReview(course.code);
    const info = getDifficulty(course, review?.ratings);
    if (info.level > 0) {
      difficultyMap.set(course.code, info.level);
    }
  }

  return (
    <CoursesPageClient
      courses={courses}
      difficultyMap={difficultyMap}
      dataSource={courseDataSource}
    />
  );
}
