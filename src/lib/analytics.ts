// ── GA4 / Vercel Analytics Utility ──────────────────────────────────────

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// ── Types ────────────────────────────────────────────────────────────────

interface GA4Event {
  name: string;
  params?: Record<string, string | number>;
}

// ── GA4 gtag helper ──────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// ── Page View ────────────────────────────────────────────────────────────

/** Call on route change to track page views */
export function trackPageView(url: string) {
  if (!GA_ID) return;

  gtag("config", GA_ID, {
    page_path: url
  });
}

// ── Event Tracking ───────────────────────────────────────────────────────

export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (!GA_ID) return;

  gtag("event", name, params);
}

// ── Pre-defined Events ───────────────────────────────────────────────────

/** Course search performed */
export function trackCourseSearch(query: string, resultCount: number) {
  trackEvent("course_search", {
    search_query: query,
    result_count: resultCount
  });
}

/** AI recommendation generated */
export function trackAIRecommendation(major: string, degree: string, count: number) {
  trackEvent("ai_recommendation", { major, degree, recommendation_count: count });
}

/** Degree roadmap generated */
export function trackRoadmapGenerated(degree: string, major: string) {
  trackEvent("roadmap_generated", { degree, major });
}

/** Graduation risk analysis */
export function trackRiskAnalysis(riskLevel: string) {
  trackEvent("risk_analysis_generated", { risk_level: riskLevel });
}

/** Course review submitted */
export function trackReviewSubmitted(courseCode: string) {
  trackEvent("review_submitted", { course_code: courseCode });
}

/** Track language toggle */
export function trackLanguageToggle(lang: string) {
  trackEvent("language_toggle", { language: lang });
}

/** Quick page feedback */
export function trackPageFeedback(courseId: string, value: "helpful" | "needs-improvement") {
  trackEvent("page_feedback", { course_id: courseId, feedback_value: value });
}

// ── GA4 Script Injection ─────────────────────────────────────────────────

export const GA_SCRIPT = GA_ID
  ? `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });
`
  : "";
