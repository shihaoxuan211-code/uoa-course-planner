"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useT } from "@/lib/i18n";

// ── Types ────────────────────────────────────────────────────────────────

type Difficulty = "Easy" | "Medium" | "Hard" | "Very Hard";
type Workload = "Light" | "Medium" | "Heavy";
type SortMode = "recent" | "highest" | "helpful";

interface StudentReview {
  id: string;
  courseId: string;
  overallRating: number;       // 1-5
  difficulty: Difficulty;
  workload: Workload;
  assessmentFairness: number;  // 1-5
  wouldRecommend: boolean;
  semesterTaken: string;
  comment: string;
  helpfulCount: number;
  reported: boolean;
  createdAt: string;
}

interface CourseReviewsSectionProps {
  courseId: string;
  courseCode: string;
}

// ── Storage ───────────────────────────────────────────────────────────────

function getReviewsKey(courseId: string) {
  return `uoa-course-planner:student-reviews:${courseId}`;
}

function loadReviews(courseId: string): StudentReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getReviewsKey(courseId));
    if (!raw) return [];
    return JSON.parse(raw) as StudentReview[];
  } catch { return []; }
}

function saveReviews(courseId: string, reviews: StudentReview[]) {
  try {
    localStorage.setItem(getReviewsKey(courseId), JSON.stringify(reviews));
  } catch { /* ignore */ }
}

const HELPED_KEY_PREFIX = "uoa-course-planner:helped-review:";

function hasHelped(reviewId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${HELPED_KEY_PREFIX}${reviewId}`) === "1";
}

function markHelped(reviewId: string) {
  try {
    localStorage.setItem(`${HELPED_KEY_PREFIX}${reviewId}`, "1");
  } catch { /* ignore */ }
}

// ── Stars ─────────────────────────────────────────────────────────────────

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < value ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`transition ${i <= value ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
        >
          {i <= value ? "★" : "☆"}
        </button>
      ))}
    </span>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────

