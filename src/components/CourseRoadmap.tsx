import type { Course } from "@/types/course";
import { computeRoadmap, buildFullChain } from "@/lib/courseRoadmap";
import type { ChainNode } from "@/lib/courseRoadmap";

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

function Arrow({ down = true }: { down?: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <span className="text-slate-300">{down ? "↓" : "→"}</span>
    </div>
  );
}

export function CourseRoadmap({ course, allCourses }: CourseRoadmapProps) {
  const roadmap = computeRoadmap(course, allCourses);
  const chain = buildFullChain(course, allCourses);

  const hasNetwork = roadmap.prerequisites.length > 0 || roadmap.leadsTo.length > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-ink">Course Roadmap</h2>

      {/* Pathway */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Pathway:</span>
        <span className="rounded-full bg-fern/10 px-3 py-1 text-xs font-semibold text-fern ring-1 ring-inset ring-fern/30">
          {roadmap.pathwayLabel}
        </span>
        {roadmap.isEntryPoint && (
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
            Entry Point — foundational course
          </span>
        )}
        {roadmap.isTerminal && (
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200" title="Final Stage Course — typically taken near the end of this subject pathway">
            Final Stage Course
          </span>
        )}
      </div>

      {/* Full chain visualization */}
      {chain.length > 1 ? (
        <div className="mt-5 overflow-x-auto">
          <div className="flex flex-col items-center gap-0 min-w-fit">
            {(() => {
              // Group by depth
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

                // Render nodes at this depth
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

                // Arrow to next depth
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
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          {roadmap.isEntryPoint && roadmap.isTerminal
            ? "This is a standalone course — no prerequisites or follow-up courses found in the current dataset."
            : "No connected courses found in the current dataset."}
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
        {roadmap.prerequisites.length > 0 && (
          <div>
            <p className="font-semibold text-slate-600">Before this course ({roadmap.prerequisites.length})</p>
            <p className="mt-1 text-slate-500">
              {roadmap.prerequisites.map((c) => c.code).join(", ")}
            </p>
          </div>
        )}
        {roadmap.leadsTo.length > 0 && (
          <div>
            <p className="font-semibold text-slate-600">After this course ({roadmap.leadsTo.length})</p>
            <p className="mt-1 text-slate-500">
              {roadmap.leadsTo.map((c) => c.code).join(", ")}
            </p>
          </div>
        )}
        {roadmap.allPrereqCodes.length > 0 && roadmap.prerequisites.length === 0 && (
          <div>
            <p className="font-semibold text-slate-600">Prerequisites (not in current dataset)</p>
            <p className="mt-1 text-slate-400 italic">
              {roadmap.allPrereqCodes.join(", ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
