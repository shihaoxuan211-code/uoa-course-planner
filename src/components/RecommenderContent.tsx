"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { useT, useLang } from "@/lib/i18n";
import {
  generateRecommendations,
  type RecommenderInput,
  type RecommendationResult,
  type StudyGoal,
  type AssessmentPref,
  type WorkloadPrefInput
} from "@/lib/recommender";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";

const DEGREE_OPTIONS = ["BCom", "BSc", "BA", "Engineering", "Other"];

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-px text-amber-400 text-xs">
      {Array.from({ length: max }, (_, i) => (<span key={i}>{i < value ? "★" : "☆"}</span>))}
    </span>
  );
}

interface RecommenderContentProps {
  courses: Course[];
}

export function RecommenderContent({ courses }: RecommenderContentProps) {
  const tFull = useT();
  const t = tFull.recommender;
  const { lang } = useLang();

  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [stage, setStage] = useState("any");
  const [targetSemester, setTargetSemester] = useState("Semester 1");
  const [completedCodesRaw, setCompletedCodesRaw] = useState("");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("balanced");
  const [assessmentPref, setAssessmentPref] = useState<AssessmentPref>("none");
  const [workloadPref, setWorkloadPref] = useState<WorkloadPrefInput>("medium");
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleSubmit = () => {
    const codes = completedCodesRaw
      .split(/[,;，；]/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => /^[A-Z]{2,10}\s\d{3}[A-Z]*$/.test(c));

    const input: RecommenderInput = {
      degree,
      major,
      stage,
      targetSemester,
      completedCodes: codes,
      studyGoal,
      assessmentPref,
      workloadPref
    };

    setResults(generateRecommendations(courses, input, 5));
    setShowDisclaimer(true);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.badge}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.subtitle}</p>
      </div>

      {/* Form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.degree}</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder={t.degreePlaceholder}
              list="degree-list"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
            />
            <datalist id="degree-list">
              {DEGREE_OPTIONS.map((o) => (<option key={o} value={o} />))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.major}</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder={t.majorPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.stage}</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              <option value="any">Any</option>
              {["1","2","3"].map((s) => (<option key={s} value={s}>Stage {s}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.targetSemester}</label>
            <select value={targetSemester} onChange={(e) => setTargetSemester(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {["Semester 1","Semester 2","Summer School","any"].map((s) => (
                <option key={s} value={s}>{s === "any" ? "Any" : s}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t.completedCourses}</label>
            <input
              type="text"
              value={completedCodesRaw}
              onChange={(e) => setCompletedCodesRaw(e.target.value)}
              placeholder={t.completedHint}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.studyGoal}</label>
            <select value={studyGoal} onChange={(e) => setStudyGoal(e.target.value as StudyGoal)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              <option value="max-gpa">{t.goalMaxGPA}</option>
              <option value="lower-workload">{t.goalLowerWorkload}</option>
              <option value="avoid-exams">{t.goalAvoidExams}</option>
              <option value="practical">{t.goalPractical}</option>
              <option value="explore">{t.goalExplore}</option>
              <option value="balanced">{t.goalBalanced}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.assessmentPref}</label>
            <select value={assessmentPref} onChange={(e) => setAssessmentPref(e.target.value as AssessmentPref)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              <option value="none">{t.prefNone}</option>
              <option value="coursework">{t.prefCoursework}</option>
              <option value="exams">{t.prefExams}</option>
              <option value="group-projects">{t.prefGroupProjects}</option>
              <option value="avoid-group">{t.prefAvoidGroup}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t.workloadPref}</label>
            <div className="mt-1.5 flex gap-3">
              {([
                { value: "light" as WorkloadPrefInput, label: t.wlLight },
                { value: "medium" as WorkloadPrefInput, label: t.wlMedium },
                { value: "heavy-ok" as WorkloadPrefInput, label: t.wlHeavyOk }
              ]).map((opt) => (
                <button key={opt.value} type="button" onClick={() => setWorkloadPref(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    workloadPref === opt.value
                      ? "border-fern bg-fern/10 text-fern"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
        <button type="button" onClick={handleSubmit}
          className="mt-6 w-full rounded-xl bg-fern px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
          {t.submit}
        </button>
      </section>

      {/* Results */}
      {results && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-ink">{t.topCourses}</h2>
          {results.length > 0 ? (
            results.map((rec) => (
              <div key={rec.course.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/courses/${rec.course.id}`} className="text-lg font-bold text-fern hover:underline">
                      {rec.course.code}
                    </Link>
                    <p className="text-sm font-semibold text-ink line-clamp-1">{rec.course.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatPoints(rec.course.points)} pts · {translateSemesters(rec.course.semesters, lang)} · {translateStage(rec.course.stage, lang)} · {rec.course.subject}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-fern/10 ring-2 ring-fern/30">
                      <span className="text-lg font-bold text-fern">{rec.score}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">{t.matchScore}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {t.difficulty}: <Stars value={Math.min(5, rec.course.stage + (rec.course.hasFinalExam ? 1 : 0))} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {t.workload}: {rec.course.assessments.length >= 5 ? "Heavy" : rec.course.assessments.length >= 3 ? "Medium" : "Light"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {t.examWeight}: {rec.examWeightPct > 0 ? `${rec.examWeightPct}%` : "None"}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    rec.prereqStatus === "eligible" ? "bg-emerald-100 text-emerald-700" :
                    rec.prereqStatus === "possibly" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {rec.prereqStatus === "eligible" ? `✓ ${t.eligible}` :
                     rec.prereqStatus === "possibly" ? `⚠ ${t.possiblyEligible}` : `✗ ${t.missingPrereq}`}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="font-semibold text-emerald-800">💡 {t.whyFits}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {rec.reasons.map((r, i) => (<li key={i} className="text-emerald-700">• {r}</li>))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="font-semibold text-amber-800">⚠️ {t.consider}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {rec.warnings.map((w, i) => (<li key={i} className="text-amber-700">• {w}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              {t.noResults}
            </div>
          )}
        </section>
      )}

      {showDisclaimer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-xs text-amber-800">
          {t.disclaimer}
        </div>
      )}
    </main>
  );
}
