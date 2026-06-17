/** Assumed completed courses based on student year level.
 * These are NOT confirmed completions — the user must manually confirm them.
 */

export type StudentYear = "first" | "second" | "third" | "fourth-plus";

const STAGE_1_CORE = [
  "BUSINESS 111",
  "BUSINESS 112",
  "BUSINESS 114",
  "BUSINESS 115",
  "INFOSYS 110",
  "ACCTG 102",
  "ECON 151",
  "ECON 152",
  "COMLAW 101",
  "MKTG 151",
  "STATS 108"
];

const STAGE_2_FOUNDATION = [
  "ACCTG 211",
  "ACCTG 221",
  "BUSAN 200",
  "BUSAN 201",
  "COMLAW 201",
  "ECON 201",
  "ECON 211",
  "FINANCE 251",
  "FINANCE 261",
  "INFOSYS 220",
  "INFOSYS 222",
  "INTBUS 201",
  "INTBUS 202",
  "MGMT 211",
  "MGMT 223",
  "MKTG 202",
  "MKTG 203",
  "OPSMGT 255",
  "OPSMGT 258"
];

export function getAssumedCourses(year: StudentYear): string[] {
  switch (year) {
    case "first":
      return [];
    case "second":
      return [...STAGE_1_CORE];
    case "third":
      return [...STAGE_1_CORE, ...STAGE_2_FOUNDATION];
    case "fourth-plus":
      return [...STAGE_1_CORE, ...STAGE_2_FOUNDATION];
    default:
      return [];
  }
}

export const YEAR_LABELS: Record<StudentYear, string> = {
  first: "First Year",
  second: "Second Year",
  third: "Third Year",
  "fourth-plus": "Fourth Year+"
};
