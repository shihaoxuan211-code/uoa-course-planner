"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from "react";

// ── Types ────────────────────────────────────────────────────────────────

export type Lang = "en" | "zh";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    courses: string;
    myPlan: string;
    planner: string;
    compare: string;
    brand: string;
    about: string;
  };
  // Language toggle
  lang: {
    label: string;
    en: string;
    zh: string;
  };
  // Homepage
  home: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    browseCourses: string;
    smartPlanner: string;
    card1Title: string;
    card1Body: string;
    card2Title: string;
    card2Body: string;
    card3Title: string;
    card3Body: string;
    coursesAvailable: string;
    courseCount: string;
    disclaimer: string;
  };
  // Course list
  courses: {
    badge: string;
    heading: string;
    subtitle: string;
    dataSource: string;
    dataSourceImported: string;
    showing: string;
    of: string;
    resetFilters: string;
    loadMore: string;
    noResults: string;
    viewDetails: string;
    search: string;
    subject: string;
    semester: string;
    stage: string;
    allSubjects: string;
    allSemesters: string;
    allStages: string;
    examS1: string;
    all: string;
    hasFinalExam: string;
    noFinalExam: string;
    difficulty: string;
    groupWork: string;
    workload: string;
    low: string;
    medium: string;
    high: string;
    hasGroupWork: string;
    noGroupWork: string;
    disclaimerTitle: string;
    disclaimerBody: string;
  };
  // Course card
  courseCard: {
    points: string;
    semester: string;
    stage: string;
    subject: string;
    finalExam: string;
    s1Exam: string;
    estimatedDifficulty: string;
    infoUnavailable: string;
    viewDetails: string;
    yes: string;
    no: string;
  };
  // Simple course view
  simpleView: {
    quickSummary: string;
    estimatedDifficulty: string;
    estimated: string;
    workload: string;
    easyAPotential: string;
    finalExam: string;
    groupWork: string;
    aRangePotential: string;
    assessmentSnapshot: string;
    assessmentUnavailable: string;
    recommendedFor: string;
    studentReviews: string;
    difficulty: string;
    enjoyment: string;
    usefulness: string;
    quickVerdict: string;
    viewFullDetails: string;
  };
  // Advanced course detail
  courseDetail: {
    backToSimple: string;
    s1ExamInfo: string;
    noExamInS1: string;
    courseInformation: string;
    assessmentStructure: string;
    infoUnavailable: string;
    mayVary: string;
    examMode: string;
    examDate: string;
    duration: string;
    campus: string;
    materials: string;
    mode: string;
    points: string;
    semester: string;
    stage: string;
    subject: string;
    faculty: string;
    prerequisite: string;
    restriction: string;
    workload: string;
  };
  // Add to plan / compare
  addActions: {
    inPlan: string;
    addToPlan: string;
    inCompare: string;
    addToCompare: string;
    alreadyInPlan: string;
    addedToPlan: string;
    alreadyInCompare: string;
    addedToCompare: string;
    compareLimit: string;
  };
  // Planner
  planner: {
    badge: string;
    heading: string;
    subtitle: string;
    year: string;
    major: string;
    semester: string;
    workload: string;
    goal: string;
    any: string;
    recommended: string;
    noCoursesMatch: string;
    profileHint: string;
    notReadyYet: string;
    notReadySubtitle: string;
    missing: string;
    takeFirst: string;
    addToMyPlan: string;
  };
  // Plan (My Plan)
  plan: {
    badge: string;
    heading: string;
    subtitle: string;
    loading: string;
    empty: string;
    emptyDesc: string;
    browseCourses: string;
    currentPoints: string;
    fullTimeMet: string;
    pointsBelow: string;
    coursesSelected: string;
    pointsBySemester: string;
    plannedCourses: string;
    totalPoints: string;
    prerequisites: string;
    allMet: string;
    storage: string;
    storageBrowser: string;
    selectedCourses: string;
    remove: string;
    loadingStatus: string;
    groupedBySemester: string;
    groupedByStage: string;
    hideDetails: string;
    viewDetails: string;
    metBy: string;
    assumedFromProfile: string;
    notSatisfied: string;
    partiallySatisfied: string;
    source: string;
  };
  // Student profile
  profile: {
    heading: string;
    year: string;
    major: string;
    assumedNote: string;
    completedHeading: string;
    noCompleted: string;
    addPlaceholder: string;
    add: string;
    loading: string;
    assumedHeading: string;
    basedOn: string;
    noAssumed: string;
    confirm: string;
    remove: string;
  };
  // Compare
  compare: {
    badge: string;
    heading: string;
    subtitle: string;
    loading: string;
    empty: string;
    emptyDesc: string;
    browseCourses: string;
    coursesSelected: string;
    addMore: string;
    clearComparison: string;
    remove: string;
    field: string;
    courseCode: string;
    courseTitle: string;
    points: string;
    semester: string;
    stage: string;
    prerequisite: string;
    workloadRow: string;
    assessment: string;
    finalExamStatus: string;
    historicalExamMode: string;
    groupWorkStatus: string;
    difficultyStars: string;
    workloadStars: string;
    s1ExamMode: string;
    s1Duration: string;
    s1Materials: string;
    s1Campus: string;
    notes: string;
    infoUnavailable: string;
    notInS1: string;
    hasExam: string;
    noExam: string;
    hasGroup: string;
    noGroup: string;
    easyAIndex: string;
    aRangePotential: string;
    riskLevel: string;
  };
  // Course Insights
  intelligence: {
    heading: string;
    workload: string;
    difficulty: string;
    groupWork: string;
    finalExam: string;
    assessmentFocus: string;
    estimateOnly: string;
  };
  // Grade Outlook
  gradeOutlook: {
    heading: string;
    easyAIndex: string;
    aRangePotential: string;
    workloadLevel: string;
    riskLevel: string;
    why: string;
    disclaimer: string;
  };
  // Assessment Insights
  assessmentInsights: {
    heading: string;
    finalExam: string;
    examWeight: string;
    continuousAssessment: string;
    assessmentBalance: string;
    assessmentStyle: string;
    numberOfAssessments: string;
    groupWork: string;
    presentation: string;
    workloadSignal: string;
  };
  // Course Roadmap
  roadmap: {
    heading: string;
    pathway: string;
    entryPoint: string;
    finalStageCourse: string;
    standaloneCourse: string;
    noConnected: string;
    expandPathway: string;
    collapsePathway: string;
    beforeThis: string;
    afterThis: string;
    prereqsNotInDataset: string;
  };
  // Exam History
  examHistory: {
    heading: string;
    noExamInS1: string;
    year: string;
    semester: string;
    examDate: string;
    examMode: string;
    format: string;
    location: string;
    duration: string;
    materials: string;
    sourceNote: string;
    warningTitle: string;
    warningBody: string;
    notInS1: string;
  };
  // Reviews
  reviews: {
    heading: string;
    demoBadge: string;
    difficulty: string;
    workload: string;
    enjoyment: string;
    usefulness: string;
    positiveComments: string;
    negativeComments: string;
    tips: string;
    disclaimer: string;
  };
  // Disclaimer
  disclaimer: {
    title: string;
    body1: string;
    body2: string;
    body3: string;
  };
  // Exam mode badge
  examModeBadge: {
    notInS1: string;
  };
  // Prereq status
  prereq: {
    heading: string;
    loading: string;
    met: string;
    assumed: string;
    missing: string;
    satisfiedBy: string;
    assumedFromProfile: string;
    notSatisfied: string;
    partiallySatisfied: string;
    assumeNote: string;
    checkedAgainst: string;
    source: string;
  };
  // Footer
  footer: {
    independent: string;
    sourceNote: string;
    privacy: string;
    terms: string;
    disclaimer: string;
  };
  // Beta badge
  beta: {
    badge: string;
    subtitle: string;
  };
  // Feedback
  feedback: {
    button: string;
    title: string;
    description: string;
    typeLabel: string;
    typeBug: string;
    typeCourseError: string;
    typeFeature: string;
    typeSuggestion: string;
    messageLabel: string;
    messagePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    cancel: string;
    success: string;
  };
  // Quick page feedback
  quickFeedback: {
    question: string;
    helpful: string;
    needsImprovement: string;
    thanks: string;
  };
  // About page
  about: {
    heading: string;
    whoTitle: string;
    whoBody: string;
    featuresTitle: string;
    featureCards: Array<{ title: string; body: string }>;
    dataTitle: string;
    dataBody: string;
    disclaimer: string;
    contactTitle: string;
    contactBody: string;
  };
  // Prerequisite warning modal
  prereqWarning: {
    title: string;
    message: string;
    missingPrereqs: string;
    canStillAdd: string;
    cancel: string;
    addAnyway: string;
    missingBadge: string;
    warningBox: string;
    mayNeed: string;
    markCompleted: string;
    completedCourses: string;
  };
  // Shared platform-generated labels
  shared: {
    semesters: Record<string, string>;
    stages: Record<string, string>;
    workloadLabels: Record<string, string>;
    difficultyLabels: Record<string, string>;
    groupWorkLabels: Record<string, string>;
    finalExamLabels: Record<string, string>;
    assessmentFocusLabels: Record<string, string>;
  };
}

