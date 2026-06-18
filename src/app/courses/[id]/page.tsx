import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourseById } from "@/data/courses";
import { getCourseReview } from "@/data/reviewData";
import type { CourseReview } from "@/types/course";
import { CourseDetailView } from "@/components/CourseDetailView";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return courses.map((course) => ({ id: course.id }));
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course ? `${course.code} | UOA Course Planner` : "Course not found | UOA Course Planner"
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
