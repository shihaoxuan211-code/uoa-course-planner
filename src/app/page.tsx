import { HomePageClient } from "@/components/HomePageClient";
import { courses } from "@/data/courses";
import { getCourseReview } from "@/data/reviewData";
import { getDifficulty } from "@/lib/difficultyEstimator";
import type { Course } from "@/types/course";

export default function HomePage() {
  const difficultyMap = new Map<string, number>();
  const reviewedCodes = new Set<string>();
  // Pre-compute review snippets server-side
  const reviewSnippets: { course: Course; comment: string }[] = [];

  for (const course of courses) {
    const review = getCourseReview(course.code);
    const diff = getDifficulty(course, review?.ratings);
    if (diff.level > 0) difficultyMap.set(course.code, diff.level);
    if (review) reviewedCodes.add(course.code);

    if (review && reviewSnippets.length < 4) {
      const comment = review.positiveComments?.[0] ?? review.negativeComments?.[0] ?? review.tipsForFutureStudents ?? "";
      if (comment) reviewSnippets.push({ course, comment });
    }
  }

  return (
    <HomePageClient
      courses={courses}
      difficultyMap={difficultyMap}
      reviewSnippets={reviewSnippets}
    />
  );
}
