"use client";

import { useState } from "react";
import type { Course } from "@/types/course";
import { computeRoadmap, buildFullChain } from "@/lib/courseRoadmap";
import type { ChainNode } from "@/lib/courseRoadmap";
import { useT } from "@/lib/i18n";

interface CourseRoadmapProps {
  course: Course;
  allCourses: Course[];
}

function CourseBadge({ code, title, isCurrent }: { code: string; title: string; isCurrent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-center text-xs ${
      isCurrent
        ? "border-fern bg-fern/10 ring-1 ring-fern"
        : "border-slate-200 bg-white"
    }`}>
      <p className={`font-bold ${isCurrent ? "text-fern" : "text-ink"}`}>{code}</p>
      <p className="mt-0.5 text-slate-500 line-clamp-1">{title}</p>
    </div>
  );
}

export function CourseRoadmap({ course, allCourses }: CourseRoadmapProps) {
  const t = useT();
  const [showFullChain, setShowFullChain] = useState(false);

  const roadmap = computeRoadmap(course, allCourses);
  const chain = buildFullChain(course, allCourses);

  const hasNetwork = roadmap.prerequisites.length > 0 || roadmap.leadsTo.length > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-ink">{t.roadmap.heading}</h2>

      {/* Pathway + Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">{t.roadmap.pathway}</span>
        <span className="rounded-full bg-fern/10 px-3 py-1 text-xs font-semibold text-fern ring-1 ring-inset ring-fern/30">
          {roadmap.pathwayLabel}
        </span>
        {roadmap.isEntryPoint && (
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
            {t.roadmap.entryPoint}
          </span>
        )}
        {roadmap.isTerminal && (
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
            {t.roadmap.finalStageCourse}
          </span>
        )}
      </div>

      {/* DIRECT prerequisites & leads-to (always shown) */}
      {hasNetwork ? (
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {roadmap.prerequisites.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal">
                {t.roadmap.beforeThis} ({roadmap.prerequisites.length})
              </p>
              <ul className="mt-2 space-y-1.5">
                {roadmap.prerequisites.map((c) => (
                  <li key={c.code} className="flex items-center gap-2">
                    <span className="rounded bg-fern/10 px-2 py-0.5 text-xs font-bold text-fern">
                      {c.code}
                    </span>
                    <span className="text-xs text-slate-600 line-clamp-1">{c.title}</span>
                  </li>
                ))}
              </ul>
              {/* Show prerequisite relationship structure */}
              {course.prerequisites && course.prerequisites !== "Information unavailable" && (
                <p className="mt-2 text-xs text-slate-400 italic">
                  Rule: {course.prerequisites}
                </p>
              )}
            </div>
          )}
          {roadmap.leadsTo.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal">
                {t.roadmap.afterThis} ({roadmap.leadsTo.length})
              </p>
              <ul className="mt-2 space-y-1.5">
                {roadmap.leadsTo.map((c) => (
                  <li key={c.code} className="flex items-center gap-2">
                    <span className="rounded bg-fern/10 px-2 py-0.5 text-xs font-bold text-fern">
                      {c.code}
                    </span>
                    <span className="text-xs text-slate-600 line-clamp-1">{c.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Prerequisites mentioned but not in dataset */}
          {roadmap.allPrereqCodes.length > 0 && roadmap.prerequisites.length === 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-normal">
                {t.roadmap.prereqsNotInDataset}
              </p>
              <p className="mt-1 text-xs text-slate-400 italic">
                {roadmap.allPrereqCodes.join(", ")}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          {roadmap.isEntryPoint && roadmap.isTerminal
            ? t.roadmap.standaloneCourse
            : t.roadmap.noConnected}
        </div>
      )}

      {/* Optional: Expand Pathway (full chain) */}
      {chain.length > 1 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowFullChain(!showFullChain)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
          >
            {showFullChain ? "⊖" : "⊕"} {showFullChain ? t.roadmap.collapsePathway : t.roadmap.expandPathway}
          </button>

          {showFullChain && (
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-xs text-slate-500">
                Full prerequisite and follow-up chain. Courses shown together at the same depth may be alternatives (OR) rather than all required (AND). Refer to the prerequisite rule text above for exact requirements.
              </p>
              <div className="flex flex-col items-center gap-0 min-w-fit">
                {(() => {
                  const byDepth = new Map<number, ChainNode[]>();
                  chain.forEach((n) => {
                    const arr = byDepth.get(n.depth) || [];
                    arr.push(n);
                    byDepth.set(n.depth, arr);
                  });

                  const depths = [...byDepth.keys()].sort((a, b) => a - b);
                  const elements: React.ReactNode[] = [];

                  depths.forEach((depth, di) => {
                    const nodes = byDepth.get(depth)!;

                    elements.push(
                      <div key={`d-${depth}`} className="flex flex-wrap justify-center gap-3">
                        {nodes.map((n) => (
                          <CourseBadge
                            key={n.course.code}
                            code={n.course.code}
                            title={n.course.title}
                            isCurrent={n.depth === 0}
                          />
                        ))}
                      </div>
                    );

                    if (di < depths.length - 1) {
                      const nextNodes = byDepth.get(depths[di + 1])!;
                      const hasBranching = nodes.length > 1 || nextNodes.length > 1;
                      elements.push(
                        <div key={`arr-${depth}`} className="flex justify-center py-1">
                          <span className="text-lg text-slate-300">
                            {hasBranching ? "⤵" : "↓"}
                          </span>
                        </div>
                      );
                    }
                  });

                  return elements;
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
