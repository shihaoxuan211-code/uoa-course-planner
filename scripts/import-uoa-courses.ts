import fs from "node:fs";
import path from "node:path";
import type { ImportedAssessmentItem, ImportedCourse, Semester } from "../src/types/course";

const COURSE_CODES = [
  "BUSAN 300",
  "INTBUS 305",
  "INTBUS 333",
  "INFOSYS 222",
  "COMLAW 201",
  "MKTG 202",
  "MGMT 223",
  "ACCTG 102",
  "BUSAN 200",
  "BUSAN 201",
  "INTBUS 151",
  "INTBUS 201",
  "INTBUS 202",
  "INFOSYS 110",
  "INFOSYS 220",
  "INFOSYS 300",
  "COMLAW 101",
  "COMLAW 301",
  "MGMT 101",
  "MGMT 211",
  "MGMT 301",
  "MKTG 151",
  "MKTG 201",
  "MKTG 301",
  "FINANCE 251",
  "FINANCE 261",
  "FINANCE 351",
  "ECON 151",
  "ECON 152",
  "ECON 201",
  "ECON 301",
  "BUSINESS 101",
  "BUSINESS 102",
  "BUSINESS 201",
  "OPSMGT 255",
  "OPSMGT 357",
  "OPSMGT 370",
  "PROPERTY 102",
  "PROPERTY 211",
  "PROPERTY 231"
];

const BCOM_SUBJECTS = [
  "ACCTG",
  "ANTHRO",
  "BIOSCI",
  "BUSAN",
  "BUSINESS",
  "CHEM",
  "COMLAW",
  "COMMS",
  "COMPSCI",
  "ECON",
  "ENGSCI",
  "ENGLISH",
  "FINANCE",
  "GEOG",
  "GLOBAL",
  "HISTORY",
  "INFOSYS",
  "INTBUS",
  "LAW",
  "LINGUIST",
  "MAORI",
  "MATHS",
  "MEDIA",
  "MGMT",
  "MKTG",
  "MUSIC",
  "OPSMGT",
  "PHIL",
  "PHYSICS",
  "POLITICS",
  "PROPERTY",
  "PSYCH",
  "SCIGEN",
  "SOCIOL",
  "SOFTENG",
  "STATS"
];

const BCOM_COURSE_CODES = [
  "ACCTG 102","ACCTG 211","ACCTG 221","ACCTG 222","ACCTG 311","ACCTG 312","ACCTG 321","ACCTG 323","ACCTG 331","ACCTG 371",
  "BUSAN 200","BUSAN 201","BUSAN 300","BUSAN 302",
  "BUSINESS 111","BUSINESS 112","BUSINESS 114","BUSINESS 115","BUSINESS 202","BUSINESS 203","BUSINESS 301",
  "COMLAW 101","COMLAW 201","COMLAW 301","COMLAW 303","COMLAW 311","COMLAW 314","COMLAW 320",
  "ECON 151","ECON 152","ECON 201","ECON 211","ECON 212","ECON 221","ECON 271","ECON 301","ECON 302","ECON 311","ECON 321","ECON 341","ECON 351","ECON 352","ECON 361","ECON 372",
  "FINANCE 251","FINANCE 261","FINANCE 351","FINANCE 361","FINANCE 362","FINANCE 383",
  "INFOSYS 110","INFOSYS 220","INFOSYS 222","INFOSYS 300","INFOSYS 303","INFOSYS 304","INFOSYS 305","INFOSYS 321","INFOSYS 341",
  "INTBUS 151","INTBUS 201","INTBUS 202","INTBUS 305","INTBUS 306","INTBUS 333",
  "MGMT 211","MGMT 223","MGMT 302","MGMT 309","MGMT 314",
  "MKTG 151","MKTG 202","MKTG 203","MKTG 301","MKTG 302","MKTG 303","MKTG 304","MKTG 306","MKTG 308","MKTG 309",
  "OPSMGT 255","OPSMGT 258","OPSMGT 357","OPSMGT 370","OPSMGT 371","OPSMGT 376",
  "PROPERTY 102","PROPERTY 211","PROPERTY 221","PROPERTY 231","PROPERTY 241","PROPERTY 251","PROPERTY 271","PROPERTY 281","PROPERTY 311","PROPERTY 351","PROPERTY 361","PROPERTY 371"
];

