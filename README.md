# UOA Course Planner

UOA Course Planner is a small Next.js MVP for University of Auckland students who want to search sample course information, inspect historical exam patterns, build a local course plan, and compare a few courses side by side.

This is not an official University of Auckland enrolment system. It does not connect to UOA login, does not enrol students, does not access protected UOA systems, and does not use AI APIs. The app keeps clearly marked mock data as a safe fallback and can optionally import manually listed public Curriculum Catalogue pages.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Local mock fallback data plus optional generated import data
- Browser `localStorage` for My Plan and Compare lists

## Run Locally

Install Node.js 20 or later. The simplest path is npm:

```bash
npm install
npm run dev
```

If you prefer pnpm:

```bash
corepack enable
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npm run build
```

## Data Note

By default, the app uses the 8 mock courses in `src/data/courses.ts`. The app can also read imported course records from `src/data/generated-courses.json`.

Fallback rule:

- If `src/data/generated-courses.json` exists and contains valid imported courses, the app uses those imported courses.
- If that file is missing, empty, invalid, or contains no valid courses, the app safely falls back to the current 8 mock courses.
- Invalid imported courses are skipped with a warning. Missing optional fields display as `Not available` instead of crashing the website.

All course and exam records are planning data only. Every course record includes a `sourceNote` so the data source can be replaced by a real database later without changing the UI shape.

The app displays this disclaimer on course detail pages:

> This information is for planning reference only. Please confirm details with the official University of Auckland course catalogue and exam timetable.

Imported data disclaimer:

> Imported course data is based on public catalogue information and may be incomplete or outdated. Please verify all information with official University of Auckland sources before making enrolment decisions.

## Import Public UOA Course Data

The first-step importer is in:

```text
scripts/import-uoa-courses.ts
```

Run the BCom expansion importer with:

```bash
npm run import:uoa
```

This keeps the manual `COURSE_CODES` list, then also tries to discover public Stage 1-3 course codes for these BCom-related subjects:

```ts
const BCOM_SUBJECTS = [
  "ACCTG",
  "BUSAN",
  "COMLAW",
  "ECON",
  "FINANCE",
  "INFOSYS",
  "INTBUS",
  "MGMT",
  "MKTG",
  "OPSMGT",
  "PROPERTY"
];
```

To run only the original manual list:

```bash
npm run import:uoa:manual
```

It writes results to:

```text
src/data/generated-courses.json
```

To add more course codes, edit the `COURSE_CODES` array near the top of `scripts/import-uoa-courses.ts`:

```ts
const COURSE_CODES = [
  "BUSAN 300",
  "INTBUS 305",
  "ACCTG 102"
];
```

To add more BCom fallback course codes, edit the separate `BCOM_COURSE_CODES` array in the same file. This list is used alongside public subject discovery and is intentionally manually editable when catalogue discovery is incomplete.

The importer only attempts public University of Auckland Curriculum Catalogue browse and course pages. It does not require UOA login, does not access Timetable Planner, does not access SSO-protected pages, and does not scrape enrolment-only pages.

Fields the importer tries to extract when available:

- code
- title
- points
- subject
- faculty
- stage
- semesters
- description
- prerequisites
- restrictions
- workload
- assessments
- hasFinalExam
- sourceUrl
- sourceFetchedAt

Data that cannot be guaranteed:

- current course availability
- enrolment eligibility
- final exam format or location
- assessment structure for a future semester
- class times or timetable clashes
- complete workload details

UOA course availability, exam format, and enrolment information must still be checked from official University of Auckland sources before making enrolment decisions.

## MVP Scope

Included:

- Course search by code and title
- Subject, semester, and stage filters
- Course detail pages
- Historical exam pattern display and simple mode analysis
- My Course Plan saved to `localStorage`
- Course Comparison saved to `localStorage`

Not included:

- AI course recommendation
- Automatic timetable generation
- Class time clash detection
- UOA login or official enrolment
- Payment or user accounts
- Broad crawling or scraping every UOA course
- Protected UOA page scraping
