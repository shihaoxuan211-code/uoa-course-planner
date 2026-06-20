export interface DegreeTemplate {
  degree: string;
  major: string;
  requiredCourses: string[];
  stage2Courses: string[];
  stage3Courses: string[];
  totalPoints: number;
  description?: string;
}

export type TemplateKey =
  | "bcom-management"
  | "bcom-marketing"
  | "bcom-infosys"
  | "bcom-intbus"
  | "bsc-compsci"
  | "eng-software";

export const degreeTemplates: Record<TemplateKey, DegreeTemplate> = {
  // ── BCom ────────────────────────────────────────────────────────────
  "bcom-management": {
    degree: "BCom",
    major: "Management",
    requiredCourses: [
      "BUSINESS 111", "BUSINESS 112", "BUSINESS 114", "BUSINESS 115",
      "INFOSYS 110", "STATS 108", "ECON 151",
    ],
    stage2Courses: [
      "MGMT 211", "MGMT 223",
    ],
    stage3Courses: [
      "MGMT 302", "MGMT 309",
      "BUSINESS 301",
    ],
    totalPoints: 360,
    description: "BCom majoring in Management — core business plus management specialisation"
  },

  "bcom-marketing": {
    degree: "BCom",
    major: "Marketing",
    requiredCourses: [
      "BUSINESS 111", "BUSINESS 112", "BUSINESS 114", "BUSINESS 115",
      "INFOSYS 110", "STATS 108",
    ],
    stage2Courses: [
      "MKTG 151", "MKTG 202",
    ],
    stage3Courses: [
      "MKTG 301", "MKTG 302", "MKTG 303",
    ],
    totalPoints: 360,
    description: "BCom majoring in Marketing"
  },

  "bcom-infosys": {
    degree: "BCom",
    major: "Information Systems",
    requiredCourses: [
      "BUSINESS 111", "BUSINESS 112", "BUSINESS 114", "BUSINESS 115",
      "INFOSYS 110",
    ],
    stage2Courses: [
      "INFOSYS 220", "INFOSYS 222",
    ],
    stage3Courses: [
      "INFOSYS 300", "INFOSYS 303", "INFOSYS 304",
    ],
    totalPoints: 360,
    description: "BCom majoring in Information Systems"
  },

  "bcom-intbus": {
    degree: "BCom",
    major: "International Business",
    requiredCourses: [
      "BUSINESS 111", "BUSINESS 112", "BUSINESS 114", "BUSINESS 115",
      "INFOSYS 110", "STATS 108",
    ],
    stage2Courses: [
      "INTBUS 151", "INTBUS 201", "INTBUS 202",
    ],
    stage3Courses: [
      "INTBUS 305", "INTBUS 306", "INTBUS 333",
    ],
    totalPoints: 360,
    description: "BCom majoring in International Business"
  },

  // ── BSc ─────────────────────────────────────────────────────────────
  "bsc-compsci": {
    degree: "BSc",
    major: "Computer Science",
    requiredCourses: [
      "COMPSCI 101", "COMPSCI 110", "COMPSCI 120", "COMPSCI 130",
      "MATHS 102", "MATHS 108", "STATS 101",
    ],
    stage2Courses: [
      "COMPSCI 210", "COMPSCI 215", "COMPSCI 220", "COMPSCI 225", "COMPSCI 230", "COMPSCI 235",
    ],
    stage3Courses: [
      "COMPSCI 313", "COMPSCI 315", "COMPSCI 316", "COMPSCI 320",
      "COMPSCI 331", "COMPSCI 335", "COMPSCI 340", "COMPSCI 345",
      "COMPSCI 350", "COMPSCI 351", "COMPSCI 361",
    ],
    totalPoints: 360,
    description: "BSc majoring in Computer Science"
  },

  // ── Engineering ─────────────────────────────────────────────────────
  "eng-software": {
    degree: "Engineering",
    major: "Software Engineering",
    requiredCourses: [
      "ENGGEN 101", "ENGGEN 102", "ENGGEN 103",
      "ENGSCI 111",
      "COMPSCI 101", "COMPSCI 110",
    ],
    stage2Courses: [
      "SOFTENG 206", "SOFTENG 283",
      "COMPSCI 210", "COMPSCI 220", "COMPSCI 225", "COMPSCI 230",
      "ENGSCI 211", "ENGSCI 213",
    ],
    stage3Courses: [
      "SOFTENG 350", "SOFTENG 351",
      "COMPSCI 313", "COMPSCI 320", "COMPSCI 331", "COMPSCI 335", "COMPSCI 340",
      "ENGSCI 311", "ENGSCI 313", "ENGSCI 314",
    ],
    totalPoints: 480,
    description: "BE(Hons) majoring in Software Engineering"
  },
};

/** Resolve a template from user input */
export function resolveTemplate(
  degree: string,
  major: string
): DegreeTemplate | undefined {
  const deg = degree.trim().toLowerCase();
  const maj = major.trim().toLowerCase();

  if (deg.includes("bcom") && maj.includes("management")) return degreeTemplates["bcom-management"];
  if (deg.includes("bcom") && maj.includes("marketing")) return degreeTemplates["bcom-marketing"];
  if (deg.includes("bcom") && maj.includes("information") || maj.includes("infosys")) return degreeTemplates["bcom-infosys"];
  if (deg.includes("bcom") && maj.includes("international") || maj.includes("intbus")) return degreeTemplates["bcom-intbus"];
  if ((deg.includes("bsc") || deg.includes("science")) && (maj.includes("computer") || maj.includes("compsci"))) return degreeTemplates["bsc-compsci"];
  if ((deg.includes("engin") || deg.includes("be")) && (maj.includes("software") || maj.includes("softeng"))) return degreeTemplates["eng-software"];

  return undefined;
}