const OUTPUT_PATH = path.join(process.cwd(), "src", "data", "generated-courses.json");
const REQUEST_DELAY_MS = 400;
const CATALOGUE_COURSE_BASE_URL = "https://study.auckland.ac.nz/ords/r/uoa/catalogue/course";
const CATALOGUE_BROWSE_BASE_URL = "https://study.auckland.ac.nz/ords/r/uoa/catalogue/browse2";

type ImportMode = "manual" | "bcom";

interface ParsedCourseCode {
  code: string;
  subject: string;
  number: string;
}

interface FetchedPage {
  url: string;
  html: string;
}

interface FieldCheck {
  label: string;
  value: unknown;
  warning: string;
}

interface CourseCodeCandidate {
  code: string;
  source: string;
}

interface ImportFailure {
  code: string;
  reason: string;
}

interface DuplicateSkip {
  code: string;
  firstSource: string;
  duplicateSource: string;
}

interface ImportStats {
  attemptedCourseCodes: string[];
  successfulCourseCodes: string[];
  failedImports: ImportFailure[];
  skippedDuplicates: DuplicateSkip[];
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getImportMode(): ImportMode {
  const args = process.argv.slice(2);

  if (args.includes("--bcom") || process.env.UOA_IMPORT_MODE === "bcom") {
    return "bcom";
  }

  return "manual";
}

function parseCourseCode(rawCode: string): ParsedCourseCode | undefined {
  const normalized = rawCode.trim().toUpperCase().replace(/\s+/g, " ");
  const match = normalized.match(/^([A-Z]{2,10})\s(\d{3}[A-Z]?)$/);

  if (!match) {
    return undefined;
  }

  return {
    code: normalized,
    subject: match[1],
    number: match[2]
  };
}

function isBComStageCourse(course: ParsedCourseCode) {
  return /^[1-3]/.test(course.number);
}

function getCatalogueCourseUrl(course: ParsedCourseCode) {
  return `${CATALOGUE_COURSE_BASE_URL}?p6_code=${encodeURIComponent(course.code)}`;
}

function getCatalogueBrowseSearchUrl(subject: string) {
  const url = new URL(CATALOGUE_BROWSE_BASE_URL);
  url.searchParams.set("p4_browse_id", "01");
  url.searchParams.set("p4_search", subject);
  return url.toString();
}

function decodeHtmlOnce(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number: string) => String.fromCharCode(Number(number)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function decodeHtml(value: string) {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    const next = decodeHtmlOnce(decoded);
    if (next === decoded) {
      break;
    }
    decoded = next;
  }

  return decoded;
}

function htmlToText(html: string) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|tr|section|dt|dd)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function cleanText(value: string | undefined) {
  const cleaned = value
    ?.replace(/\u00a0/g, " ")
    .replace(/([A-Za-z0-9])(OR|AND)\s*(?=must\b)/g, "$1 $2 ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /^n\/a$/i.test(cleaned) || cleaned === "-") {
    return undefined;
  }

  return cleaned;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractTitleTag(html: string) {
  return cleanText(htmlToText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
}

function extractSpanValue(html: string, id: string) {
  const pattern = new RegExp(`<span[^>]*\\bid=["']${escapeRegex(id)}["'][^>]*>([\\s\\S]*?)<\\/span>`, "i");
  return cleanText(htmlToText(html.match(pattern)?.[1] ?? ""));
}

function extractInputValue(html: string, id: string) {
  const pattern = new RegExp(`<input[^>]*\\bid=["']${escapeRegex(id)}["'][^>]*\\bvalue=["']([^"']*)["']`, "i");
  return cleanText(decodeHtml(html.match(pattern)?.[1] ?? ""));
}

function stripCourseCodeFromTitle(value: string | undefined, course: ParsedCourseCode) {
  const title = cleanText(value);
  if (!title) {
    return undefined;
  }

  const withoutCode = cleanText(title.replace(new RegExp(`^${escapeRegex(course.code)}\\s*[-:]\\s*`, "i"), ""));
  return withoutCode && withoutCode !== course.code ? withoutCode : undefined;
}

function isGenericPageTitle(value: string | undefined) {
  return !value || /^(the university of auckland|course|home)$/i.test(value);
}

function extractTitle(html: string, course: ParsedCourseCode) {
  const name = extractSpanValue(html, "P6_NAME");
  if (name) {
    return name;
  }

  const title = stripCourseCodeFromTitle(extractSpanValue(html, "P6_TITLE"), course);
  if (title) {
    return title;
  }

  const heading = stripCourseCodeFromTitle(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1], course);
  if (heading) {
    return heading;
  }

  const titleTag = stripCourseCodeFromTitle(extractTitleTag(html), course);
  return isGenericPageTitle(titleTag) ? undefined : titleTag;
}

function extractPoints(html: string) {
  const points = Number(extractSpanValue(html, "P6_UNITS_MIN"));
  return Number.isFinite(points) && points > 0 ? points : undefined;
}

function extractStage(course: ParsedCourseCode, html: string) {
  const fromProgramType = extractSpanValue(html, "P6_COURSE_PROGRAM_TYPE")?.match(/stage\s+([1-7])/i)?.[1];
  const stage = Number(fromProgramType ?? course.number[0]);
  return Number.isInteger(stage) && stage >= 1 && stage <= 7 ? stage : undefined;
}

function extractDefinitionValue(html: string, label: string) {
  const pattern = new RegExp(
    `<dt[^>]*>[\\s\\S]*?${escapeRegex(label)}[\\s\\S]*?<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`,
    "i"
  );

  return cleanText(htmlToText(html.match(pattern)?.[1] ?? ""))?.replace(/\s*\/\s*/g, " / ");
}

function normalizeSemesterLabel(rawValue: string | undefined): Semester | undefined {
  const value = cleanText(rawValue)?.toLowerCase();

  if (!value) {
    return undefined;
  }

  if (/semester\s+(one|1)/i.test(value)) return "Semester 1";
  if (/semester\s+(two|2)/i.test(value)) return "Semester 2";
  if (/summer\s+(semester|school)/i.test(value)) return "Summer School";
  if (/quarter\s+(one|1)/i.test(value)) return "Quarter 1";
  if (/quarter\s+(two|2)/i.test(value)) return "Quarter 2";
  if (/quarter\s+(three|3)/i.test(value)) return "Quarter 3";
  if (/quarter\s+(four|4)/i.test(value)) return "Quarter 4";

  return undefined;
}

function extractSemesters(html: string) {
  const semesters = new Set<Semester>();

  // Primary: look for <td data-label="Semester"> cells
  const semesterCellPattern = /<td[^>]*data-label=["']Semester["'][^>]*>([\s\S]*?)<\/td>/gi;
  let match = semesterCellPattern.exec(html);

  while (match) {
    const semester = normalizeSemesterLabel(htmlToText(match[1]));
    if (semester) semesters.add(semester);
    match = semesterCellPattern.exec(html);
  }

  // Fallback: scan full page text for semester keywords
  if (semesters.size === 0) {
    const pageText = htmlToText(html);
    const keywords: Array<{ pattern: RegExp; label: Semester }> = [
      { pattern: /semester\s+(one|1)/i, label: "Semester 1" },
      { pattern: /semester\s+(two|2)/i, label: "Semester 2" },
      { pattern: /summer\s+(semester|school)/i, label: "Summer School" }
    ];
    keywords.forEach(({ pattern, label }) => {
      if (pattern.test(pageText)) semesters.add(label);
    });
  }

  return [...semesters];
}

function extractTableCell(rowHtml: string, label: string) {
  const pattern = new RegExp(`<td[^>]*data-label=["']${escapeRegex(label)}["'][^>]*>([\\s\\S]*?)<\\/td>`, "i");
  return cleanText(htmlToText(rowHtml.match(pattern)?.[1] ?? ""));
}

function extractTableByAriaLabel(html: string, label: string) {
  const pattern = new RegExp(`<table[^>]*aria-label=["']${escapeRegex(label)}["'][^>]*>[\\s\\S]*?<\\/table>`, "i");
  return html.match(pattern)?.[0];
}

function extractAssessments(html: string) {
  // Primary: <table aria-label="Assessments">
  let assessmentTable = extractTableByAriaLabel(html, "Assessments");

  // Fallback: look for tables with assessment-related aria-labels or headings
  if (!assessmentTable) {
    assessmentTable = extractTableByAriaLabel(html, "Assessment");
  }
  if (!assessmentTable) {
    // Try finding a table near "Assessment" text
    const assessmentHeadingMatch = html.match(/<h[2-4][^>]*>\s*Assessment[s]?\s*<\/h[2-4]>/i);
    if (assessmentHeadingMatch) {
      const afterHeading = html.slice(html.indexOf(assessmentHeadingMatch[0]));
      const tableMatch = afterHeading.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (tableMatch) assessmentTable = tableMatch[0];
    }
  }

  if (!assessmentTable) {
    return [];
  }

  const assessments: ImportedAssessmentItem[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match = rowPattern.exec(assessmentTable);

  while (match) {
    const rowHtml = match[1];
    const type = extractTableCell(rowHtml, "Assessment Type");
    const percentage = extractTableCell(rowHtml, "Assessment Percentage");
    const classification = extractTableCell(rowHtml, "Assessment Classification");

    if (type) {
      const percentageText = percentage ? (/%$/.test(percentage) ? percentage : `${percentage}%`) : undefined;
      const weight = cleanText([percentageText, classification].filter(Boolean).join(" - "));
      assessments.push({
        type,
        weight: weight ?? "Not available"
      });
    }

    match = rowPattern.exec(assessmentTable);
  }

  return assessments;
}

function isProtectedOrOutOfScope(html: string, url: string) {
  const title = extractTitleTag(html);
  const lowerHtml = html.toLowerCase();

  return (
    /login service|single sign-on/i.test(title ?? "") ||
    /id=["']loginfrm["']|\/profile\/saml2\/redirect\/sso/i.test(lowerHtml) ||
    /timetable-planner|timetable planner|enrolment|enrollment/i.test(url)
  );
}

function isExpectedCoursePage(html: string, course: ParsedCourseCode) {
  const pageCode = extractSpanValue(html, "P6_COURSE_CODE") ?? extractInputValue(html, "P6_CODE");
  const normalizedCode = pageCode?.toUpperCase().replace(/\s+/g, " ");
  return normalizedCode === course.code;
}

async function fetchPublicHtml(url: string, label: string): Promise<FetchedPage | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html",
        "user-agent": "UOA Course Planner MVP importer; public catalogue pages only"
      }
    });

    if (!response.ok) {
      console.warn(`${label}: could not fetch public catalogue page (${response.status}) from ${url}.`);
      return undefined;
    }

    const html = await response.text();
    if (isProtectedOrOutOfScope(html, url)) {
      console.warn(`${label}: skipped page because it appears protected or outside the public catalogue scope.`);
      return undefined;
    }

    return { url, html };
  } catch (error) {
    console.warn(`${label}: fetch failed (${error instanceof Error ? error.message : "unknown error"}).`);
    return undefined;
  }
}

