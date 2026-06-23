"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT, useLang } from "@/lib/i18n";
import type { Course } from "@/types/course";
import { searchCourses, isExactCodeMatch, getRecentCourses, pushRecentCourse } from "@/lib/courseSearch";
import type { SearchResult } from "@/lib/courseSearch";

const CATEGORY_CHIPS = ["Business","Computer Science","Law","Statistics","Psychology","Marketing","Engineering","Science"];
const CATEGORY_MAP: Record<string,string> = {"Business":"ACCTG","Computer Science":"COMPSCI","Law":"LAW","Statistics":"STATS","Psychology":"PSYCH","Marketing":"MKTG","Engineering":"ENGGEN","Science":"BIOSCI"};
const POPULAR_CODES = ["BUSINESS 111","COMPSCI 101","INFOSYS 110","ECON 151","ACCTG 102","PSYCH 108"];

function StarsMini({ value }: { value: number }) {
  return <span className="inline-flex gap-px text-amber-400 text-xs">{"★".repeat(value)}{"☆".repeat(5-value)}</span>;
}

interface HomePageClientProps {
  courses: Course[];
  difficultyMap: Map<string, number>;
  reviewSnippets: { course: Course; comment: string }[];
}

export function HomePageClient({ courses, difficultyMap, reviewSnippets }: HomePageClientProps) {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent courses on mount
  useEffect(() => { setRecentCourses(getRecentCourses(courses)); }, [courses]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    setActiveIndex(-1);
    if (value.trim().length >= 1) {
      const results = searchCourses(courses, value, 6);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setRecentCourses(getRecentCourses(courses));
      setShowDropdown(recentCourses.length > 0);
    }
  }, [courses, recentCourses.length]);

  const onFocus = useCallback(() => {
    if (searchQuery.trim()) {
      if (suggestions.length > 0) setShowDropdown(true);
    } else {
      setRecentCourses(getRecentCourses(courses));
      if (recentCourses.length > 0) setShowDropdown(true);
    }
  }, [searchQuery, suggestions.length, courses, recentCourses.length]);

  const goTo = (course: Course) => {
    pushRecentCourse(course.id);
    setSearchQuery("");
    setShowDropdown(false);
    setActiveIndex(-1);
    router.push(`/courses/${course.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        goTo(items[activeIndex].course);
        return;
      }
      // No active selection — check exact match or go to search
      const q = searchQuery.trim();
      if (!q) { router.push("/courses"); return; }
      const exact = isExactCodeMatch(courses, q);
      if (exact) { pushRecentCourse(exact.id); router.push(`/courses/${exact.id}`); }
      else { router.push(`/courses?q=${encodeURIComponent(q)}`); }
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handled by onKeyDown Enter
  };

  const popular = POPULAR_CODES.map((c) => courses.find((x) => x.code === c)).filter(Boolean) as Course[];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{t.home.heroTitle}</h1>
        <p className="mt-4 text-xl font-medium text-slate-500 sm:text-2xl">{t.home.heroSubtitle}</p>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
          Search courses, compare reviews, understand workload, and build your degree plan.
        </p>

        {/* Search */}
        <div className="relative mt-8 w-full max-w-[640px]">
          <div className="flex rounded-2xl border border-slate-300 bg-white shadow-sm transition focus-within:border-slate-400 focus-within:shadow-md">
            <input ref={inputRef} type="text" value={searchQuery}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={onFocus}
              onKeyDown={handleKeyDown}
              placeholder={t.home.searchPlaceholder}
              className="flex-1 rounded-l-2xl bg-transparent px-5 py-4 text-base outline-none" />
            <button type="submit" onClick={handleSubmit}
              className="m-1.5 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Search
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div ref={dropdownRef}
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {/* Recent courses when empty */}
              {!searchQuery.trim() && recentCourses.length > 0 && (
                <>
                  <p className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Recent</p>
                  {recentCourses.map((c, i) => (
                    <button key={c.id} type="button"
                      onClick={() => goTo(c)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${activeIndex === i ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                      <span className="text-sm font-bold text-ink shrink-0">{c.code}</span>
                      <span className="text-sm text-slate-500 line-clamp-1">{c.title}</span>
                    </button>
                  ))}
                </>
              )}
              {/* Search suggestions */}
              {suggestions.map((s, i) => (
                <button key={s.course.id} type="button"
                  onClick={() => goTo(s.course)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${activeIndex === i ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                  <span className="text-sm font-bold text-ink shrink-0"
                    dangerouslySetInnerHTML={{ __html: s.highlight || s.course.code }} />
                  <span className="text-sm text-slate-500 line-clamp-1">{s.course.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-5 text-xs text-slate-400">{t.home.heroStats}</p>
      </section>

      {/* ── Quick Access ── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-10">
        <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{t.home.exploreTitle}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { href:"/courses", icon:"📚", title:t.home.exploreLibrary, desc:t.home.exploreLibraryDesc },
            { href:"/roadmap", icon:"🗺️", title:t.home.exploreRoadmap, desc:t.home.exploreRoadmapDesc },
            { href:"/recommender", icon:"🤖", title:t.home.exploreAI, desc:t.home.exploreAIDesc },
          ].map((card) => (
            <Link key={card.href} href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-slate-400 hover:shadow-sm">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-ink">{card.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular ── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-10">
        <h2 className="text-sm font-semibold text-ink">{t.home.popularThisWeek}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popular.map((c) => {
            const diff = difficultyMap.get(c.code);
            return (
              <Link key={c.code} href={`/courses/${c.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-slate-400 hover:shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">S{c.stage}</span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{c.code}</p><p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{c.title}</p></div>
                <div className="shrink-0">{diff ? <StarsMini value={diff} /> : null}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Reviews ── */}
      {reviewSnippets.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-10">
          <h2 className="text-sm font-semibold text-ink">{t.home.recentReviewsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {reviewSnippets.map(({ course, comment }) => (
              <Link key={course.code} href={`/courses/${course.id}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-slate-400 hover:shadow-sm">
                <p className="text-xs font-bold text-ink">{course.code}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">"{comment}"</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-14">
        <h2 className="text-sm font-semibold text-ink">{t.home.browseByCategory}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORY_CHIPS.map((cat) => (
            <Link key={cat} href={`/courses?subject=${CATEGORY_MAP[cat]}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-white">{cat}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
