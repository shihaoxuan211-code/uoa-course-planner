import type { Course } from "@/types/course";

export interface SearchResult {
  course: Course;
  score: number; // higher = better match
  highlight: string; // course code with matching part wrapped in <mark>
}

/**
 * Case-insensitive, space-insensitive, partial-match search.
 * Exact code match gets highest priority.
 */
export function searchCourses(courses: Course[], query: string, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const course of courses) {
    const code = course.code.toLowerCase();
    const codeCompact = code.replace(/\s+/g, "");
    const title = course.title.toLowerCase();
    let score = 0;

    // Exact code match (ignoring spaces) — highest priority
    if (codeCompact === q) {
      score = 100;
    }
    // Code starts with query
    else if (codeCompact.startsWith(q)) {
      score = 80;
    }
    // Code contains query
    else if (codeCompact.includes(q)) {
      score = 60;
    }
    // Subject prefix match (e.g. "BUS" matches BUSAN, BUSINESS)
    else if (course.subject.toLowerCase().startsWith(q)) {
      score = 40;
    }
    // Title contains query words
    else if (title.includes(q) || title.includes(query.trim().toLowerCase())) {
      score = 30;
    }
    // Individual words in title start with query
    else {
      const words = title.split(/\s+/);
      if (words.some((w) => w.startsWith(q))) {
        score = 20;
      }
    }

    if (score > 0) {
      results.push({ course, score, highlight: highlightMatch(course.code, query.trim()) });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Check if query is an exact course code match (ignoring spaces) */
export function isExactCodeMatch(courses: Course[], query: string): Course | undefined {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  return courses.find((c) => c.code.toLowerCase().replace(/\s+/g, "") === q);
}

/** Wrap matching characters in <mark> tags for highlighting */
export function highlightMatch(text: string, query: string): string {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return text;
  const chars = text.split("");
  const lower = text.toLowerCase().replace(/\s+/g, "");
  let qi = 0;
  const result: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === " ") { result.push(c); continue; }
    if (qi < q.length && lower[i]?.toLowerCase() === q[qi]) {
      result.push(`<mark>${c}</mark>`);
      qi++;
    } else {
      result.push(c);
    }
  }
  return result.join("");
}

// Recent courses storage
const RECENT_KEY = "uoa-course-planner:recent-courses";

export function getRecentCourses(allCourses: Course[]): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw) as string[];
    return ids.map((id) => allCourses.find((c) => c.id === id)).filter(Boolean) as Course[];
  } catch { return []; }
}

/** Find similar courses — same subject, then same faculty, prefer same stage */
export function getSimilarCourses(course: Course, allCourses: Course[], limit = 6): Course[] {
  const sameSubject = allCourses.filter((c) => c.id !== course.id && c.subject === course.subject);
  const sorted = sameSubject.sort((a, b) => {
    const aStage = Math.abs(a.stage - course.stage);
    const bStage = Math.abs(b.stage - course.stage);
    return aStage - bStage;
  });
  if (sorted.length >= limit) return sorted.slice(0, limit);
  // Fill with same-faculty courses
  const seen = new Set(sorted.map((c) => c.code));
  const sameFaculty = allCourses.filter((c) => c.id !== course.id && c.faculty === course.faculty && !seen.has(c.code));
  return [...sorted, ...sameFaculty].slice(0, limit);
}

export function pushRecentCourse(courseId: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const next = [courseId, ...ids.filter((id) => id !== courseId)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}