async function fetchPublicCoursePage(course: ParsedCourseCode): Promise<FetchedPage | undefined> {
  const page = await fetchPublicHtml(getCatalogueCourseUrl(course), course.code);

  if (!page) {
    return undefined;
  }

  if (!isExpectedCoursePage(page.html, course)) {
    console.warn(`${course.code}: skipped page because the catalogue response did not contain the expected course code.`);
    return undefined;
  }

  return page;
}

function inferHasFinalExam(course: ImportedCourse) {
  const assessmentText = course.assessments
    ?.map((assessment) => `${assessment.type ?? ""} ${assessment.weight ?? ""}`)
    .join(" ");
  return /final\s+exam|examination/i.test(assessmentText ?? "");
}

function inferHasGroupWork(course: ImportedCourse) {
  const assessmentText = course.assessments
    ?.map((assessment) => `${assessment.type ?? ""} ${assessment.weight ?? ""}`)
    .join(" ");
  return /group|team|presentation/i.test(assessmentText ?? "");
}

function parseCoursePage(course: ParsedCourseCode, page: FetchedPage): ImportedCourse {
  const description =
    extractSpanValue(page.html, "P6_CATALOG_DESCRIPTION") ?? extractSpanValue(page.html, "P6_COURSE_OVERVIEW");
  const importedCourse: ImportedCourse = {
    id: course.code.toLowerCase().replace(/\s+/g, "-"),
    code: course.code,
    title: extractTitle(page.html, course),
    subject: course.subject,
    faculty: extractSpanValue(page.html, "P6_FACULTY"),
    stage: extractStage(course, page.html),
    points: extractPoints(page.html),
    semesters: extractSemesters(page.html),
    description,
    prerequisites: extractDefinitionValue(page.html, "Prerequisite"),
    restrictions: extractDefinitionValue(page.html, "Restriction"),
    workload: extractSpanValue(page.html, "P6_CRSE_OUT_WORKLOAD"),
    assessments: extractAssessments(page.html),
    sourceUrl: page.url,
    sourceFetchedAt: new Date().toISOString()
  };

  importedCourse.hasFinalExam = inferHasFinalExam(importedCourse);
  importedCourse.hasGroupWork = inferHasGroupWork(importedCourse);

  return importedCourse;
}

function hasExtractedValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return typeof value === "string" && Boolean(cleanText(value));
}

function getExtractionChecks(course: ImportedCourse): FieldCheck[] {
  return [
    { label: "title", value: course.title, warning: "actual course title could not be found" },
    { label: "description", value: course.description, warning: "course description could not be found" },
    { label: "points", value: course.points, warning: "points value could not be found" },
    { label: "faculty", value: course.faculty, warning: "faculty could not be found" },
    { label: "prerequisites", value: course.prerequisites, warning: "prerequisite information could not be found" },
    { label: "restrictions", value: course.restrictions, warning: "restriction information could not be found" },
    { label: "workload", value: course.workload, warning: "workload information could not be found" },
    { label: "semesters", value: course.semesters, warning: "semester information could not be found" },
    { label: "assessments", value: course.assessments, warning: "assessment information could not be found" }
  ];
}

function logExtraction(course: ImportedCourse) {
  const checks = getExtractionChecks(course);
  const extractedFields = checks
    .filter((check) => hasExtractedValue(check.value))
    .map((check) => {
      if (Array.isArray(check.value)) {
        return `${check.label} (${check.value.length})`;
      }
      return check.label;
    });

  console.log(`${course.code}: extracted ${extractedFields.length > 0 ? extractedFields.join(", ") : "no optional fields"}.`);

  checks
    .filter((check) => !hasExtractedValue(check.value))
    .forEach((check) => {
      console.warn(`${course.code}: warning - ${check.warning}.`);
    });
}

