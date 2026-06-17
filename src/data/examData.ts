import type { HistoricalExam } from "@/types/course";

interface ExamPatternsFile {
  _note?: string;
  _source?: string;
  _lastUpdated?: string;
  exams: Record<string, HistoricalExam[]>;
}

/**
 * Reads exam-patterns.json and returns a Map from course code → exam records.
 * Exam data is stored separately from course data (generated-courses.json).
 * All records are sample data — clearly marked as such with sourceNote.
 */
export function readExamPatternsData(): Map<string, HistoricalExam[]> {
  // Dynamic import is not available at module scope in this context;
  // the file is read via fs in courses.ts which calls this function.
  // We export a pure function that the data layer calls with raw JSON.
  return new Map();
}

/**
 * Loads exam patterns from the raw JSON file content.
 * Validates that each entry conforms to HistoricalExam structure.
 */
export function parseExamPatterns(raw: unknown): Map<string, HistoricalExam[]> {
  const result = new Map<string, HistoricalExam[]>();

  if (!raw || typeof raw !== "object") {
    console.warn("exam-patterns.json: expected an object.");
    return result;
  }

  const data = raw as Record<string, unknown>;
  const examsRaw = data.exams;

  if (!examsRaw || typeof examsRaw !== "object" || Array.isArray(examsRaw)) {
    console.warn("exam-patterns.json: missing or invalid 'exams' field.");
    return result;
  }

  const exams = examsRaw as Record<string, unknown>;

  for (const [code, entries] of Object.entries(exams)) {
    if (!Array.isArray(entries)) {
      console.warn(`exam-patterns.json: skipping ${code} — expected an array.`);
      continue;
    }

    const validExams: HistoricalExam[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry || typeof entry !== "object") {
        continue;
      }

      const exam = entry as Record<string, unknown>;

      // Validate required fields
      if (typeof exam.year !== "number" || !Number.isInteger(exam.year)) {
        console.warn(`exam-patterns.json: skipping ${code}[${i}] — invalid year.`);
        continue;
      }

      if (typeof exam.semester !== "string") {
        console.warn(`exam-patterns.json: skipping ${code}[${i}] — invalid semester.`);
        continue;
      }

      if (typeof exam.mode !== "string" || !["A", "B", "C", "D"].includes(exam.mode)) {
        console.warn(`exam-patterns.json: skipping ${code}[${i}] — invalid mode.`);
        continue;
      }

      validExams.push({
        year: exam.year as number,
        semester: exam.semester as HistoricalExam["semester"],
        date: typeof exam.date === "string" ? exam.date : "",
        mode: exam.mode as HistoricalExam["mode"],
        format: typeof exam.format === "string" ? exam.format : "Unknown",
        locationType: typeof exam.locationType === "string" ? exam.locationType : "Unknown",
        duration: typeof exam.duration === "string" ? exam.duration : "Unknown",
        materials: typeof exam.materials === "string" ? exam.materials : "Unknown",
        sourceNote:
          typeof exam.sourceNote === "string"
            ? exam.sourceNote
            : "Sample exam timetable data — verify with official UOA sources"
      });
    }

    if (validExams.length > 0) {
      result.set(code, validExams);
    }
  }

  return result;
}
