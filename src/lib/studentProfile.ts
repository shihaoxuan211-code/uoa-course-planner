/** Assumed completed courses based on student year + major.
 *  These are NOT confirmed completions — the user must manually confirm them.
 */

export type StudentYear = "first" | "second" | "third" | "fourth-plus";

export type StudentMajor =
  | "accounting"
  | "business-analytics"
  | "commercial-law"
  | "economics"
  | "finance"
  | "information-systems"
  | "international-business"
  | "management"
  | "marketing"
  | "operations-supply-chain"
  | "property"
  | "general-bcom"
  | "undecided";

export const YEAR_LABELS: Record<StudentYear, string> = {
  first: "First Year",
  second: "Second Year",
  third: "Third Year",
  "fourth-plus": "Fourth Year+"
};

export const MAJOR_LABELS: Record<StudentMajor, string> = {
  accounting: "Accounting",
  "business-analytics": "Business Analytics",
  "commercial-law": "Commercial Law",
  economics: "Economics",
  finance: "Finance",
  "information-systems": "Information Systems",
  "international-business": "International Business",
  management: "Management",
  marketing: "Marketing",
  "operations-supply-chain": "Operations & Supply Chain Mgmt",
  property: "Property",
  "general-bcom": "General BCom",
  undecided: "Undecided"
};

// ── Year 2 core (all BCom students) ─────────────────────────────────

const YEAR_2_CORE = [
  "BUSINESS 111",
  "BUSINESS 112",
  "BUSINESS 114",
  "BUSINESS 115",
  "INFOSYS 110"
];

// ── Year 3+ Major-specific assumed courses ─────────────────────────

const MAJOR_COURSES: Record<StudentMajor, string[]> = {
  accounting: [
    "ACCTG 102",
    "ACCTG 211"
  ],
  "business-analytics": [
    "BUSAN 200",
    "STATS 108",
    "INFOSYS 110"
  ],
  "commercial-law": [
    "COMLAW 101",
    "COMLAW 201"
  ],
  economics: [
    "ECON 151",
    "ECON 152",
    "ECON 201"
  ],
  finance: [
    "FINANCE 251",
    "ACCTG 102",
    "ECON 152"
  ],
  "information-systems": [
    "INFOSYS 110",
    "INFOSYS 220"
  ],
  "international-business": [
    "INTBUS 201"
  ],
  management: [
    "MGMT 211",
    "MGMT 223"
  ],
  marketing: [
    "MKTG 151",
    "MKTG 202"
  ],
  "operations-supply-chain": [
    "OPSMGT 255",
    "OPSMGT 258"
  ],
  property: [
    "PROPERTY 102",
    "PROPERTY 231"
  ],
  "general-bcom": [],
  undecided: []
};

// ── Public API ─────────────────────────────────────────────────────

export function getAssumedCourses(year: StudentYear, major: StudentMajor): string[] {
  const codes = new Set<string>();

  if (year === "first") {
    return [];
  }

  // Year 2+ — common BCom core
  YEAR_2_CORE.forEach((c) => codes.add(c));

  // Year 3+ — major-specific
  if (year === "third" || year === "fourth-plus") {
    const majorCourses = MAJOR_COURSES[major];
    if (majorCourses) {
      majorCourses.forEach((c) => codes.add(c));
    }
  }

  return [...codes].sort();
}

/** Return a human-readable reason for why a course is assumed */
export function getAssumedReason(
  code: string,
  year: StudentYear,
  major: StudentMajor
): string {
  const yearLabel = YEAR_LABELS[year];
  const majorLabel = MAJOR_LABELS[major];

  if (year === "first") return "";

  if (YEAR_2_CORE.includes(code)) {
    return `${code} assumed from ${yearLabel} BCom core profile`;
  }

  const majorCourses = MAJOR_COURSES[major];
  if (majorCourses && majorCourses.includes(code)) {
    return `${code} assumed from ${yearLabel} ${majorLabel} profile`;
  }

  return `${code} assumed from ${yearLabel} ${majorLabel} profile`;
}