function getInvalidImportedCourseReason(course: ImportedCourse) {
  if (!hasExtractedValue(course.code)) {
    return "missing course code";
  }

  if (!hasExtractedValue(course.title) || isGenericPageTitle(course.title)) {
    return "missing meaningful title";
  }

  if (!hasExtractedValue(course.points)) {
    return "missing points";
  }

  if (!hasExtractedValue(course.description) && !hasExtractedValue(course.assessments) && !hasExtractedValue(course.workload)) {
    return "missing description, assessments, and workload";
  }

  return undefined;
}

function parseCardDataCourseCodes(html: string, subject: string) {
  const codes = new Set<string>();

  // Primary: try parsing gCardData JavaScript variables
  const cardDataPattern = /var\s+gCard[^\s=]*data\s*=\s*(\{[\s\S]*?\});/g;
  let match = cardDataPattern.exec(html);
  let parsedFromCard = false;

  while (match) {
    try {
      // The JSON may contain unescaped characters — try to extract just the values array
      const block = match[1];
      const valuesMatch = block.match(/"values"\s*:\s*(\[[\s\S]*?\])/);
      if (valuesMatch) {
        const rows = JSON.parse(valuesMatch[1]) as unknown[];
        if (Array.isArray(rows)) {
          rows.forEach((row) => {
            if (!Array.isArray(row) || typeof row[0] !== "string") return;
            const course = parseCourseCode(row[0]);
            if (course && course.subject === subject && isBComStageCourse(course)) {
              codes.add(course.code);
            }
          });
          parsedFromCard = true;
        }
      }
    } catch {
      // Fall through to HTML parsing
    }
    match = cardDataPattern.exec(html);
  }

  // Fallback: extract course codes directly from page HTML
  if (!parsedFromCard || codes.size === 0) {
    const codePattern = new RegExp(`\\b(${subject}\\s\\d{3}[A-Z]?)\\b`, "gi");
    let codeMatch = codePattern.exec(html);
    while (codeMatch) {
      const course = parseCourseCode(codeMatch[1]);
      if (course && isBComStageCourse(course)) {
        codes.add(course.code);
      }
      codeMatch = codePattern.exec(html);
    }
  }

  return [...codes].sort((a, b) => a.localeCompare(b));
}

async function discoverCourseCodesForSubject(subject: string) {
  const page = await fetchPublicHtml(getCatalogueBrowseSearchUrl(subject), `Discovery ${subject}`);

  if (!page) {
    return [];
  }

  const codes = parseCardDataCourseCodes(page.html, subject);
  console.log(`Discovery ${subject}: found ${codes.length} public Stage 1-3 course codes.`);
  return codes;
}

