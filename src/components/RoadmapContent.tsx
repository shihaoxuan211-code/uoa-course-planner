"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { useT, useLang } from "@/lib/i18n";
import { generateRoadmap, simulateMajorChange, type RoadmapInput, type RoadmapResult, type SemesterPlan, type CoursePlanItem, type MajorChangeComparison } from "@/lib/degreeRoadmap";
import { resolveTemplate, degreeTemplates, type TemplateKey } from "@/data/degree-templates";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";

const DEGREE_OPTIONS = ["BCom", "BSc", "BA", "Engineering", "BProp", "Other"];
const ALL_MAJOR_KEYS: TemplateKey[] = ["bcom-management","bcom-marketing","bcom-infosys","bcom-intbus","bsc-compsci","eng-software"];

interface RoadmapContentProps { courses: Course[] }

const BADGE_COLORS: Record<string,string> = {
  required: "bg-emerald-100 text-emerald-700", major: "bg-sky-100 text-sky-700",
  elective: "bg-amber-100 text-amber-700", recommended: "bg-violet-100 text-violet-700"
};

function CoursePlanCard({ item, t, lang }: { item: CoursePlanItem; t: any; lang: string }) {
  const c = item.course;
  return (
    <div className={`rounded-lg border p-3 text-xs ${item.type==="required"?"border-emerald-300 bg-emerald-50/30":item.type==="major"?"border-sky-300 bg-sky-50/30":"border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Link href={`/courses/${c.id}`} className="font-bold text-fern hover:underline">{c.code}</Link>
            {item.highPriority && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600" title={t.highPriorityTooltip}>{t.highPriorityFlag}</span>}
          </div>
          <p className="text-slate-600 line-clamp-1 mt-0.5">{c.title}</p>
        </div>
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{formatPoints(c.points)} pts</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-slate-400">{translateSemesters(c.semesters, lang as any)}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{translateStage(c.stage, lang as any)}</span>
        <span className={`rounded px-1.5 py-0.5 font-medium ${BADGE_COLORS[item.type]}`}>{t[`badge${item.type.charAt(0).toUpperCase()+item.type.slice(1)}` as keyof typeof t] ?? item.type}</span>
        {item.availability && (
          <span className={`rounded px-1.5 py-0.5 font-medium ${item.availability.includes("Summer")?"bg-green-100 text-green-700":"bg-rose-100 text-rose-600"}`}>
            {item.availability === "Semester 1 only" ? t.availSem1Only : item.availability === "Semester 2 only" ? t.availSem2Only : item.availability === "Summer School available" ? t.availSummer : item.availability}
          </span>
        )}
      </div>
    </div>
  );
}

export function RoadmapContent({ courses }: RoadmapContentProps) {
  const tFull = useT();
  const t = tFull.degreeRoadmap;
  const { lang } = useLang();
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [currentYear, setCurrentYear] = useState("first");
  const [completedRaw, setCompletedRaw] = useState("");
  const [gradTiming, setGradTiming] = useState<"asap"|"balanced"|"part-time"|"not-sure">("asap");
  const [semesterLoad, setSemesterLoad] = useState<"2"|"3"|"4"|"flexible">("3");
  const [includeSummer, setIncludeSummer] = useState<"yes"|"no"|"maybe">("maybe");
  const [startSemester, setStartSemester] = useState<"Semester 1"|"Semester 2">("Semester 1");
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [compareMajor, setCompareMajor] = useState("");
  const [comparison, setComparison] = useState<MajorChangeComparison | null>(null);

  const handleSubmit = () => {
    const codes = completedRaw.split(/[,;，；]/).map((c)=>c.trim().toUpperCase()).filter((c)=>/^[A-Z]{2,10}\s\d{3}[A-Z]*$/.test(c));
    setResult(generateRoadmap(courses, { degree, major, currentYear, completedCodes: codes, gradTiming, semesterLoad, includeSummer, startSemester }));
    setComparison(null);
  };
  const handleCompare = () => {
    if (!compareMajor || !result) return;
    const ft = resolveTemplate(degree, major); if (!ft) return;
    const tk = ALL_MAJOR_KEYS.find((k)=>k===compareMajor); if (!tk) return;
    const cc = completedRaw.split(/[,;，；]/).map((c)=>c.trim().toUpperCase()).filter((c)=>/^[A-Z]{2,10}\s\d{3}[A-Z]*$/.test(c));
    setComparison(simulateMajorChange(cc, ft, degreeTemplates[tk]));
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
          <div><label className="text-xs font-semibold text-slate-500">{t.degree}</label><input type="text" value={degree} onChange={(e)=>setDegree(e.target.value)} placeholder={t.degreePlaceholder} list="deg-list" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern" /><datalist id="deg-list">{DEGREE_OPTIONS.map((o)=>(<option key={o} value={o}/>))}</datalist></div>
          <div><label className="text-xs font-semibold text-slate-500">{t.major}</label><input type="text" value={major} onChange={(e)=>setMajor(e.target.value)} placeholder={t.majorPlaceholder} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern" /></div>
          <div><label className="text-xs font-semibold text-slate-500">{t.currentYear}</label><select value={currentYear} onChange={(e)=>setCurrentYear(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"><option value="first">{t.yearFirst}</option><option value="second">{t.yearSecond}</option><option value="third">{t.yearThird}</option><option value="fourth">{t.yearFourth}</option><option value="other">{t.yearOther}</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500">{t.gradTiming}</label><select value={gradTiming} onChange={(e)=>setGradTiming(e.target.value as any)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"><option value="asap">{t.gradAsap}</option><option value="balanced">{t.gradBalanced}</option><option value="part-time">{t.gradPartTime}</option><option value="not-sure">{t.gradNotSure}</option></select></div>
          <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500">{t.completedCourses}</label><input type="text" value={completedRaw} onChange={(e)=>setCompletedRaw(e.target.value)} placeholder={t.completedHint} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern" /></div>
          <div><label className="text-xs font-semibold text-slate-500">{t.semesterLoad}</label><select value={semesterLoad} onChange={(e)=>setSemesterLoad(e.target.value as any)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"><option value="2">{t.load2}</option><option value="3">{t.load3}</option><option value="4">{t.load4}</option><option value="flexible">{t.loadFlexible}</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500">{t.summerSchool}</label><div className="mt-1.5 flex gap-2">{(["yes","no","maybe"]as const).map((v)=>(<button key={v} type="button" onClick={()=>setIncludeSummer(v)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${includeSummer===v?"border-fern bg-fern/10 text-fern":"border-slate-300 text-slate-600 hover:border-slate-400"}`}>{t[v]}</button>))}</div></div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.startImpactTitle}</label>
            <div className="mt-1.5 flex gap-2">
              {(["Semester 1","Semester 2"]as const).map((v)=>(<button key={v} type="button" onClick={()=>setStartSemester(v)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${startSemester===v?"border-fern bg-fern/10 text-fern":"border-slate-300 text-slate-600 hover:border-slate-400"}`}>{v}</button>))}
            </div>
          </div>
        </div>
        <button type="button" onClick={handleSubmit} className="mt-6 w-full rounded-xl bg-fern px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">{t.submit}</button>
      </section>

      {result && (<>
        {/* ── Risk Assessment ── */}
        <section className={`rounded-xl border-2 p-6 shadow-card ${
          result.risk.level==="low"?"border-emerald-300 bg-emerald-50/50":
          result.risk.level==="medium"?"border-amber-300 bg-amber-50/50":"border-rose-300 bg-rose-50/50"
        }`}>
          <h2 className="text-xl font-bold text-ink">{t.riskTitle}</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${
              result.risk.level==="low"?"bg-emerald-100 text-emerald-800":
              result.risk.level==="medium"?"bg-amber-100 text-amber-800":"bg-rose-100 text-rose-800"
            }`}>
              {result.risk.level==="low"?t.riskLow:result.risk.level==="medium"?t.riskMedium:t.riskHigh}
            </span>
          </div>
          {result.risk.reasons.length>0&&(
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600">{t.riskReasons}:</p>
              <ul className="mt-1.5 space-y-1">{result.risk.reasons.map((r,i)=>(<li key={i} className="text-sm text-slate-700">• {r}</li>))}</ul>
            </div>
          )}
          {/* Conflicts */}
          {result.risk.conflicts.length>0&&(
            <div className="mt-3 space-y-1">{result.risk.conflicts.map((c,i)=>(<div key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">⚠️ {t.conflictBody.replace("{{semester}}",c.semester).replace("{{count}}",String(c.count))}</div>))}</div>
          )}
          {/* Start impact */}
          {result.risk.startImpact&&<div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800">📅 {t.startImpactBody}</div>}
          {/* Load warning */}
          {semesterLoad==="2"&&<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">⚠️ {t.semesterLoadRisk}</div>}
        </section>

        {/* ── Potential Delays ── */}
        {result.risk.delays.length>0&&(
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="text-lg font-bold text-rose-800">⚠️ {t.delayTitle}</h2>
            <ul className="mt-2 space-y-1">{result.risk.delays.map((d,i)=>(<li key={i} className="text-sm text-rose-700">⚠ {d}</li>))}</ul>
          </section>
        )}

        {/* ── Degree Audit ── */}
        {result.audit.templateFound?(
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-ink">{t.auditTitle}</h2><span className="rounded-full bg-fern/10 px-2 py-0.5 text-[10px] font-semibold text-fern">{result.audit.templateName}</span></div>
            <div className="mt-4"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">{t.auditProgress}</span><span className="font-bold text-fern">{result.audit.progressPercent}%</span></div><div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-200"><div className="h-2.5 rounded-full bg-fern transition-all" style={{width:`${result.audit.progressPercent}%`}}/></div></div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><p className="text-xs font-semibold text-emerald-700">{t.auditRequiredCompleted}</p><ul className="mt-1.5 space-y-1">{result.audit.requiredCourses.filter((c)=>c.completed).map((c)=>(<li key={c.code} className="text-xs text-emerald-700">✓ {c.code}</li>))}{result.audit.stage2Courses.filter((c)=>c.completed).map((c)=>(<li key={c.code} className="text-xs text-emerald-700">✓ {c.code}</li>))}{result.audit.stage3Courses.filter((c)=>c.completed).map((c)=>(<li key={c.code} className="text-xs text-emerald-700">✓ {c.code}</li>))}</ul></div>
              <div><p className="text-xs font-semibold text-rose-700">{t.auditRequiredMissing}</p><ul className="mt-1.5 space-y-1">{result.audit.requiredCourses.filter((c)=>!c.completed).map((c)=>(<li key={c.code} className="text-xs text-rose-600">⚠ {c.code}</li>))}{result.audit.stage2Courses.filter((c)=>!c.completed).map((c)=>(<li key={c.code} className="text-xs text-rose-600">⚠ {c.code}</li>))}{result.audit.stage3Courses.filter((c)=>!c.completed).map((c)=>(<li key={c.code} className="text-xs text-rose-600">⚠ {c.code}</li>))}</ul></div>
            </div>
          </section>
        ):(
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"><h2 className="text-lg font-bold text-ink">{t.auditTitle}</h2><p className="mt-2 text-sm text-slate-500">{t.auditNoTemplate}</p></section>
        )}

        {/* Progress Summary */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-ink">{t.progressTitle}</h2><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{t.betaLabel}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.completedPoints}</p><p className="mt-1 text-xl font-bold text-ink">{result.progress.completedPoints}</p></div><div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.remainingPoints}</p><p className="mt-1 text-xl font-bold text-amber-700">{result.progress.remainingPoints}</p></div><div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.remainingCourses}</p><p className="mt-1 text-xl font-bold text-ink">~{result.progress.estimatedRemainingCourses}</p></div><div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.estimatedGrad}</p><p className="mt-1 text-lg font-bold text-fern">{result.progress.estimatedGrad}</p></div></div>
          {result.progress.delayRisk&&<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠️ {t.delayWarning}</div>}
        </section>

        {/* Semester Plan */}
        <section className="space-y-4"><h2 className="text-xl font-bold text-ink">{t.planTitle}</h2>
          {result.plan.map((sem,i)=>(<div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"><div className="flex items-center justify-between gap-3"><h3 className="text-base font-bold text-ink">{sem.label}</h3><div className="flex gap-2 text-xs text-slate-500"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{sem.points} {t.semesterPoints}</span><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{sem.courses.length} {t.semesterCourses}</span></div></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{sem.courses.map((item)=>(<CoursePlanCard key={item.course.code} item={item} t={t} lang={lang}/>))}</div></div>))}
          {result.plan.length===0&&<div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Enter your completed courses above.</div>}
        </section>

        {/* Required vs Elective */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"><h2 className="text-lg font-bold text-ink">{t.requiredHeading}</h2><div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-lg bg-fern/5 p-3"><p className="font-semibold text-fern">Required / Major</p><p className="mt-1 text-slate-600">{t.requiredDesc}</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="font-semibold text-amber-700">{t.electiveHeading}</p><p className="mt-1 text-amber-800">{t.electiveDesc}</p></div></div></section>

        {/* Major Change */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"><h2 className="text-lg font-bold text-ink">{t.majorChangeTitle}</h2><div className="mt-3 flex gap-3"><select value={compareMajor} onChange={(e)=>setCompareMajor(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"><option value="">{t.majorChangeLabel}</option>{ALL_MAJOR_KEYS.map((k)=>(<option key={k} value={k}>{degreeTemplates[k].degree} — {degreeTemplates[k].major}</option>))}</select><button type="button" onClick={handleCompare} disabled={!compareMajor} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">Compare</button></div>
          {comparison&&(<div className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><div className="rounded-lg bg-emerald-50 p-3"><p className="font-semibold text-emerald-800">{t.majorChangeOverlap}</p><p className="mt-1 text-emerald-700">{comparison.overlapping.length>0?comparison.overlapping.join(", "):"None"}</p></div><div className="rounded-lg bg-slate-100 p-3"><p className="font-semibold text-slate-700">{t.majorChangeNoLonger}</p><p className="mt-1 text-slate-500">{comparison.noLongerNeeded.length>0?comparison.noLongerNeeded.join(", "):"None"}</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="font-semibold text-amber-800">{t.majorChangeAdditional}</p><p className="mt-1 text-amber-700">{comparison.additionalRequired.join(", ")}<br/><span className="font-bold">{comparison.estimatedExtraSemesters} {t.majorChangeExtraSems}</span></p></div></div>)}
        </section>

        {result.warnings.length>0&&<section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-lg font-bold text-amber-800">⚠️ Warnings</h2><ul className="mt-2 space-y-1">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-amber-700">• {w}</li>))}</ul></section>}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"><h2 className="text-lg font-bold text-ink">{t.alternativeTitle}</h2><ul className="mt-3 space-y-1">{result.alternatives.map((a,i)=>(<li key={i} className="text-sm text-slate-600">💡 {a}</li>))}</ul></section>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-xs text-amber-800">{t.disclaimer}</div>
      </>)}
    </main>
  );
}
