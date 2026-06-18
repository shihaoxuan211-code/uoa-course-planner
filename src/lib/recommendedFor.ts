import type { Course, ReviewRatings } from "@/types/course";
import type { Lang } from "@/lib/i18n";

export interface RecommendTag {
  label: string;
  icon: string;
}

const recommendations: Record<Lang, Record<string, string>> = {
  en: {
    manageableWorkload: "Suitable if you want a manageable workload",
    courseworkOverExams: "Suitable if you prefer coursework over exams",
    dislikeExams: "Good choice if you dislike final exams",
    exchangeStudents: "Good option for exchange or visiting students",
    intbus: "Recommended for International Business students",
    acctg: "Recommended for Accounting students",
    finance: "Recommended for Finance students",
    mktg: "Recommended for Marketing students",
    moderateHighWorkload: "Expect a moderate to high workload",
  },
  zh: {
    manageableWorkload: "适合希望学习负担可控的学生",
    courseworkOverExams: "适合作业考核偏多的学生",
    dislikeExams: "适合不喜欢期末考试的学生",
    exchangeStudents: "适合交换或访学学生",
    intbus: "推荐给国际商务专业学生",
    acctg: "推荐给会计专业学生",
    finance: "推荐给金融专业学生",
    mktg: "推荐给市场营销专业学生",
    moderateHighWorkload: "预计学习压力中等偏高",
  }
};

export function getRecommendTags(course: Course, review?: ReviewRatings, lang: Lang = "en"): RecommendTag[] {
  const t = recommendations[lang] ?? recommendations.en;
  const tags: RecommendTag[] = [];

  const examWeight = getExamWeightPct(course);
  const numAssessments = course.assessments.length;
  const hasGroup = course.hasGroupWork;
  const hasPres = hasPresentation(course);
  const reviewDiff = review?.difficulty ?? 0;
  const reviewWork = review?.workload ?? 0;
  const noExam = !course.hasFinalExam || examWeight === 0;

  const easyScore = computeEasyScore(examWeight, numAssessments, hasGroup, hasPres, reviewDiff, reviewWork, noExam);
  const wlScore = (numAssessments >= 5 ? 2 : numAssessments >= 3 ? 1 : 0) +
                  (reviewWork >= 4 ? 2 : reviewWork >= 3 ? 1 : 0) +
                  (hasGroup ? 1 : 0) + (hasPres ? 1 : 0);

  if (easyScore <= 2) {
    tags.push({ label: t.manageableWorkload, icon: "📈" });
  }

  if (noExam || (examWeight > 0 && examWeight < 25)) {
    tags.push({ label: t.courseworkOverExams, icon: "📝" });
  }

  if (noExam) {
    tags.push({ label: t.dislikeExams, icon: "🚫" });
  }

  if (easyScore <= 3 && reviewWork <= 3 && numAssessments <= 4) {
    tags.push({ label: t.exchangeStudents, icon: "🌏" });
  }

  if (course.subject === "INTBUS") {
    tags.push({ label: t.intbus, icon: "🌐" });
  }
  if (course.subject === "ACCTG") {
    tags.push({ label: t.acctg, icon: "📊" });
  }
  if (course.subject === "FINANCE") {
    tags.push({ label: t.finance, icon: "💰" });
  }
  if (course.subject === "MKTG") {
    tags.push({ label: t.mktg, icon: "📢" });
  }

  if (wlScore >= 4) {
    tags.push({ label: t.moderateHighWorkload, icon: "⚠️" });
  }

  return tags;
}

function parsePct(w: string): number {
  const m = w.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number.parseFloat(m[1]) : 0;
}

function isExamAssess(type: string, weight: string): boolean {
  return /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(type + " " + weight);
}

function getExamWeightPct(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => isExamAssess(a.type, a.weight))
      .reduce((s, a) => s + parsePct(a.weight), 0)
  );
}

function hasPresentation(course: Course): boolean {
  return course.assessments.some(
    (a) => /\bpresentation\b|\bpitch\b|\bpodcast\b|\boral\b|\bseminar\b/i.test(a.type + " " + a.weight)
  );
}

function computeEasyScore(
  examW: number, n: number, grp: boolean, pres: boolean,
  rDiff: number, rWork: number, noExam: boolean
): number {
  let s = 0;
  if (examW >= 50) s += 3; else if (examW >= 30) s += 1; else if (noExam) s -= 1;
  if (n >= 5) s += 2; else if (n >= 4) s += 1; else if (n <= 2 && n > 0) s -= 1;
  if (grp) s += 1;
  if (pres) s += 1;
  if (rDiff >= 4) s += 2; else if (rDiff >= 3) s += 1;
  if (rWork >= 4) s += 2; else if (rWork >= 3) s += 1;
  return s;
}
