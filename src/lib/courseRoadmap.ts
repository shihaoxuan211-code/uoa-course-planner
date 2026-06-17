import type { Course } from "@/types/course";

export interface RoadmapData {
  prerequisites: Course[];          // courses this course requires (in dataset)
  leadsTo: Course[];                 // courses that list this course as prereq
  pathwayLabel: string;              // e.g. "Business Analytics"
  isEntryPoint: boolean;            // no prereqs in dataset (Stage 1 / foundational)
  isTerminal: boolean;              // nothing leads to this (capstone / end of chain)
  allPrereqCodes: string[];        // all prereq codes mentioned (including those not in dataset)
}

const COURSE_RE = /[A-Z]{2,10}\s\d{3}[A-Z]*/g;

const PATHWAY_LABELS: Record<string, string> = {
  BUSAN: "Business Analytics",
  INTBUS: "International Business",
  COMLAW: "Commercial Law",
  MGMT: "Management",
  MKTG: "Marketing",
  ACCTG: "Accounting",
  ECON: "Economics",
  INFOSYS: "Information Systems",
  FINANCE: "Finance",
  PROPERTY: "Property",
  BUSINESS: "Business",
  OPSMGT: "Operations & Supply Chain Mgmt"
};

function extractCodes(text: string): string[] {
  if (!text || text === "Not available") return [];
  return [...new Set((text.match(COURSE_RE) || []))];
}

export function computeRoadmap(course: Course, allCourses: Course[]): RoadmapData {
  // Prerequisites of THIS course
  const allPrereqCodes = extractCodes(course.prerequisites);
  const prerequisites = allCourses.filter((c) => allPrereqCodes.includes(c.code));

  // Courses that list THIS course as a prerequisite
  const leadsTo = allCourses.filter((c) => {
    const reqs = extractCodes(c.prerequisites);
    return reqs.includes(course.code);
  });

  const pathwayLabel = PATHWAY_LABELS[course.subject] || course.subject;

  return {
    prerequisites,
    leadsTo,
    pathwayLabel,
    isEntryPoint: prerequisites.length === 0 && allPrereqCodes.length === 0,
    isTerminal: leadsTo.length === 0,
    allPrereqCodes
  };
}

/** Build a multi-hop chain: all ancestors and descendants */
export interface ChainNode {
  course: Course;
  depth: number; // negative = ancestor, 0 = current, positive = descendant
}

export function buildFullChain(course: Course, allCourses: Course[]): ChainNode[] {
  const nodes: ChainNode[] = [];
  const seen = new Set<string>();

  // BFS upward (ancestors / prerequisites)
  const upQueue: Array<{ code: string; depth: number }> = [];
  extractCodes(course.prerequisites).forEach((code) => {
    upQueue.push({ code, depth: -1 });
  });

  while (upQueue.length > 0) {
    const { code, depth } = upQueue.shift()!;
    if (seen.has(code)) continue;
    seen.add(code);

    const c = allCourses.find((x) => x.code === code);
    if (c) {
      nodes.push({ course: c, depth });
      extractCodes(c.prerequisites).forEach((req) => {
        if (!seen.has(req)) upQueue.push({ code: req, depth: depth - 1 });
      });
    }
  }

  // Current course
  nodes.push({ course, depth: 0 });

  // BFS downward (descendants / lead-to)
  const downQueue: Array<{ code: string; depth: number }> = [];
  seen.add(course.code);
  allCourses.forEach((c) => {
    if (extractCodes(c.prerequisites).includes(course.code) && !seen.has(c.code)) {
      downQueue.push({ code: c.code, depth: 1 });
    }
  });

  while (downQueue.length > 0) {
    const { code, depth } = downQueue.shift()!;
    if (seen.has(code)) continue;
    seen.add(code);

    const c = allCourses.find((x) => x.code === code);
    if (c) {
      nodes.push({ course: c, depth });
      allCourses.forEach((other) => {
        if (extractCodes(other.prerequisites).includes(c.code) && !seen.has(other.code)) {
          downQueue.push({ code: other.code, depth: depth + 1 });
        }
      });
    }
  }

  return nodes.sort((a, b) => a.depth - b.depth);
}
