import type { Course, ReviewRatings } from "@/types/course";
import type { Lang } from "@/lib/i18n";

const subjectLabels: Record<Lang, Record<string, string>> = {
  en: {
    BUSAN: "business analytics and data-driven decision making",
    INTBUS: "international business and global strategy",
    INFOSYS: "information systems and digital business",
    COMLAW: "commercial law and legal aspects of business",
    MKTG: "marketing strategy and consumer insights",
    MGMT: "management and organisational behaviour",
    ACCTG: "accounting and financial reporting",
    ECON: "economics and policy analysis",
    FINANCE: "finance and investment management",
    COMPSCI: "computer science and software development",
    STATS: "statistics and data analysis",
    MATHS: "mathematics and quantitative reasoning",
    BIOSCI: "biological sciences and research",
    CHEM: "chemistry and laboratory science",
    PHYSICS: "physics and scientific problem-solving",
    PSYCH: "psychology and human behaviour",
    SOFTENG: "software engineering and system design",
    ENGSCI: "engineering science and applied mathematics",
    PROPERTY: "property and real estate",
    OPSMGT: "operations and supply chain management"
  },
  zh: {
    BUSAN: "商业分析和数据驱动决策",
    INTBUS: "国际商务和全球战略",
    INFOSYS: "信息系统和数字商务",
    COMLAW: "商法和商务法律",
    MKTG: "市场营销策略和消费者洞察",
    MGMT: "管理和组织行为学",
    ACCTG: "会计和财务报告",
    ECON: "经济学和政策分析",
    FINANCE: "金融和投资管理",
    COMPSCI: "计算机科学和软件开发",
    STATS: "统计学和数据分析",
    MATHS: "数学和定量推理",
    BIOSCI: "生物科学和研究",
    CHEM: "化学和实验科学",
    PHYSICS: "物理学和科学问题解决",
    PSYCH: "心理学和人类行为",
    SOFTENG: "软件工程和系统设计",
    ENGSCI: "工程科学和应用数学",
    PROPERTY: "房地产",
    OPSMGT: "运营和供应链管理"
  }
};

const fragments: Record<Lang, Record<string, string>> = {
  en: {
    usefulFor: "This course is useful for students interested in",
    assessmentUnavailable: "Assessment details are not publicly available",
    noFinalExam: "there is no final exam",
    includesFinalExam: "includes a final exam",
    involvesGroupWork: "involves group work",
    multipleAssessments: "has multiple assessments",
    aboveAverageDiff: "with above-average difficulty",
    lighterDiff: "with comparatively lighter difficulty",
    theCourse: "The course",
    and: "and",
  },
  zh: {
    usefulFor: "本课程适合对",
    assessmentUnavailable: "考核详情未公开",
    noFinalExam: "无期末考试",
    includesFinalExam: "包含期末考试",
    involvesGroupWork: "涉及小组作业",
    multipleAssessments: "有多项考核",
    aboveAverageDiff: "难度高于平均水平",
    lighterDiff: "难度相对较低",
    theCourse: "该课程",
    and: "、",
  }
};

/** Generate a 2-sentence quick verdict for Simple Mode. */
export function generateQuickVerdict(
  course: Course,
  difficulty?: number,
  review?: ReviewRatings,
  lang: Lang = "en"
): string {
  const f = fragments[lang] ?? fragments.en;
  const subjLabels = subjectLabels[lang] ?? subjectLabels.en;
  const parts: string[] = [];
  const subj = course.subject;
  const subjLabel = subjLabels[subj] || (lang === "zh" ? "该学科领域" : "this subject area");

  if (lang === "zh") {
    parts.push(`${f.usefulFor}${subjLabel}感兴趣的学生。`);
  } else {
    parts.push(`${f.usefulFor} ${subjLabel}.`);
  }

  // Sentence 2: workload/final exam/assessment summary
  const workloadNotes: string[] = [];
  if (course.assessments.length === 0) {
    workloadNotes.push(f.assessmentUnavailable);
  } else {
    if (!course.hasFinalExam) workloadNotes.push(f.noFinalExam);
    else workloadNotes.push(f.includesFinalExam);

    if (course.hasGroupWork) workloadNotes.push(f.involvesGroupWork);
    if (course.assessments.length >= 5) workloadNotes.push(f.multipleAssessments);
  }

  if (difficulty && difficulty >= 4) workloadNotes.push(f.aboveAverageDiff);
  else if (difficulty && difficulty <= 2) workloadNotes.push(f.lighterDiff);

  const joiner = lang === "zh" ? "，" : " and ";
  const workloadSummary = workloadNotes.join(joiner);

  if (lang === "zh") {
    parts.push(`${f.theCourse}${workloadSummary}。`);
  } else {
    parts.push(`${f.theCourse} ${workloadSummary}.`);
  }

  return parts.join(lang === "zh" ? "" : " ");
}