function addUniqueCandidate(
  candidates: CourseCodeCandidate[],
  seenSources: Map<string, string>,
  stats: ImportStats,
  rawCode: string,
  source: string,
  stageFilter: "any" | "bcom"
) {
  const course = parseCourseCode(rawCode);

  if (!course) {
    console.warn(`Skipping ${rawCode}: invalid course code in ${source}.`);
    return;
  }

  if (stageFilter === "bcom" && !isBComStageCourse(course)) {
    console.warn(`Skipping ${course.code}: outside Stage 1-3 BCom import scope.`);
    return;
  }

  const firstSource = seenSources.get(course.code);
  if (firstSource) {
    stats.skippedDuplicates.push({
      code: course.code,
      firstSource,
      duplicateSource: source
    });
    console.log(`Skipping duplicate ${course.code} from ${source}; already added from ${firstSource}.`);
    return;
  }

  seenSources.set(course.code, source);
  candidates.push({ code: course.code, source });
}

async function buildCourseCodeCandidates(mode: ImportMode, stats: ImportStats) {
  const candidates: CourseCodeCandidate[] = [];
  const seenSources = new Map<string, string>();

  COURSE_CODES.forEach((code) => {
    addUniqueCandidate(candidates, seenSources, stats, code, "COURSE_CODES", "any");
  });

  if (mode === "bcom") {
    for (const subject of BCOM_SUBJECTS) {
      const discoveredCodes = await discoverCourseCodesForSubject(subject);

      discoveredCodes.forEach((code) => {
        addUniqueCandidate(candidates, seenSources, stats, code, `BCOM_SUBJECTS:${subject}`, "bcom");
      });

      await sleep(REQUEST_DELAY_MS);
    }

    BCOM_COURSE_CODES.forEach((code) => {
      addUniqueCandidate(candidates, seenSources, stats, code, "BCOM_COURSE_CODES", "bcom");
    });
  }

  return candidates;
}

function logSummary(stats: ImportStats) {
  console.log("Import summary:");
  console.log(`Total course codes attempted: ${stats.attemptedCourseCodes.length}`);
  console.log(`Successful imports: ${stats.successfulCourseCodes.length}`);
  console.log(`Failed imports: ${stats.failedImports.length}`);
  console.log(`Skipped duplicates: ${stats.skippedDuplicates.length}`);

  if (stats.failedImports.length > 0) {
    console.warn(
      `Failed course codes: ${stats.failedImports.map((failure) => `${failure.code} (${failure.reason})`).join(", ")}`
    );
  }
}

async function importCourses() {
  const mode = getImportMode();
  const importedCourses: ImportedCourse[] = [];
  const stats: ImportStats = {
    attemptedCourseCodes: [],
    successfulCourseCodes: [],
    failedImports: [],
    skippedDuplicates: []
  };

  console.log(`Import mode: ${mode}`);
  const candidates = await buildCourseCodeCandidates(mode, stats);

  for (const candidate of candidates) {
    const course = parseCourseCode(candidate.code);

    if (!course) {
      stats.failedImports.push({ code: candidate.code, reason: "invalid course code" });
      continue;
    }

    console.log(`Fetching ${course.code} from public UOA Curriculum Catalogue...`);
    stats.attemptedCourseCodes.push(course.code);
    const page = await fetchPublicCoursePage(course);

    if (!page) {
      console.warn(`${course.code}: no importable public catalogue page found.`);
      stats.failedImports.push({ code: course.code, reason: "no importable public catalogue page found" });
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const importedCourse = parseCoursePage(course, page);
    logExtraction(importedCourse);

    const invalidReason = getInvalidImportedCourseReason(importedCourse);
    if (invalidReason) {
      console.warn(`${course.code}: skipped invalid imported course (${invalidReason}).`);
      stats.failedImports.push({ code: course.code, reason: invalidReason });
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    importedCourses.push(importedCourse);
    stats.successfulCourseCodes.push(course.code);
    await sleep(REQUEST_DELAY_MS);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(importedCourses, null, 2)}\n`, "utf8");
  console.log(`Imported ${importedCourses.length} courses to ${OUTPUT_PATH}`);
  logSummary(stats);
}

importCourses().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
