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
  // Business
  "ACCTG", "BUSAN", "BUSINESS", "COMLAW", "ECON", "FINANCE",
  "INFOSYS", "INTBUS", "MGMT", "MKTG", "OPSMGT", "PROPERTY",
  // Science
  "BIOSCI", "CHEM", "COMPSCI", "EARTHSCI", "ENVSCI", "EXERSCI",
  "FOODSCI", "GEOG", "MARINE", "MATHS", "MEDSCI", "PHYSICS",
  "PSYCH", "SCIGEN", "STATS",
  // Engineering
  "CIVIL", "COMPSYS", "ELECTENG", "ENGGEN", "ENGSCI", "MECHENG", "SOFTENG",
  // Arts
  "ANTHRO", "ART", "ASIAN", "CHIN", "COMMS", "DANCE", "DRAMA",
  "ENGLISH", "FINEARTS", "FRENCH", "GERMAN", "GLOBAL", "HISTORY",
  "JAPAN", "KOREAN", "LINGUIST", "MAORI", "MEDIA", "MUSIC",
  "PHIL", "POLITICS", "SOCIOL", "SPANISH", "THEOLOGY",
  // Law
  "LAW",
  // Education
  "EDUC", "EDCURRIC", "EDPROF",
  // Health & Medical
  "NURSING", "PHARMACY", "POPLHLTH",
  // Architecture & Design
  "ARCH", "DESIGN", "URBPLAN",
  // Academic English & General Education
  "ACADENG", "GENED"
];

