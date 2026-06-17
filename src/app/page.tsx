import Link from "next/link";
import Image from "next/image";
import { courseDataSource, courses } from "@/data/courses";

const valueCards = [
  {
    title: "Course Search",
    body: "Find course records by code, title, subject, semester, and stage."
  },
  {
    title: "Exam Mode History",
    body: "Review past exam modes and see historical pattern labels."
  },
  {
    title: "Course Plan & Comparison",
    body: "Save courses locally and compare up to 4 options side by side."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-fern">Planning Tool for Students</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            University of Auckland Course Planner
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Search courses, compare assessment structures, check exam modes, and plan your study pathway using public UOA course information.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search courses
            </Link>
            <Link
              href="/compare"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Open comparison
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          <Image
            src="/planner-visual.png"
            alt="Course planning board illustration"
            width={1200}
            height={850}
            priority
            className="h-full min-h-72 w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-xl font-bold text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Course data loaded</p>
              <p className="mt-1 text-2xl font-bold text-ink">{courses.length} courses</p>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              This tool uses public University of Auckland course information where available.
              Please verify final enrolment decisions with official university sources.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
