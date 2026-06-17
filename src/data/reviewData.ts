import fs from "node:fs";
import path from "node:path";
import type { CourseReview, ReviewRatings } from "@/types/course";

interface ReviewDataFile {
  _note?: string;
  _lastUpdated?: string;
  reviews: Record<string, CourseReview>;
}

let reviewMap: Map<string, CourseReview> | null = null;

function loadReviews(): Map<string, CourseReview> {
  if (reviewMap) return reviewMap;

  const filePath = path.join(process.cwd(), "src", "data", "course-reviews.json");
  const map = new Map<string, CourseReview>();

  if (!fs.existsSync(filePath)) {
    console.warn("course-reviews.json not found. No review data will be shown.");
    reviewMap = map;
    return map;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as ReviewDataFile;
    const reviews = raw.reviews;

    if (!reviews || typeof reviews !== "object") {
      reviewMap = map;
      return map;
    }

    for (const [code, review] of Object.entries(reviews)) {
      if (!review || typeof review !== "object") continue;
      const r = review as unknown as Record<string, unknown>;

      const ratings = r.ratings as Record<string, unknown> | undefined;
      if (!ratings || typeof ratings.difficulty !== "number") continue;

      const validated: CourseReview = {
        ratings: {
          difficulty: clampRating(ratings.difficulty),
          workload: clampRating(ratings.workload),
          enjoyment: clampRating(ratings.enjoyment),
          usefulness: clampRating(ratings.usefulness)
        },
        positiveComments: stringArray(r.positiveComments),
        negativeComments: stringArray(r.negativeComments),
        tipsForFutureStudents: typeof r.tipsForFutureStudents === "string"
          ? r.tipsForFutureStudents
          : ""
      };

      map.set(code, validated);
    }
  } catch (error) {
    console.warn(`Could not read course-reviews.json. ${
      error instanceof Error ? error.message : ""
    }`);
  }

  reviewMap = map;
  return map;
}

function clampRating(value: unknown): number {
  if (typeof value !== "number") return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function getCourseReview(code: string): CourseReview | undefined {
  const map = loadReviews();
  return map.get(code);
}

export function getAverageRating(code: string): ReviewRatings | undefined {
  const review = getCourseReview(code);
  return review?.ratings;
}

export function getAllReviewedCodes(): Set<string> {
  const map = loadReviews();
  return new Set(map.keys());
}
