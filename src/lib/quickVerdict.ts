import type { Course, ReviewRatings } from "@/types/course";

/** Generate a 2-sentence quick verdict for Simple Mode. */
export function generateQuickVerdict(
  course: Course,
  difficulty?: number,
  review?: ReviewRatings
): string {
  const parts: string[] = [];
  const subj = course.subject;

  // Sentence 1: what the course is good for
  const subjectLabels: Record<string, string> = {
    BUSAN: "business analytics and data-driven decision making",
    INTBUS: "international business and global strategy",
    INFOSYS: "information systems and digital business",
    COMLAW: "commercial law and legal aspects of business",
    MKTG: "marketing strategy and consumer insights",
    MGMT: "management and organisational behaviour",
    ACCTG: "accounting and financial reporting",
    ECON: "economics and policy analysis",
    FINANCE: "finance and investment management",
    COMPSCI: "computer science and software development",
    STATS: "statistics and data analysis",
    MATHS: "mathematics and quantitative reasoning",
    BIOSCI: "biological sciences and research",
    CHEM: "chemistry and laboratory science",
    PHYSICS: "physics and scientific problem-solving",
    PSYCH: "psychology and human behaviour",
    SOFTENG: "software engineering and system design",
    ENGSCI: "engineering science and applied mathematics",
    PROPERTY: "property and real estate",
    OPSMGT: "operations and supply chain management"
  };
  const subjLabel = subjectLabels[subj] || "this subject area";
  parts.push(`This course is useful for students interested in ${subjLabel}.`);

  // Sentence 2: workload/final exam/assessment summary
  const workloadNotes: string[] = [];
  if (course.assessments.length === 0) {
    workloadNotes.push("Assessment details are not publicly available");
  } else {
    if (!course.hasFinalExam) workloadNotes.push("there is no final exam");
    else workloadNotes.push("includes a final exam");

    if (course.hasGroupWork) workloadNotes.push("involves group work");
    if (course.assessments.length >= 5) workloadNotes.push("has multiple assessments");
  }

  if (difficulty && difficulty >= 4) workloadNotes.push("with above-average difficulty");
  else if (difficulty && difficulty <= 2) workloadNotes.push("with comparatively lighter difficulty");

  const workloadSummary = workloadNotes.join(" and ");
  parts.push(`The course ${workloadSummary}.`);

  return parts.join(" ");
}
