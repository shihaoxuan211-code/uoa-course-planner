import type { Course } from "@/types/course";

export type DifficultySource = "real" | "estimated" | "unknown";

export interface DifficultyInfo {
  level: number;         // 1-5
  source: DifficultySource;
  label: string;
}

/**
 * Generate estimated difficulty for courses without real review data.
 * Uses: stage, hasFinalExam, hasGroupWork, assessment count.
 * Clearly marked as estimated, not student review data.
 */
export function estimateDifficulty(course: Course): DifficultyInfo {
  let level = 1;

  // Stage-based baseline
  if (course.stage === 1) level = 2;
  else if (course.stage === 2) level = 3;
  else if (course.stage === 3) level = 4;
  else level = 4; // Stage 4+ postgraduate

  // Final exam increases difficulty
  if (course.hasFinalExam) level = Math.min(5, level + 1);

  // Group work adds coordination complexity
  if (course.hasGroupWork) level = Math.min(5, level + 1);

  // Many assessments → more difficulty
  if (course.assessments.length >= 5) level = Math.min(5, level + 1);

  // No assessment data but have stage → still estimate from stage
  const sourceNote = course.assessments.length === 0
    ? "(based on stage only — no assessment data)"
    : "";

  return {
    level,
    source: course.assessments.length === 0 ? "estimated" : "estimated",
    label: `Estimated${sourceNote}: ${"★".repeat(level)}${"☆".repeat(5 - level)}`
  };
}

/**
 * Get difficulty for a course — real review data takes priority.
 * Falls back to estimated difficulty. Returns unknown if neither available.
 */
export function getDifficulty(
  course: Course,
  realReview?: { difficulty: number }
): DifficultyInfo {
  // Real review data exists → use it
  if (realReview && realReview.difficulty >= 1 && realReview.difficulty <= 5) {
    const level = realReview.difficulty;
    return {
      level,
      source: "real",
      label: `${"★".repeat(level)}${"☆".repeat(5 - level)}`
    };
  }

  // No real data → estimate
  return estimateDifficulty(course);
}