// ── Translation data ──────────────────────────────────────────────────────

const en: Translations = {
  nav: {
    home: "Home",
    courses: "Courses",
    myPlan: "My Plan",
    planner: "Planner",
    compare: "Compare",
    brand: "Course Planner",
    about: "About"
  },
  lang: {
    label: "Language",
    en: "EN",
    zh: "中文"
  },
  home: {
    badge: "Independent Student Planning Tool",
    heroTitle: "Plan Your Degree Smarter",
    heroSubtitle: "Compare workload, difficulty, assessments and exam styles across 1000+ courses.",
    browseCourses: "Browse courses",
    smartPlanner: "Smart Planner",
    card1Title: "Search Courses",
    card1Body: "Browse 1000+ courses by subject, stage, semester, difficulty, and exam mode.",
    card2Title: "Compare Difficulty",
    card2Body: "See difficulty estimates, workload levels, assessment styles, and student reviews side by side.",
    card3Title: "Assessment Breakdown",
    card3Body: "Understand exam weights, group work, presentation requirements, and continuous assessment ratios.",
    coursesAvailable: "Courses available",
    courseCount: "1000+ Courses",
    disclaimer: "Course Planner is an independent student-created platform. This website is not affiliated with the University of Auckland. Course data is sourced from public catalogues. Verify all information with official university sources."
  },
  courses: {
    badge: "Course search",
    heading: "Browse courses",
    subtitle: "Search by course code or title, then narrow results by subject, semester, and stage.",
    dataSource: "Current data source:",
    dataSourceImported: "Imported public catalogue data",
    showing: "Showing",
    of: "of",
    resetFilters: "Reset filters",
    loadMore: "Load More Courses",
    noResults: "No sample courses match your current search and filters.",
    viewDetails: "View details",
    search: "Search course code or title",
    subject: "Subject",
    semester: "Semester",
    stage: "Stage",
    allSubjects: "All subjects",
    allSemesters: "All semesters",
    allStages: "All stages",
    examS1: "Exam (S1 2026)",
    all: "All",
    hasFinalExam: "Has Final Exam",
    noFinalExam: "No Final Exam",
    difficulty: "Difficulty",
    groupWork: "Group Work",
    workload: "Workload",
    low: "Low",
    medium: "Medium",
    high: "High",
    hasGroupWork: "Has Group Work",
    noGroupWork: "No Group Work",
    disclaimerTitle: "Planning reference only",
    disclaimerBody: "Imported course data is based on public catalogue information and may be incomplete or outdated. Please verify all information with official University of Auckland sources before making enrolment decisions."
  },
  courseCard: {
    points: "Points",
    semester: "Semester",
    stage: "Stage",
    subject: "Subject",
    finalExam: "Final exam",
    s1Exam: "S1 2026 Exam",
    estimatedDifficulty: "Estimated Difficulty",
    infoUnavailable: "Information unavailable",
    viewDetails: "View details",
    yes: "Yes",
    no: "No"
  },
  simpleView: {
    quickSummary: "Quick Summary",
    estimatedDifficulty: "Estimated Difficulty",
    estimated: "Estimated",
    workload: "Workload",
    easyAPotential: "Easy A Potential",
    finalExam: "Final Exam",
    groupWork: "Group Work",
    aRangePotential: "A Range Potential",
    assessmentSnapshot: "Assessment Snapshot",
    assessmentUnavailable: "Assessment details not publicly available.",
    recommendedFor: "Recommended For",
    studentReviews: "Student Reviews",
    difficulty: "Difficulty",
    enjoyment: "Enjoyment",
    usefulness: "Usefulness",
    quickVerdict: "Quick Verdict",
    viewFullDetails: "View Full Details →"
  },
  courseDetail: {
    backToSimple: "← Back to Simple View",
    s1ExamInfo: "S1 2026 Exam Information",
    noExamInS1: "No final exam listed in Semester 1 2026 timetable.",
    courseInformation: "Course Information",
    assessmentStructure: "Assessment Structure",
    infoUnavailable: "Information unavailable",
    mayVary: "May vary between semesters.",
    examMode: "Exam Mode",
    examDate: "Exam Date",
    duration: "Duration",
    campus: "Campus",
    materials: "Materials",
    mode: "Mode",
    points: "Points",
    semester: "Semester",
    stage: "Stage",
    subject: "Subject",
    faculty: "Faculty",
    prerequisite: "Prerequisite",
    restriction: "Restriction",
    workload: "Workload"
  },
  addActions: {
    inPlan: "In Plan",
    addToPlan: "Add to Plan",
    inCompare: "In Compare",
    addToCompare: "Add to Compare",
    alreadyInPlan: "is already in My Plan.",
    addedToPlan: "added to My Plan.",
    alreadyInCompare: "is already in Compare.",
    addedToCompare: "added to Compare.",
    compareLimit: "You can compare up to 4 courses. Remove one before adding another."
  },
  planner: {
    badge: "Smart Major Planner",
    heading: "Plan Your Semester",
    subtitle: "Select your year, major, and preferences. We'll recommend courses that fit your degree pathway.",
    year: "Year",
    major: "Major",
    semester: "Semester",
    workload: "Workload",
    goal: "Goal",
    any: "Any",
    recommended: "Recommended",
    noCoursesMatch: "No courses match your current criteria.",
    profileHint: "💡 Set your year and major in the Student Profile (My Plan page) to get better prerequisite checks and course recommendations.",
    notReadyYet: "Not Ready Yet",
    notReadySubtitle: "These fit your pathway but prerequisites are not yet satisfied.",
    missing: "Missing:",
    takeFirst: "first.",
    addToMyPlan: "+ Add to My Plan"
  },
  plan: {
    badge: "My Course Plan",
    heading: "Saved courses",
    subtitle: "Your selected courses are stored in this browser with localStorage. No login is required.",
    loading: "Loading plan...",
    empty: "Your plan is empty",
    emptyDesc: "Add courses from the Courses page to build a local plan.",
    browseCourses: "Browse courses",
    currentPoints: "Current Points",
    fullTimeMet: "Full-time load met",
    pointsBelow: "points below full-time",
    coursesSelected: "selected",
    pointsBySemester: "Points by semester",
    plannedCourses: "Planned courses",
    totalPoints: "Total points",
    prerequisites: "Prerequisites",
    allMet: "All met",
    storage: "Storage",
    storageBrowser: "Saved in this browser",
    selectedCourses: "Selected courses",
    remove: "Remove",
    loadingStatus: "Loading...",
    groupedBySemester: "Grouped by semester offered",
    groupedByStage: "Grouped by stage",
    hideDetails: "Hide details",
    viewDetails: "View details",
    metBy: "Met by (confirmed or planned):",
    assumedFromProfile: "Assumed from student profile:",
    notSatisfied: "Not satisfied by Completed, Assumed, or Plan:",
    partiallySatisfied: "Partially satisfied:",
    source: "Source:"
  },
  beta: {
    badge: "🚀 Beta Version",
    subtitle: "Built by UoA Students. Feedback Welcome."
  },
  feedback: {
    button: "💬 Feedback",
    title: "Help Improve This Website",
    description: "Found a bug? Missing course information? Have a feature idea? Let us know.",
    typeLabel: "Feedback Type",
    typeBug: "Bug Report",
    typeCourseError: "Course Information Error",
    typeFeature: "Feature Request",
    typeSuggestion: "General Suggestion",
    messageLabel: "Message",
    messagePlaceholder: "Describe the issue or suggestion...",
    emailLabel: "Email (optional)",
    emailPlaceholder: "your@email.com",
    submit: "Submit",
    cancel: "Cancel",
    success: "Thank you! Your feedback has been received."
  },
  quickFeedback: {
    question: "Was this page helpful?",
    helpful: "👍 Helpful",
    needsImprovement: "👎 Needs Improvement",
    thanks: "Thanks for your feedback!"
  },
  about: {
    heading: "About",
    whoTitle: "Who Built This?",
    whoBody: "This project was created by University of Auckland students to make course planning easier.",
    featuresTitle: "Features",
    featureCards: [
      { title: "Course Search", body: "Browse 1000+ courses across 61 subjects from the UOA public catalogue." },
      { title: "Course Reviews", body: "Student-contributed difficulty, workload, and enjoyment ratings." },
      { title: "Course Planning", body: "Build semester plans with prerequisite checking and credit tracking." },
      { title: "Degree Mapping", body: "Visualize course pathways and prerequisite relationships." },
      { title: "Prerequisite Visualization", body: "See immediate prerequisites clearly with AND/OR logic." },
      { title: "Course Comparison", body: "Compare up to 4 courses side by side across all dimensions." }
    ],
    dataTitle: "Data Sources",
    dataBody: "Course information is sourced from publicly available University of Auckland course catalogue data.",
    disclaimer: "Information may not always be up to date. Please verify important enrolment decisions through official University of Auckland sources.",
    contactTitle: "Contact",
    contactBody: "Questions or suggestions? Use the Feedback button on any page."
  },
  prereqWarning: {
    title: "Prerequisite Warning",
    message: "This course may require prerequisites you have not completed yet.",
    missingPrereqs: "Missing prerequisites:",
    canStillAdd: "You can still add this course to your study plan.",
    cancel: "Cancel",
    addAnyway: "Add Anyway",
    missingBadge: "Missing prerequisites",
    warningBox: "Warning: prerequisite requirements may not yet be satisfied.",
    mayNeed: "You may need to complete the following courses first.",
    markCompleted: "Mark as Completed",
    completedCourses: "Completed Courses"
  },
  profile: {
    heading: "Student Profile",
    year: "Year",
    major: "Major",
    assumedNote: "Assumed courses are generated from your year + major. Confirm each when completed.",
    completedHeading: "✓ Completed Courses",
    noCompleted: "No completed courses recorded.",
    addPlaceholder: "e.g. ACCTG 102",
    add: "Add",
    loading: "Loading profile...",
    assumedHeading: "⚠ Assumed Completed",
    basedOn: "Based on",
    noAssumed: "No assumed courses for",
    confirm: "Confirm",
    remove: "Remove"
  },
  compare: {
    badge: "Course Comparison",
    heading: "Compare courses",
    subtitle: "Compare 2 to 4 sample courses using planning fields such as workload, assessment, final exam status, historical exam mode, and notes.",
    loading: "Loading comparison...",
    empty: "No courses selected for comparison",
    emptyDesc: "Add 2 to 4 courses from the Courses page.",
    browseCourses: "Browse courses",
    coursesSelected: "of 4 courses selected",
    addMore: "Add at least one more course for a useful comparison.",
    clearComparison: "Clear comparison",
    remove: "Remove",
    field: "Field",
    courseCode: "Course code",
    courseTitle: "Course title",
    points: "Points",
    semester: "Semester",
    stage: "Stage",
    prerequisite: "Prerequisite",
    workloadRow: "Workload",
    assessment: "Assessment",
    finalExamStatus: "Final exam status",
    historicalExamMode: "Historical exam mode",
    groupWorkStatus: "Group work status",
    difficultyStars: "Difficulty (1-5)",
    workloadStars: "Workload (1-5)",
    s1ExamMode: "S1 2026 Exam Mode",
    s1Duration: "S1 2026 Duration",
    s1Materials: "S1 2026 Materials",
    s1Campus: "S1 2026 Campus",
    notes: "Notes",
    infoUnavailable: "Information unavailable",
    notInS1: "Not in S1 2026",
    hasExam: "Has final exam",
    noExam: "No final exam",
    hasGroup: "Includes group work",
    noGroup: "No group work listed",
    easyAIndex: "Easy A Index",
    aRangePotential: "A Range Potential",
    riskLevel: "Risk Level"
  },
  intelligence: {
    heading: "Course Insights",
    workload: "Workload",
    difficulty: "Difficulty",
    groupWork: "Group Work",
    finalExam: "Final Exam",
    assessmentFocus: "Assessment Focus",
    estimateOnly: "Assessment-based estimate only."
  },
  gradeOutlook: {
    heading: "Easy A Index & Grade Outlook",
    easyAIndex: "Easy A Index",
    aRangePotential: "A Range Potential",
    workloadLevel: "Workload Level",
    riskLevel: "Risk Level",
    why: "Why",
    disclaimer: "Easy A Index is an independent estimate generated by Course Planner and is not official university performance data."
  },
  assessmentInsights: {
    heading: "Assessment Insights",
    finalExam: "Final Exam",
    examWeight: "Exam Weight",
    continuousAssessment: "Continuous Assessment",
    assessmentBalance: "Assessment Balance",
    assessmentStyle: "Assessment Style",
    numberOfAssessments: "Number of Assessments",
    groupWork: "Group Work",
    presentation: "Presentation",
    workloadSignal: "Workload Signal"
  },
  roadmap: {
    heading: "Course Roadmap",
    pathway: "Pathway:",
    entryPoint: "Entry Point — foundational course",
    finalStageCourse: "Final Stage Course",
    standaloneCourse: "This is a standalone course — no prerequisites or follow-up courses found in the current dataset.",
    noConnected: "No connected courses found in the current dataset.",
    expandPathway: "Expand Pathway",
    collapsePathway: "Collapse Pathway",
    beforeThis: "Before this course",
    afterThis: "After this course",
    prereqsNotInDataset: "Prerequisites (not in current dataset)"
  },
  examHistory: {
    heading: "Exam Mode History",
    noExamInS1: "No final exam listed in Semester 1 2026 timetable.",
    year: "Year",
    semester: "Semester",
    examDate: "Exam date",
    examMode: "Exam mode",
    format: "Format",
    location: "Location",
    duration: "Duration",
    materials: "Materials",
    sourceNote: "Source note",
    warningTitle: "Historical exam pattern warning",
    warningBody: "Historical exam patterns are not official predictions. UOA may change exam mode, date, format, or assessment structure in any semester.",
    notInS1: "Not in S1 2026"
  },
  reviews: {
    heading: "Student Reviews",
    demoBadge: "Demo Data — Example content for demonstration purposes only",
    difficulty: "Difficulty",
    workload: "Workload",
    enjoyment: "Enjoyment",
    usefulness: "Usefulness",
    positiveComments: "✓ Positive Comments",
    negativeComments: "✗ Negative Comments",
    tips: "💡 Tips for Future Students",
    disclaimer: "Reviews are sample data for planning reference only. Based on publicly shared student experiences."
  },
  disclaimer: {
    title: "Planning reference only",
    body1: "Course Planner is an independent student-created platform. This website is not affiliated with, endorsed by, or operated by the University of Auckland.",
    body2: "Course information is sourced from publicly available university catalogues and may be incomplete or outdated. Please verify important information using official University of Auckland sources.",
    body3: "Imported course data is based on public catalogue information and may be incomplete or outdated. Please verify all information with official University of Auckland sources before making enrolment decisions."
  },
  examModeBadge: {
    notInS1: "Not in S1 2026"
  },
  prereq: {
    heading: "Prerequisite Status",
    loading: "Loading profile-based status...",
    met: "Met",
    assumed: "Assumed",
    missing: "Missing",
    satisfiedBy: "Satisfied by:",
    assumedFromProfile: "Assumed from student profile:",
    notSatisfied: "Missing:",
    partiallySatisfied: "Partially satisfied:",
    assumeNote: "This prerequisite is assumed based on your student profile. Please confirm it if you have completed the course.",
    checkedAgainst: "Checked against Completed + Assumed + My Plan courses.",
    source: "Source:"
  },
  footer: {
    independent: "Course Planner is an independent student-created platform and is not affiliated with, endorsed by, or operated by the University of Auckland.",
    sourceNote: "Course information is sourced from publicly available university catalogues and may be incomplete or outdated. University names and course information are referenced for informational purposes only. Please verify important information using official University of Auckland sources before making enrolment decisions.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    disclaimer: "Disclaimer"
  },
  shared: {
    semesters: {
      "Semester 1": "Semester 1",
      "Semester 2": "Semester 2",
      "Summer School": "Summer School"
    },
    stages: {
      "1": "Stage 1",
      "2": "Stage 2",
      "3": "Stage 3",
      "4": "Stage 4"
    },
    workloadLabels: {
      "High workload": "High workload",
      "Medium workload": "Medium workload",
      "Low workload": "Low workload"
    },
    difficultyLabels: {
      "Intensive": "Intensive",
      "Moderate": "Moderate",
      "Light": "Light"
    },
    groupWorkLabels: {
      "Group Work Present": "Group Work Present",
      "No Group Work": "No Group Work"
    },
    finalExamLabels: {
      "Final Exam": "Final Exam",
      "No Final Exam": "No Final Exam"
    },
    assessmentFocusLabels: {}
  }
};

