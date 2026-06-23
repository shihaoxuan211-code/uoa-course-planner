import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourseById } from "@/data/courses";
import { getCourseReview } from "@/data/reviewData";
import type { CourseReview } from "@/types/course";
import { CourseDetailView } from "@/components/CourseDetailView";

export const dynamic = "force-dynamic";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate only top 20 popular courses at build time for SEO
export function generateStaticParams() {
  const popular = [
    "business-111", "compsci-101", "infosys-110", "econ-151", "acctg-102",
    "comlaw-101", "mktg-151", "psych-108", "stats-101", "biosci-101",
    "maths-102", "finance-251", "mgmt-211", "intbus-151", "busan-200",
    "softeng-206", "physics-102", "chem-110", "english-100", "maori-100"
  ];
  return popular.filter((id) => getCourseById(id)).map((id) => ({ id }));
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course ? `${course.code} | Course Planner` : "Course not found | Course Planner"
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) notFound();

  const reviewData = getCourseReview(course.code);

  return (
    <CourseDetailView
      course={course}
      allCourses={courses}
      reviewData={reviewData || undefined}
    />
  );
}