const BCOM_COURSE_CODES = [
  // Business — existing
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
  "PROPERTY 102","PROPERTY 211","PROPERTY 221","PROPERTY 231","PROPERTY 241","PROPERTY 251","PROPERTY 271","PROPERTY 281","PROPERTY 311","PROPERTY 351","PROPERTY 361","PROPERTY 371",
  // Science — expansion
  "BIOSCI 101","BIOSCI 102","BIOSCI 106","BIOSCI 107","BIOSCI 108","BIOSCI 109","BIOSCI 201","BIOSCI 202","BIOSCI 203","BIOSCI 204","BIOSCI 205","BIOSCI 206","BIOSCI 207","BIOSCI 208","BIOSCI 210",
  "BIOSCI 301","BIOSCI 302","BIOSCI 303","BIOSCI 304","BIOSCI 305","BIOSCI 306","BIOSCI 307","BIOSCI 308","BIOSCI 309","BIOSCI 310",
  "CHEM 110","CHEM 120","CHEM 150","CHEM 210","CHEM 220","CHEM 230","CHEM 240","CHEM 250","CHEM 251","CHEM 260",
  "CHEM 310","CHEM 320","CHEM 330","CHEM 340","CHEM 350","CHEM 351","CHEM 360",
  "COMPSCI 101","COMPSCI 110","COMPSCI 120","COMPSCI 130","COMPSCI 210","COMPSCI 215","COMPSCI 220","COMPSCI 225","COMPSCI 230","COMPSCI 235",
  "COMPSCI 310","COMPSCI 313","COMPSCI 314","COMPSCI 315","COMPSCI 316","COMPSCI 320","COMPSCI 331","COMPSCI 335","COMPSCI 340","COMPSCI 345","COMPSCI 350","COMPSCI 351","COMPSCI 361","COMPSCI 367","COMPSCI 369","COMPSCI 373",
  "EARTHSCI 105","EARTHSCI 120","EARTHSCI 201","EARTHSCI 202","EARTHSCI 203","EARTHSCI 204","EARTHSCI 205","EARTHSCI 208",
  "EARTHSCI 301","EARTHSCI 302","EARTHSCI 303","EARTHSCI 304","EARTHSCI 305","EARTHSCI 307",
  "ENVSCI 101","ENVSCI 201","ENVSCI 202","ENVSCI 203","ENVSCI 301","ENVSCI 302","ENVSCI 303",
  "EXERSCI 101","EXERSCI 103","EXERSCI 201","EXERSCI 202","EXERSCI 203","EXERSCI 204","EXERSCI 205",
  "EXERSCI 301","EXERSCI 302","EXERSCI 303","EXERSCI 304","EXERSCI 305",
  "FOODSCI 100","FOODSCI 200","FOODSCI 201","FOODSCI 202","FOODSCI 300","FOODSCI 301","FOODSCI 302","FOODSCI 303",
  "GEOG 101","GEOG 102","GEOG 103","GEOG 201","GEOG 202","GEOG 203","GEOG 204","GEOG 205",
  "GEOG 301","GEOG 302","GEOG 303","GEOG 304","GEOG 305","GEOG 306",
  "MARINE 100","MARINE 202","MARINE 302",
  "MATHS 102","MATHS 108","MATHS 110","MATHS 120","MATHS 130","MATHS 150","MATHS 162","MATHS 190",
  "MATHS 208","MATHS 210","MATHS 230","MATHS 250","MATHS 253","MATHS 254","MATHS 260","MATHS 270",
  "MATHS 302","MATHS 303","MATHS 304","MATHS 305","MATHS 315","MATHS 320","MATHS 326","MATHS 328","MATHS 332","MATHS 333","MATHS 340","MATHS 341","MATHS 350","MATHS 352","MATHS 353","MATHS 360","MATHS 361","MATHS 362","MATHS 363",
  "MEDSCI 142","MEDSCI 201","MEDSCI 202","MEDSCI 203","MEDSCI 204","MEDSCI 205",
  "MEDSCI 301","MEDSCI 302","MEDSCI 303","MEDSCI 304","MEDSCI 305","MEDSCI 306","MEDSCI 307","MEDSCI 308","MEDSCI 309","MEDSCI 310",
  "PHYSICS 102","PHYSICS 120","PHYSICS 121","PHYSICS 130","PHYSICS 140","PHYSICS 150",
  "PHYSICS 201","PHYSICS 202","PHYSICS 203","PHYSICS 210","PHYSICS 211","PHYSICS 212","PHYSICS 230","PHYSICS 231","PHYSICS 240","PHYSICS 241","PHYSICS 250","PHYSICS 251","PHYSICS 260","PHYSICS 261",
  "PHYSICS 305","PHYSICS 306","PHYSICS 307","PHYSICS 308","PHYSICS 310","PHYSICS 311","PHYSICS 315","PHYSICS 320","PHYSICS 321","PHYSICS 326","PHYSICS 331","PHYSICS 332","PHYSICS 333","PHYSICS 334","PHYSICS 335","PHYSICS 340","PHYSICS 341","PHYSICS 345","PHYSICS 350","PHYSICS 351","PHYSICS 354","PHYSICS 355",
  "PSYCH 108","PSYCH 109","PSYCH 200","PSYCH 201","PSYCH 202","PSYCH 203","PSYCH 204","PSYCH 205","PSYCH 206","PSYCH 207",
  "PSYCH 300","PSYCH 301","PSYCH 302","PSYCH 303","PSYCH 304","PSYCH 305","PSYCH 306","PSYCH 307","PSYCH 308","PSYCH 309",
  "SCIGEN 101","SCIGEN 201","SCIGEN 301",
  "STATS 101","STATS 102","STATS 108","STATS 125","STATS 150",
  "STATS 201","STATS 202","STATS 203","STATS 204","STATS 205","STATS 206","STATS 207","STATS 208","STATS 210",
  "STATS 301","STATS 302","STATS 303","STATS 304","STATS 305","STATS 306","STATS 307","STATS 308","STATS 310","STATS 311","STATS 313","STATS 320","STATS 325","STATS 326","STATS 328","STATS 330","STATS 331","STATS 332","STATS 340","STATS 341","STATS 342","STATS 343","STATS 344",
  // Engineering — expansion
  "CIVIL 200","CIVIL 201","CIVIL 202","CIVIL 203","CIVIL 204","CIVIL 205",
  "CIVIL 300","CIVIL 301","CIVIL 302","CIVIL 303","CIVIL 304","CIVIL 305","CIVIL 306","CIVIL 307",
  "ELECTENG 101","ELECTENG 201","ELECTENG 202","ELECTENG 203","ELECTENG 204","ELECTENG 205",
  "ELECTENG 301","ELECTENG 302","ELECTENG 303","ELECTENG 304","ELECTENG 305","ELECTENG 306",
  "ENGGEN 101","ENGGEN 102","ENGGEN 103","ENGGEN 104","ENGGEN 105",
  "ENGGEN 201","ENGGEN 202","ENGGEN 203","ENGGEN 204",
  "ENGGEN 301","ENGGEN 302","ENGGEN 303",
  "ENGSCI 111","ENGSCI 211","ENGSCI 213","ENGSCI 214","ENGSCI 223",
  "ENGSCI 311","ENGSCI 312","ENGSCI 313","ENGSCI 314","ENGSCI 315",
  "MECHENG 200","MECHENG 201","MECHENG 202","MECHENG 203","MECHENG 204",
  "MECHENG 301","MECHENG 302","MECHENG 303","MECHENG 304","MECHENG 305",
  // Arts — expansion
  "ANTHRO 100","ANTHRO 101","ANTHRO 102","ANTHRO 103","ANTHRO 104","ANTHRO 105","ANTHRO 106",
  "ANTHRO 200","ANTHRO 201","ANTHRO 202","ANTHRO 203","ANTHRO 204","ANTHRO 205","ANTHRO 206","ANTHRO 207","ANTHRO 208",
  "ANTHRO 301","ANTHRO 302","ANTHRO 303","ANTHRO 304","ANTHRO 305","ANTHRO 306","ANTHRO 307","ANTHRO 308",
  "ART 100","ART 101","ART 102","ART 103",
  "ART 200","ART 201","ART 202","ART 203",
  "ART 301","ART 302","ART 303","ART 304",
  "ASIAN 100","ASIAN 200","ASIAN 300",
  "CHIN 100","CHIN 101","CHIN 200","CHIN 201","CHIN 202","CHIN 300","CHIN 301","CHIN 302",
  "COMMS 100","COMMS 101","COMMS 102","COMMS 103","COMMS 104","COMMS 105",
  "COMMS 200","COMMS 201","COMMS 202","COMMS 203","COMMS 204","COMMS 205","COMMS 206","COMMS 207","COMMS 208",
  "COMMS 300","COMMS 301","COMMS 302","COMMS 303","COMMS 304","COMMS 305","COMMS 306","COMMS 307",
  "DANCE 100","DANCE 101","DANCE 200","DANCE 201","DANCE 300","DANCE 301",
  "DRAMA 100","DRAMA 101","DRAMA 200","DRAMA 201","DRAMA 202","DRAMA 300","DRAMA 301","DRAMA 302",
  "ENGLISH 100","ENGLISH 101","ENGLISH 102","ENGLISH 103",
  "ENGLISH 200","ENGLISH 201","ENGLISH 202","ENGLISH 203","ENGLISH 204","ENGLISH 205",
  "ENGLISH 300","ENGLISH 301","ENGLISH 302","ENGLISH 303","ENGLISH 304","ENGLISH 305",
  "FINEARTS 101","FINEARTS 102","FINEARTS 103",
  "FINEARTS 201","FINEARTS 202","FINEARTS 203","FINEARTS 204",
  "FINEARTS 300","FINEARTS 301","FINEARTS 302",
  "FRENCH 100","FRENCH 101","FRENCH 200","FRENCH 201","FRENCH 202","FRENCH 300","FRENCH 301",
  "GERMAN 100","GERMAN 101","GERMAN 200","GERMAN 201","GERMAN 300","GERMAN 301",
  "GLOBAL 100","GLOBAL 200","GLOBAL 300",
  "HISTORY 100","HISTORY 101","HISTORY 102","HISTORY 103","HISTORY 104",
  "HISTORY 200","HISTORY 201","HISTORY 202","HISTORY 203","HISTORY 204","HISTORY 205","HISTORY 206",
  "HISTORY 300","HISTORY 301","HISTORY 302","HISTORY 303","HISTORY 304","HISTORY 305","HISTORY 306",
  "JAPAN 100","JAPAN 101","JAPAN 200","JAPAN 201","JAPAN 202","JAPAN 300","JAPAN 301",
  "KOREAN 100","KOREAN 101","KOREAN 200","KOREAN 201","KOREAN 300",
  "LINGUIST 100","LINGUIST 101","LINGUIST 200","LINGUIST 201","LINGUIST 202","LINGUIST 203",
  "LINGUIST 300","LINGUIST 301","LINGUIST 302","LINGUIST 303","LINGUIST 304",
  "MAORI 100","MAORI 101","MAORI 102","MAORI 103",
  "MAORI 200","MAORI 201","MAORI 202","MAORI 203",
  "MAORI 300","MAORI 301","MAORI 302","MAORI 303",
  "MEDIA 100","MEDIA 101","MEDIA 200","MEDIA 201","MEDIA 202","MEDIA 203","MEDIA 204",
  "MEDIA 300","MEDIA 301","MEDIA 302","MEDIA 303","MEDIA 304","MEDIA 305",
  "MUSIC 100","MUSIC 101","MUSIC 102","MUSIC 103","MUSIC 104",
  "MUSIC 200","MUSIC 201","MUSIC 202","MUSIC 203","MUSIC 204","MUSIC 205",
  "MUSIC 300","MUSIC 301","MUSIC 302","MUSIC 303","MUSIC 304","MUSIC 305",
  "PHIL 100","PHIL 101","PHIL 102","PHIL 103","PHIL 104","PHIL 105",
  "PHIL 200","PHIL 201","PHIL 202","PHIL 203","PHIL 204","PHIL 205","PHIL 206","PHIL 207",
  "PHIL 300","PHIL 301","PHIL 302","PHIL 303","PHIL 304","PHIL 305","PHIL 306",
  "POLITICS 100","POLITICS 101","POLITICS 102","POLITICS 103","POLITICS 104","POLITICS 105","POLITICS 106",
  "POLITICS 200","POLITICS 201","POLITICS 202","POLITICS 203","POLITICS 204","POLITICS 205","POLITICS 206","POLITICS 207","POLITICS 208","POLITICS 209",
  "POLITICS 300","POLITICS 301","POLITICS 302","POLITICS 303","POLITICS 304","POLITICS 305","POLITICS 306","POLITICS 307",
  "SOCIOL 100","SOCIOL 101","SOCIOL 102","SOCIOL 103","SOCIOL 104","SOCIOL 105",
  "SOCIOL 200","SOCIOL 201","SOCIOL 202","SOCIOL 203","SOCIOL 204","SOCIOL 205","SOCIOL 206",
  "SOCIOL 300","SOCIOL 301","SOCIOL 302","SOCIOL 303","SOCIOL 304","SOCIOL 305","SOCIOL 306",
  "SPANISH 100","SPANISH 101","SPANISH 200","SPANISH 201","SPANISH 202","SPANISH 300","SPANISH 301",
  "THEOLOGY 100","THEOLOGY 101","THEOLOGY 200","THEOLOGY 201","THEOLOGY 300","THEOLOGY 301",
  // Law — expansion
  "LAW 100","LAW 101","LAW 102","LAW 103","LAW 121","LAW 131","LAW 141",
  "LAW 200","LAW 201","LAW 202","LAW 211","LAW 212","LAW 231","LAW 241","LAW 251","LAW 252",
  "LAW 301","LAW 302","LAW 303","LAW 304","LAW 305","LAW 306","LAW 311","LAW 312","LAW 313","LAW 314","LAW 316","LAW 317","LAW 318","LAW 319","LAW 320","LAW 321","LAW 322","LAW 323","LAW 324",
  // Education — expansion
  "EDUC 100","EDUC 101","EDUC 102","EDUC 103","EDUC 104","EDUC 105",
  "EDUC 200","EDUC 201","EDUC 202","EDUC 203","EDUC 204","EDUC 205","EDUC 206",
  "EDUC 300","EDUC 301","EDUC 302","EDUC 303","EDUC 304","EDUC 305","EDUC 306","EDUC 307",
  "EDCURRIC 200","EDCURRIC 201","EDCURRIC 202","EDCURRIC 300","EDCURRIC 301","EDCURRIC 302",
  "EDPROF 200","EDPROF 201","EDPROF 202","EDPROF 203","EDPROF 204","EDPROF 205","EDPROF 206","EDPROF 207",
  "EDPROF 300","EDPROF 301","EDPROF 302","EDPROF 303","EDPROF 304","EDPROF 305","EDPROF 306",
  // Health — expansion
  "NURSING 100","NURSING 101","NURSING 102","NURSING 103",
  "NURSING 200","NURSING 201","NURSING 202","NURSING 203",
  "NURSING 300","NURSING 301","NURSING 302","NURSING 303","NURSING 304",
  "PHARMACY 100","PHARMACY 101","PHARMACY 102","PHARMACY 200","PHARMACY 201","PHARMACY 202","PHARMACY 300","PHARMACY 301","PHARMACY 302",
  "POPLHLTH 101","POPLHLTH 102","POPLHLTH 103","POPLHLTH 104",
  "POPLHLTH 200","POPLHLTH 201","POPLHLTH 202","POPLHLTH 203","POPLHLTH 204","POPLHLTH 205","POPLHLTH 206",
  "POPLHLTH 300","POPLHLTH 301","POPLHLTH 302","POPLHLTH 303","POPLHLTH 304","POPLHLTH 305","POPLHLTH 306","POPLHLTH 307",
  // Architecture & Design — expansion
  "ARCH 100","ARCH 101","ARCH 102","ARCH 103",
  "ARCH 200","ARCH 201","ARCH 202","ARCH 203","ARCH 204",
  "ARCH 300","ARCH 301","ARCH 302","ARCH 303","ARCH 304",
  "DESIGN 100","DESIGN 101","DESIGN 102","DESIGN 103","DESIGN 104",
  "DESIGN 200","DESIGN 201","DESIGN 202","DESIGN 203","DESIGN 204","DESIGN 205","DESIGN 206","DESIGN 207",
  "DESIGN 300","DESIGN 301","DESIGN 302","DESIGN 303","DESIGN 304","DESIGN 305",
  "URBPLAN 100","URBPLAN 101","URBPLAN 200","URBPLAN 201","URBPLAN 300","URBPLAN 301","URBPLAN 302",
  // Phase 7 — missing courses
  "STATS 301",
  "ENGGEN 101","ENGGEN 103","ENGGEN 104","ENGGEN 201","ENGGEN 202","ENGGEN 203","ENGGEN 301","ENGGEN 302",
  "ENGSCI 213",
  "ELECTENG 201","ELECTENG 203",
  "COMPSYS 201","COMPSYS 301","COMPSYS 302",
  "PHYSICS 330",
  "POLITICS 107","POLITICS 201",
  "MEDIA 101","MEDIA 204","MEDIA 300","MEDIA 301",
  "HISTORY 100","HISTORY 102","HISTORY 200","HISTORY 204","HISTORY 205","HISTORY 300","HISTORY 304",
  "ACADENG 100","ACADENG 101","ACADENG 102",
  "GENED 101","GENED 102","GENED 103","GENED 104","GENED 105"
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