function ReviewForm({
  courseId,
  t,
  onSubmit
}: {
  courseId: string;
  t: ReturnType<typeof useT>["studentReviews"];
  onSubmit: () => void;
}) {
  const [overallRating, setOverallRating] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [workload, setWorkload] = useState<Workload>("Medium");
  const [assessmentFairness, setAssessmentFairness] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [semesterTaken, setSemesterTaken] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = overallRating > 0 && assessmentFairness > 0 && wouldRecommend !== null && comment.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    const review: StudentReview = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      courseId,
      overallRating,
      difficulty,
      workload,
      assessmentFairness,
      wouldRecommend,
      semesterTaken: semesterTaken.trim(),
      comment: comment.trim(),
      helpfulCount: 0,
      reported: false,
      createdAt: new Date().toISOString()
    };

    const existing = loadReviews(courseId);
    existing.push(review);
    saveReviews(courseId, existing);

    setSubmitting(false);
    setSubmitted(true);
    onSubmit();
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <span className="text-2xl">✅</span>
        <p className="mt-2 text-sm font-semibold text-emerald-800">{t.submittedMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="text-base font-bold text-ink">{t.writeReview}</h3>
      <p className="mt-1 text-xs text-slate-400">{t.anonymous}</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Overall Rating */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">{t.overallRating}</label>
          <div className="mt-1"><StarInput value={overallRating} onChange={setOverallRating} /></div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs font-semibold text-slate-500">{t.difficultyLabel}</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
          >
            <option value="Easy">{t.easy}</option>
            <option value="Medium">{t.medium}</option>
            <option value="Hard">{t.hard}</option>
            <option value="Very Hard">{t.veryHard}</option>
          </select>
        </div>

        {/* Workload */}
        <div>
          <label className="text-xs font-semibold text-slate-500">{t.workloadLabel}</label>
          <select
            value={workload}
            onChange={(e) => setWorkload(e.target.value as Workload)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
          >
            <option value="Light">{t.light}</option>
            <option value="Medium">{t.medium}</option>
            <option value="Heavy">{t.heavy}</option>
          </select>
        </div>

        {/* Assessment Fairness */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">{t.assessmentFairness}</label>
          <div className="mt-1"><StarInput value={assessmentFairness} onChange={setAssessmentFairness} /></div>
        </div>

        {/* Would Recommend */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">{t.wouldRecommend}</label>
          <div className="mt-1.5 flex gap-3">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                wouldRecommend === true
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              👍 {t.wouldRecommendYes}
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                wouldRecommend === false
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              {t.wouldRecommendNo}
            </button>
          </div>
        </div>

        {/* Semester */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">{t.semesterTaken}</label>
          <input
            type="text"
            value={semesterTaken}
            onChange={(e) => setSemesterTaken(e.target.value)}
            placeholder={t.semesterPlaceholder}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
          />
        </div>

        {/* Comment */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">{t.commentLabel}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={t.commentPlaceholder}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern resize-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-5 w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {submitting ? t.submitting : t.submitReview}
      </button>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────

function ReviewCard({
  review,
  t,
  onRefresh
}: {
  review: StudentReview;
  t: ReturnType<typeof useT>["studentReviews"];
  onRefresh: () => void;
}) {
  const [helped, setHelped] = useState(false);
  const [reported, setReported] = useState(review.reported);

  useEffect(() => {
    setHelped(hasHelped(review.id));
  }, [review.id]);

  const handleHelpful = () => {
    if (helped) return;
    const reviews = loadReviews(review.courseId);
    const idx = reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      reviews[idx].helpfulCount += 1;
      saveReviews(review.courseId, reviews);
    }
    markHelped(review.id);
    setHelped(true);
    onRefresh();
  };

  const handleReport = () => {
    if (reported) return;
    const reviews = loadReviews(review.courseId);
    const idx = reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      reviews[idx].reported = true;
      saveReviews(review.courseId, reviews);
    }
    setReported(true);
    onRefresh();
  };

  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleDateString("en-NZ", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stars value={review.overallRating} />
            <span className="text-sm font-bold text-ink">{review.overallRating}/5</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {review.semesterTaken || t.anonymous} · {dateStr}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            review.difficulty === "Very Hard" ? "bg-rose-100 text-rose-700" :
            review.difficulty === "Hard" ? "bg-amber-100 text-amber-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>
            {t[review.difficulty === "Very Hard" ? "veryHard" : review.difficulty === "Hard" ? "hard" : review.difficulty === "Medium" ? "medium" : "easy"]}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {review.workload === "Heavy" ? t.heavy : review.workload === "Medium" ? t.medium : t.light}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {review.wouldRecommend ? `👍 ${t.wouldRecommendYes}` : t.wouldRecommendNo}
          </span>
        </div>
      </div>

      {/* Comment */}
      <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p>

      {/* Assessment fairness */}
      <p className="mt-2 text-xs text-slate-500">
        {t.assessmentFairness}: <Stars value={review.assessmentFairness} />
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={handleHelpful}
          disabled={helped}
          className={`text-xs font-medium transition ${
            helped ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"
          }`}
        >
          {t.helpful} {review.helpfulCount > 0 && `(${review.helpfulCount})`}
        </button>
        <button
          type="button"
          onClick={handleReport}
          disabled={reported}
          className={`text-xs font-medium transition ${
            reported ? "text-rose-400 cursor-default" : "text-slate-400 hover:text-rose-600"
          }`}
        >
          {reported ? t.reported : t.report}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function CourseReviewsSection({ courseId, courseCode }: CourseReviewsSectionProps) {
  const tFull = useT();
  const t = tFull.studentReviews;
  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setReviews(loadReviews(courseId));
  }, [courseId]);

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, [refresh]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews].filter((r) => !r.reported);
    switch (sortMode) {
      case "highest":
        return sorted.sort((a, b) => b.overallRating - a.overallRating);
      case "helpful":
        return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [reviews, sortMode]);

  // Stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.length;
    const avgRating = reviews.reduce((s, r) => s + r.overallRating, 0) / total;
    const recommendCount = reviews.filter((r) => r.wouldRecommend).length;
    const diffMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, "Very Hard": 4 };
    const avgDiff = reviews.reduce((s, r) => s + (diffMap[r.difficulty] ?? 2), 0) / total;
    const wlMap: Record<string, number> = { Light: 1, Medium: 2, Heavy: 3 };
    const avgWl = reviews.reduce((s, r) => s + (wlMap[r.workload] ?? 2), 0) / total;
    return { total, avgRating, recommendPct: Math.round((recommendCount / total) * 100), avgDiff, avgWl };
  }, [reviews]);

  if (!loaded) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold text-ink">{t.heading}</h2>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-xs text-slate-500">{t.avgRating}</p>
            <p className="mt-1 text-lg font-bold text-ink">{stats.avgRating.toFixed(1)}</p>
            <Stars value={Math.round(stats.avgRating)} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-xs text-slate-500">{t.avgDifficulty}</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {stats.avgDiff <= 1.5 ? t.easy : stats.avgDiff <= 2.5 ? t.medium : stats.avgDiff <= 3.5 ? t.hard : t.veryHard}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-xs text-slate-500">{t.avgWorkload}</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {stats.avgWl <= 1.5 ? t.light : stats.avgWl <= 2.5 ? t.medium : t.heavy}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-xs text-slate-500">{t.recommendationRate}</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{stats.recommendPct}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-xs text-slate-500">{t.heading}</p>
            <p className="mt-1 text-lg font-bold text-ink">{stats.total}</p>
            <p className="text-xs text-slate-400">{t.totalReviews}</p>
          </div>
        </div>
      )}

      {/* Write Review Button / Form */}
      {showForm ? (
        <ReviewForm courseId={courseId} t={t} onSubmit={() => { refresh(); setShowForm(false); }} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-semibold text-slate-600 transition hover:border-fern hover:text-fern shadow-card"
        >
          ✏️ {t.writeReview}
        </button>
      )}

      {/* Sort */}
      {sortedReviews.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          {([
            { value: "recent" as SortMode, label: t.sortRecent },
            { value: "highest" as SortMode, label: t.sortHighest },
            { value: "helpful" as SortMode, label: t.sortHelpful }
          ]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortMode(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                sortMode === opt.value
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Review List */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} t={t} onRefresh={refresh} />
          ))}
        </div>
      ) : (
        stats === null && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-card">
            <p className="text-sm text-slate-500">{t.noReviewsYet}</p>
          </div>
        )
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center">{t.disclaimer}</p>
    </section>
  );
}
