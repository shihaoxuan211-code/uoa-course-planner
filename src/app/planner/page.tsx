import { courses } from "@/data/courses";
import { PlannerContent } from "@/components/PlannerContent";

export default function PlannerPage() {
  return <PlannerContent allCourses={courses} />;
}
