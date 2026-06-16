import type { Course, Semester } from "@/types/course";

export interface CourseFilters {
  query: string;
  subject: string;
  semester: string;
  stage: string;
}

export function filterCourses(courses: Course[], filters: CourseFilters) {
  const query = filters.query.trim().toLowerCase().replace(/\s+/g, " ");

  return courses.filter((course) => {
    const code = course.code.toLowerCase();
    const title = course.title.toLowerCase();
    const matchesQuery = query.length === 0 || code.includes(query) || title.includes(query);
    const matchesSubject = filters.subject === "all" || course.subject === filters.subject;
    const matchesSemester =
      filters.semester === "all" || course.semesters.includes(filters.semester as Semester);
    const matchesStage = filters.stage === "all" || String(course.stage) === filters.stage;

    return matchesQuery && matchesSubject && matchesSemester && matchesStage;
  });
}

export function uniqueSubjects(courses: Course[]) {
  return [...new Set(courses.map((course) => course.subject))].sort();
}

export function uniqueSemesters(courses: Course[]) {
  return [...new Set(courses.flatMap((course) => course.semesters))].sort();
}

export function uniqueStages(courses: Course[]) {
  return [...new Set(courses.map((course) => course.stage))].sort((a, b) => a - b);
}
