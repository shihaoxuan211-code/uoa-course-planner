import fs from "node:fs";
import path from "node:path";
import { normalizeImportedCourses } from "@/lib/importedCourseValidation";
import type { Course } from "@/types/course";

const sampleSourceNote =
  "Sample mock data for MVP planning only. This is not official University of Auckland data and may not match current catalogue or exam timetable details.";

export const mockCourses: Course[] = [
  {
    id: "busan-300",
    code: "BUSAN 300",
    title: "Applied Business Analytics",
    subject: "BUSAN",
    faculty: "Business School",
    stage: 3,
    points: 15,
    semesters: ["Semester 2"],
    description:
      "Sample course record about applying analytics techniques to business problems, including dashboards, model interpretation, and communicating insights.",
    prerequisites: "Sample prerequisite: 30 points at Stage 2 in Business Analytics or related quantitative study.",
    restrictions: "Sample restriction: May overlap with other advanced analytics project courses.",
    workload: "About 10 hours per week including labs, readings, and project work.",
    assessments: [
      { type: "Individual analytics tasks", weight: "30%" },
      { type: "Group project", weight: "30%" },
      { type: "Final exam", weight: "40%" }
    ],
    hasFinalExam: true,
    hasGroupWork: true,
    notes: "Project tools and assessment weighting are sample values. Confirm the live outline before choosing.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 2",
        date: "2025-11-05",
        mode: "D",
        format: "Digital exam with mixed short-answer and applied case questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-11-02",
        mode: "D",
        format: "Digital exam with applied business scenario questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Semester 2",
        date: "2023-10-28",
        mode: "A",
        format: "Online exam with case analysis questions",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "intbus-305",
    code: "INTBUS 305",
    title: "Global Strategy and Innovation",
    subject: "INTBUS",
    faculty: "Business School",
    stage: 3,
    points: 15,
    semesters: ["Semester 1"],
    description:
      "Sample course record covering international strategy, innovation choices, and operating across global markets.",
    prerequisites: "Sample prerequisite: 30 points at Stage 2 in International Business or Management.",
    restrictions: "Sample restriction: None listed in this MVP data.",
    workload: "About 10 hours per week with readings, case preparation, and seminars.",
    assessments: [
      { type: "Case analysis", weight: "25%" },
      { type: "Group presentation", weight: "25%" },
      { type: "Final exam", weight: "50%" }
    ],
    hasFinalExam: true,
    hasGroupWork: true,
    notes: "Case topics are sample only. Check the official course outline for current assessment design.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 1",
        date: "2025-06-18",
        mode: "A",
        format: "Online essay-style case exam",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 1",
        date: "2024-06-20",
        mode: "A",
        format: "Online applied strategy questions",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Semester 1",
        date: "2023-06-16",
        mode: "A",
        format: "Online short essays and case analysis",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "intbus-333",
    code: "INTBUS 333",
    title: "Managing Across Cultures",
    subject: "INTBUS",
    faculty: "Business School",
    stage: 3,
    points: 15,
    semesters: ["Semester 2"],
    description:
      "Sample course record on cultural frameworks, cross-border teamwork, negotiation, and international management practice.",
    prerequisites: "Sample prerequisite: 30 points at Stage 2 in International Business or related study.",
    restrictions: "Sample restriction: None listed in this MVP data.",
    workload: "About 10 hours per week including readings, tutorials, and reflection tasks.",
    assessments: [
      { type: "Reflection portfolio", weight: "30%" },
      { type: "Team report", weight: "30%" },
      { type: "Final exam", weight: "40%" }
    ],
    hasFinalExam: true,
    hasGroupWork: true,
    notes: "Group-work intensity is sample information and should be checked against the current outline.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 2",
        date: "2025-10-31",
        mode: "B",
        format: "Online invigilated exam with scenario questions",
        locationType: "Online",
        duration: "2 hours",
        materials: "Restricted open book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-10-29",
        mode: "B",
        format: "Online invigilated case-based exam",
        locationType: "Online",
        duration: "2 hours",
        materials: "Restricted open book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Semester 2",
        date: "2023-10-30",
        mode: "A",
        format: "Online case response exam",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "infosys-222",
    code: "INFOSYS 222",
    title: "Database Systems",
    subject: "INFOSYS",
    faculty: "Business School",
    stage: 2,
    points: 15,
    semesters: ["Semester 1", "Semester 2"],
    description:
      "Sample course record introducing relational data modelling, SQL, database design, and information systems data foundations.",
    prerequisites: "Sample prerequisite: INFOSYS 110 or equivalent introductory information systems study.",
    restrictions: "Sample restriction: May overlap with other introductory database courses.",
    workload: "About 10 hours per week including labs, SQL practice, readings, and revision.",
    assessments: [
      { type: "Lab exercises", weight: "25%" },
      { type: "Database design assignment", weight: "25%" },
      { type: "Final exam", weight: "50%" }
    ],
    hasFinalExam: true,
    hasGroupWork: false,
    notes: "Students usually benefit from regular SQL practice. Assessment mix is sample data only.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 2",
        date: "2025-11-03",
        mode: "D",
        format: "Digital exam with SQL and design questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-11-04",
        mode: "D",
        format: "Digital exam with short answer and query writing",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Semester 1",
        date: "2023-06-21",
        mode: "C",
        format: "Paper exam with database design and SQL questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "comlaw-201",
    code: "COMLAW 201",
    title: "Commercial Law",
    subject: "COMLAW",
    faculty: "Business School",
    stage: 2,
    points: 15,
    semesters: ["Semester 1", "Semester 2"],
    description:
      "Sample course record covering legal concepts for business, contracts, obligations, and commercial decision-making.",
    prerequisites: "Sample prerequisite: 30 points passed at Stage 1.",
    restrictions: "Sample restriction: May overlap with other introductory commercial law courses.",
    workload: "About 10 hours per week including lectures, tutorials, legal reading, and exam preparation.",
    assessments: [
      { type: "Online quiz", weight: "10%" },
      { type: "Problem question assignment", weight: "30%" },
      { type: "Final exam", weight: "60%" }
    ],
    hasFinalExam: true,
    hasGroupWork: false,
    notes: "Law exam format can change by semester. Use this only as planning sample data.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 1",
        date: "2025-06-12",
        mode: "C",
        format: "Paper exam with legal problem questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-10-26",
        mode: "C",
        format: "Paper exam with essay and problem questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Semester 1",
        date: "2023-06-14",
        mode: "C",
        format: "Paper exam with applied legal questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "mktg-202",
    code: "MKTG 202",
    title: "Marketing Research",
    subject: "MKTG",
    faculty: "Business School",
    stage: 2,
    points: 15,
    semesters: ["Semester 2"],
    description:
      "Sample course record on research design, survey thinking, consumer insight, and interpreting marketing data.",
    prerequisites: "Sample prerequisite: MKTG 151 or equivalent introductory marketing study.",
    restrictions: "Sample restriction: None listed in this MVP data.",
    workload: "About 10 hours per week with readings, research exercises, and analysis practice.",
    assessments: [
      { type: "Research proposal", weight: "25%" },
      { type: "Group research report", weight: "35%" },
      { type: "Final exam", weight: "40%" }
    ],
    hasFinalExam: true,
    hasGroupWork: true,
    notes: "Historical exam pattern is intentionally mixed in the sample data to test the UI.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 2",
        date: "2025-10-27",
        mode: "A",
        format: "Online applied research questions",
        locationType: "Online",
        duration: "2 hours",
        materials: "Open book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-10-30",
        mode: "B",
        format: "Online invigilated exam with short-answer questions",
        locationType: "Online",
        duration: "2 hours",
        materials: "Restricted open book",
        sourceNote: sampleSourceNote
      }
    ]
  },
  {
    id: "mgmt-223",
    code: "MGMT 223",
    title: "Understanding Work and People",
    subject: "MGMT",
    faculty: "Business School",
    stage: 2,
    points: 15,
    semesters: ["Semester 1"],
    description:
      "Sample course record introducing work, teams, motivation, leadership, and organisational behaviour concepts.",
    prerequisites: "Sample prerequisite: 30 points passed at Stage 1.",
    restrictions: "Sample restriction: None listed in this MVP data.",
    workload: "About 10 hours per week including readings, tutorial preparation, and writing tasks.",
    assessments: [
      { type: "Reflection tasks", weight: "30%" },
      { type: "Team activity report", weight: "30%" },
      { type: "Individual essay", weight: "40%" }
    ],
    hasFinalExam: false,
    hasGroupWork: true,
    notes: "This sample course has no historical exam records so the empty-state behaviour can be checked.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: []
  },
  {
    id: "acctg-102",
    code: "ACCTG 102",
    title: "Accounting Concepts",
    subject: "ACCTG",
    faculty: "Business School",
    stage: 1,
    points: 15,
    semesters: ["Semester 1", "Semester 2", "Summer School"],
    description:
      "Sample course record introducing accounting concepts, business transactions, financial statements, and decision-useful reporting.",
    prerequisites: "Sample prerequisite: None in this MVP data.",
    restrictions: "Sample restriction: May overlap with other introductory accounting courses.",
    workload: "About 10 hours per week including lectures, practice questions, and revision.",
    assessments: [
      { type: "Weekly practice tasks", weight: "20%" },
      { type: "Mid-semester test", weight: "30%" },
      { type: "Final exam", weight: "50%" }
    ],
    hasFinalExam: true,
    hasGroupWork: false,
    notes: "Large introductory courses can have different delivery and assessment settings across terms.",
    sourceNote: sampleSourceNote,
    dataSource: "mock",
    historicalExams: [
      {
        year: 2025,
        semester: "Semester 1",
        date: "2025-06-10",
        mode: "C",
        format: "Paper exam with calculations and short-answer questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2024,
        semester: "Semester 2",
        date: "2024-10-24",
        mode: "C",
        format: "Paper exam with applied accounting questions",
        locationType: "In-person exam room",
        duration: "2 hours",
        materials: "Closed book",
        sourceNote: sampleSourceNote
      },
      {
        year: 2023,
        semester: "Summer School",
        date: "2023-02-15",
        mode: "B",
        format: "Online invigilated exam with calculations",
        locationType: "Online",
        duration: "2 hours",
        materials: "Restricted open book",
        sourceNote: sampleSourceNote
      }
    ]
  }
];

function readGeneratedCourseData() {
  const generatedPath = path.join(process.cwd(), "src", "data", "generated-courses.json");

  if (!fs.existsSync(generatedPath)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(generatedPath, "utf8")) as unknown;
  } catch (error) {
    console.warn(
      `Could not read generated-courses.json. Falling back to mock courses. ${
        error instanceof Error ? error.message : ""
      }`
    );
    return [];
  }
}

const importedCourses = normalizeImportedCourses(readGeneratedCourseData());

export const courseDataSource = importedCourses.length > 0 ? "imported" : "mock";
export const courses: Course[] = importedCourses.length > 0 ? importedCourses : mockCourses;

export function getCourseById(id: string) {
  return courses.find((course) => course.id === id);
}