const zh: Translations = {
  nav: {
    home: "首页",
    courses: "课程库",
    myPlan: "我的课程",
    planner: "规划工具",
    compare: "课程对比",
    brand: "课程规划助手",
    about: "关于"
  },
  lang: {
    label: "语言",
    en: "EN",
    zh: "中文"
  },
  home: {
    badge: "学生独立选课规划工具",
    heroTitle: "更聪明地规划你的课程",
    heroSubtitle: "比较1000+门课程的学习负担、难度、考核方式和考试形式。",
    browseCourses: "浏览课程",
    smartPlanner: "智能规划",
    card1Title: "搜索课程",
    card1Body: "按学科、阶段、学期、难度和考试模式浏览 1000+ 门课程。",
    card2Title: "难度对比",
    card2Body: "并排查看难度预估、学习负担水平、考核风格和学生评价。",
    card3Title: "考核分析",
    card3Body: "了解考试权重、小组作业、演讲要求和持续性考核比例。",
    coursesAvailable: "可用课程",
    courseCount: "1000+ 门课程",
    disclaimer: "课程规划助手是一个学生独立创建的平台。本网站与奥克兰大学无关。课程数据来源于公开目录。请以官方大学信息为准。"
  },
  courses: {
    badge: "课程搜索",
    heading: "浏览课程",
    subtitle: "按课程代码或标题搜索，然后按学科、学期和阶段筛选。",
    dataSource: "当前数据来源:",
    dataSourceImported: "导入的公开目录数据",
    showing: "显示",
    of: "/",
    resetFilters: "重置筛选",
    loadMore: "加载更多课程",
    noResults: "没有符合当前搜索和筛选条件的课程。",
    viewDetails: "查看详情",
    search: "搜索课程代码或标题",
    subject: "学科",
    semester: "学期",
    stage: "阶段",
    allSubjects: "全部学科",
    allSemesters: "全部学期",
    allStages: "全部阶段",
    examS1: "考试 (S1 2026)",
    all: "全部",
    hasFinalExam: "有期末考试",
    noFinalExam: "无期末考试",
    difficulty: "难度",
    groupWork: "小组作业",
    workload: "学习负担",
    low: "低",
    medium: "中",
    high: "高",
    hasGroupWork: "有小组作业",
    noGroupWork: "无小组作业",
    disclaimerTitle: "仅供参考",
    disclaimerBody: "导入的课程数据基于公开目录信息，可能不完整或已过时。请在做出选课决定前，通过奥克兰大学官方渠道核实所有信息。"
  },
  courseCard: {
    points: "学分",
    semester: "学期",
    stage: "阶段",
    subject: "学科",
    finalExam: "期末考试",
    s1Exam: "S1 2026 考试",
    estimatedDifficulty: "预估难度",
    infoUnavailable: "暂无信息",
    viewDetails: "查看详情",
    yes: "有",
    no: "无"
  },
  simpleView: {
    quickSummary: "课程概览",
    estimatedDifficulty: "预估难度",
    estimated: "预估",
    workload: "学习负担",
    easyAPotential: "高分潜力",
    finalExam: "期末考试",
    groupWork: "小组作业",
    aRangePotential: "A档潜力",
    assessmentSnapshot: "考核组成",
    assessmentUnavailable: "考核详情未公开。",
    recommendedFor: "适合人群",
    studentReviews: "学生评价",
    difficulty: "难度",
    enjoyment: "趣味性",
    usefulness: "实用性",
    quickVerdict: "快速结论",
    viewFullDetails: "查看完整详情 →"
  },
  courseDetail: {
    backToSimple: "← 返回简洁模式",
    s1ExamInfo: "S1 2026 考试信息",
    noExamInS1: "2026 年第一学期考试时间表中未列出期末考试。",
    courseInformation: "课程信息",
    assessmentStructure: "考核结构",
    infoUnavailable: "暂无信息",
    mayVary: "不同学期可能有所变化。",
    examMode: "考试模式",
    examDate: "考试日期",
    duration: "时长",
    campus: "校区",
    materials: "材料",
    mode: "模式",
    points: "学分",
    semester: "学期",
    stage: "阶段",
    subject: "学科",
    faculty: "院系",
    prerequisite: "先修课程",
    restriction: "限制条件",
    workload: "学习负担"
  },
  addActions: {
    inPlan: "已添加",
    addToPlan: "加入规划",
    inCompare: "已对比",
    addToCompare: "加入对比",
    alreadyInPlan: "已在规划中。",
    addedToPlan: "已加入规划。",
    alreadyInCompare: "已在对比中。",
    addedToCompare: "已加入对比。",
    compareLimit: "最多可对比 4 门课程。请先移除一门再添加。"
  },
  planner: {
    badge: "智能专业规划",
    heading: "规划你的学期",
    subtitle: "选择你的年级、专业和偏好。我们将推荐适合你学位路径的课程。",
    year: "年级",
    major: "专业",
    semester: "学期",
    workload: "学习负担",
    goal: "目标",
    any: "任意",
    recommended: "推荐课程",
    noCoursesMatch: "没有符合当前条件的课程。",
    profileHint: "💡 在\"我的课程\"页面设置你的年级和专业，以获得更准确的先修课程检查和课程推荐。",
    notReadyYet: "暂不满足条件",
    notReadySubtitle: "这些课程符合你的路径，但先修课程尚未满足。",
    missing: "缺失:",
    takeFirst: "先修。",
    addToMyPlan: "+ 加入我的课程"
  },
  plan: {
    badge: "我的课程计划",
    heading: "已保存课程",
    subtitle: "你选择的课程通过 localStorage 保存在此浏览器中。无需登录。",
    loading: "加载中...",
    empty: "你的计划为空",
    emptyDesc: "从课程页面添加课程来建立本地计划。",
    browseCourses: "浏览课程",
    currentPoints: "当前学分",
    fullTimeMet: "已满足全日制要求",
    pointsBelow: "学分低于全日制要求",
    coursesSelected: "已选择",
    pointsBySemester: "按学期分列学分",
    plannedCourses: "已规划课程",
    totalPoints: "总学分",
    prerequisites: "先修课程",
    allMet: "全部满足",
    storage: "存储",
    storageBrowser: "保存在此浏览器中",
    selectedCourses: "已选课程",
    remove: "移除",
    loadingStatus: "加载中...",
    groupedBySemester: "按开课学期分组",
    groupedByStage: "按阶段分组",
    hideDetails: "隐藏详情",
    viewDetails: "查看详情",
    metBy: "已满足（已确认或已规划）:",
    assumedFromProfile: "从学生档案推断:",
    notSatisfied: "未满足（已完成 + 推断 + 规划中）:",
    partiallySatisfied: "部分满足:",
    source: "来源:"
  },
  beta: {
    badge: "🚀 测试版",
    subtitle: "由奥大学生开发，欢迎反馈意见。"
  },
  feedback: {
    button: "💬 意见反馈",
    title: "帮助改进这个网站",
    description: "发现错误？课程信息有误？有新功能建议？欢迎告诉我们。",
    typeLabel: "反馈类型",
    typeBug: "错误报告",
    typeCourseError: "课程信息错误",
    typeFeature: "功能建议",
    typeSuggestion: "一般建议",
    messageLabel: "留言",
    messagePlaceholder: "描述问题或建议...",
    emailLabel: "邮箱（选填）",
    emailPlaceholder: "your@email.com",
    submit: "提交",
    cancel: "取消",
    success: "感谢反馈！我们已收到你的意见。"
  },
  quickFeedback: {
    question: "这个页面对你有帮助吗？",
    helpful: "👍 有帮助",
    needsImprovement: "👎 有问题",
    thanks: "感谢你的反馈！"
  },
  about: {
    heading: "关于",
    whoTitle: "谁开发的？",
    whoBody: "这个项目由奥克兰大学学生开发，旨在帮助学生更轻松地进行课程规划。",
    featuresTitle: "功能",
    featureCards: [
      { title: "课程搜索", body: "浏览来自奥大公开目录的1000+门课程，涵盖61个学科。" },
      { title: "课程评价", body: "学生贡献的难度、学习负担和趣味性评分。" },
      { title: "课程规划", body: "建立学期计划，包含先修课程检查和学分追踪。" },
      { title: "学位路径", body: "可视化课程路径和先修课程关系。" },
      { title: "先修课程可视化", body: "清晰查看直接先修课程，包含AND/OR逻辑。" },
      { title: "课程对比", body: "最多同时对比4门课程的所有维度。" }
    ],
    dataTitle: "数据来源",
    dataBody: "课程信息来源于奥克兰大学公开课程目录数据。",
    disclaimer: "课程信息可能存在延迟，请在正式选课前以奥克兰大学官方信息为准。",
    contactTitle: "联系方式",
    contactBody: "有问题或建议？欢迎使用页面上的意见反馈功能。"
  },
  prereqWarning: {
    title: "先修课程提醒",
    message: "这门课程可能需要你先完成部分先修课程。",
    missingPrereqs: "缺少的先修课程：",
    canStillAdd: "你仍然可以将其加入学习规划。",
    cancel: "取消",
    addAnyway: "仍然加入",
    missingBadge: "缺少先修课程",
    warningBox: "提醒：先修课程要求可能尚未满足。",
    mayNeed: "你可能需要先完成以下课程。",
    markCompleted: "标记为已完成",
    completedCourses: "已完成课程"
  },
  profile: {
    heading: "学生档案",
    year: "年级",
    major: "专业",
    assumedNote: "推断课程根据你的年级和专业生成。完成后请逐一确认。",
    completedHeading: "✓ 已完成课程",
    noCompleted: "未记录已完成课程。",
    addPlaceholder: "例如 ACCTG 102",
    add: "添加",
    loading: "加载档案中...",
    assumedHeading: "⚠ 推断已完成",
    basedOn: "基于",
    noAssumed: "没有推断课程",
    confirm: "确认",
    remove: "移除"
  },
  compare: {
    badge: "课程对比",
    heading: "对比课程",
    subtitle: "对比 2 到 4 门课程，涵盖学习负担、考核、期末考试状态、历史考试模式和备注等规划字段。",
    loading: "加载对比中...",
    empty: "未选择对比课程",
    emptyDesc: "从课程页面添加 2 到 4 门课程。",
    browseCourses: "浏览课程",
    coursesSelected: "/ 4 门课程已选择",
    addMore: "请至少再添加一门课程以进行有意义的对比。",
    clearComparison: "清除对比",
    remove: "移除",
    field: "字段",
    courseCode: "课程代码",
    courseTitle: "课程标题",
    points: "学分",
    semester: "学期",
    stage: "阶段",
    prerequisite: "先修课程",
    workloadRow: "学习负担",
    assessment: "考核",
    finalExamStatus: "期末考试状态",
    historicalExamMode: "历史考试模式",
    groupWorkStatus: "小组作业状态",
    difficultyStars: "难度 (1-5)",
    workloadStars: "学习负担 (1-5)",
    s1ExamMode: "S1 2026 考试模式",
    s1Duration: "S1 2026 时长",
    s1Materials: "S1 2026 材料",
    s1Campus: "S1 2026 校区",
    notes: "备注",
    infoUnavailable: "暂无信息",
    notInS1: "不在 S1 2026",
    hasExam: "有期末考试",
    noExam: "无期末考试",
    hasGroup: "包含小组作业",
    noGroup: "未列出小组作业",
    easyAIndex: "高分指数",
    aRangePotential: "A档潜力",
    riskLevel: "风险水平"
  },
  intelligence: {
    heading: "课程洞察",
    workload: "学习负担",
    difficulty: "难度",
    groupWork: "小组作业",
    finalExam: "期末考试",
    assessmentFocus: "考核重点",
    estimateOnly: "仅基于考核结构预估。"
  },
  gradeOutlook: {
    heading: "高分指数与成绩展望",
    easyAIndex: "高分指数",
    aRangePotential: "A档潜力",
    workloadLevel: "学习负担水平",
    riskLevel: "风险水平",
    why: "原因",
    disclaimer: "高分指数是由课程规划助手生成的独立预估，并非官方大学成绩数据。"
  },
  assessmentInsights: {
    heading: "考核分析",
    finalExam: "期末考试",
    examWeight: "考试权重",
    continuousAssessment: "持续性考核",
    assessmentBalance: "考核平衡",
    assessmentStyle: "考核风格",
    numberOfAssessments: "考核数量",
    groupWork: "小组作业",
    presentation: "演讲",
    workloadSignal: "学习负担信号"
  },
  roadmap: {
    heading: "课程路线图",
    pathway: "路径:",
    entryPoint: "入门课程 — 基础课程",
    finalStageCourse: "最终阶段课程",
    standaloneCourse: "这是一门独立课程 — 当前数据集中未找到先修或后续课程。",
    noConnected: "当前数据集中未找到关联课程。",
    expandPathway: "展开学习路径",
    collapsePathway: "收起学习路径",
    beforeThis: "此课程之前",
    afterThis: "此课程之后",
    prereqsNotInDataset: "先修课程（不在当前数据集中）"
  },
  examHistory: {
    heading: "考试模式历史",
    noExamInS1: "2026 年第一学期考试时间表中未列出期末考试。",
    year: "年份",
    semester: "学期",
    examDate: "考试日期",
    examMode: "考试模式",
    format: "形式",
    location: "地点",
    duration: "时长",
    materials: "材料",
    sourceNote: "来源备注",
    warningTitle: "历史考试模式警告",
    warningBody: "历史考试模式并非官方预测。奥克兰大学可能在任何学期更改考试模式、日期、形式或考核结构。",
    notInS1: "不在 S1 2026"
  },
  reviews: {
    heading: "学生评价",
    demoBadge: "示例数据 — 仅用于演示目的",
    difficulty: "难度",
    workload: "学习负担",
    enjoyment: "趣味性",
    usefulness: "实用性",
    positiveComments: "✓ 正面评价",
    negativeComments: "✗ 负面评价",
    tips: "💡 给未来学生的建议",
    disclaimer: "评价为规划参考示例数据。基于公开分享的学生体验。"
  },
  disclaimer: {
    title: "仅供参考",
    body1: "课程规划助手是一个学生独立创建的平台。本网站与奥克兰大学无关，亦未获得其认可或运营。",
    body2: "课程信息来源于公开的大学目录，可能不完整或已过时。请在做出选课决定前，通过奥克兰大学官方渠道核实重要信息。",
    body3: "导入的课程数据基于公开目录信息，可能不完整或已过时。请在做出选课决定前，通过奥克兰大学官方渠道核实所有信息。"
  },
  examModeBadge: {
    notInS1: "不在 S1 2026"
  },
  prereq: {
    heading: "先修课程状态",
    loading: "正在加载档案状态...",
    met: "已满足",
    assumed: "推断满足",
    missing: "缺失",
    satisfiedBy: "满足条件:",
    assumedFromProfile: "从学生档案推断:",
    notSatisfied: "缺失:",
    partiallySatisfied: "部分满足:",
    assumeNote: "此先修课程根据你的学生档案推断。如你已完成该课程，请确认。",
    checkedAgainst: "已对比已完成 + 推断 + 我的规划课程进行检查。",
    source: "来源:"
  },
  footer: {
    independent: "课程规划助手是一个学生独立创建的平台，与奥克兰大学无关，亦未获得其认可或运营。",
    sourceNote: "课程信息来源于公开的大学目录，可能不完整或已过时。大学名称和课程信息仅供参考。请在做出选课决定前，通过奥克兰大学官方渠道核实重要信息。",
    privacy: "隐私政策",
    terms: "使用条款",
    disclaimer: "免责声明"
  },
  shared: {
    semesters: {
      "Semester 1": "第一学期",
      "Semester 2": "第二学期",
      "Summer School": "暑期课程"
    },
    stages: {
      "1": "一阶段课程",
      "2": "二阶段课程",
      "3": "三阶段课程",
      "4": "四阶段课程"
    },
    workloadLabels: {
      "High workload": "高学习负担",
      "Medium workload": "中等学习负担",
      "Low workload": "较低学习负担"
    },
    difficultyLabels: {
      "Intensive": "高强度",
      "Moderate": "中等",
      "Light": "轻松"
    },
    groupWorkLabels: {
      "Group Work Present": "有小组作业",
      "No Group Work": "无小组作业"
    },
    finalExamLabels: {
      "Final Exam": "期末考试",
      "No Final Exam": "无期末考试"
    },
    assessmentFocusLabels: {}
  }
};

// ── Context ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "uoa-course-planner:lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en
});

// ── Provider ──────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") {
        setLangState(stored);
      }
    } catch { /* localStorage unavailable */ }
    setReady(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* localStorage unavailable */ }
  }, []);

  // Prevent hydration mismatch — always render "en" on first pass
  const t = ready ? (lang === "zh" ? zh : en) : en;

  return (
    <LanguageContext.Provider value={{ lang: ready ? lang : "en", setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useT(): Translations {
  return useContext(LanguageContext).t;
}

export function useLang(): { lang: Lang; setLang: (lang: Lang) => void } {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang };
}

// ── Standalone function for non-React code ─────────────────────────────────

const data: Record<Lang, Translations> = { en, zh };

export function getTranslations(lang: Lang): Translations {
  return data[lang] ?? en;
}
