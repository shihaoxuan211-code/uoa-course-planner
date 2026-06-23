export type ExamMode = "A" | "B" | "C" | "D";

export type Semester =
  | "Semester 1"
  | "Semester 2"
  | "Summer School"
  | "Quarter 1"
  | "Quarter 2"
  | "Quarter 3"
  | "Quarter 4"
  | "Information unavailable";

export interface AssessmentItem {
  type: string;
  weight: string;
}

export interface HistoricalExam {
  year: number;
  semester: Semester;
  date: string;
  mode: ExamMode;
  format: string;
  locationType: string;
  duration: string;
  materials: string;
  sourceNote: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  subject: string;
  faculty: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  points: number;
  semesters: Semester[];
  description: string;
  prerequisites: string;
  restrictions: string;
  workload: string;
  assessments: AssessmentItem[];
  hasFinalExam: boolean;
  hasGroupWork: boolean;
  notes: string;
  sourceNote: string;
  sourceUrl?: string;
  sourceFetchedAt?: string;
  dataSource?: "mock" | "imported";
  dataQuality?: "full" | "basic";
  historicalExams: HistoricalExam[];
}

export interface ImportedAssessmentItem {
  type?: string;
  weight?: string;
}

export interface ReviewRatings {
  difficulty: number;
  workload: number;
  enjoyment: number;
  usefulness: number;
}

export interface CourseReview {
  ratings: ReviewRatings;
  positiveComments: string[];
  negativeComments: string[];
  tipsForFutureStudents: string;
}

export interface ImportedCourse {
  id?: string;
  code?: string;
  title?: string;
  subject?: string;
  faculty?: string;
  stage?: number;
  points?: number;
  semesters?: string[];
  description?: string;
  prerequisites?: string;
  restrictions?: string;
  workload?: string;
  assessments?: ImportedAssessmentItem[];
  hasFinalExam?: boolean;
  hasGroupWork?: boolean;
  sourceUrl?: string;
  sourceFetchedAt?: string;
  dataQuality?: "full" | "basic";
}
