import { FavoritesPageClient } from "@/components/FavoritesPageClient";
import { courses } from "@/data/courses";
import { getDifficulty } from "@/lib/difficultyEstimator";
import { getCourseReview } from "@/data/reviewData";

export default function FavoritesPage() {
  const difficultyMap = new Map<string, number>();
  for (const course of courses) {
    const review = getCourseReview(course.code);
    const diff = getDifficulty(course, review?.ratings);
    if (diff.level > 0) difficultyMap.set(course.code, diff.level);
  }
  return <FavoritesPageClient courses={courses} difficultyMap={difficultyMap} />;
}
