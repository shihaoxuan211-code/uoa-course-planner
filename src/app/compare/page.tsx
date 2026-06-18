import { ComparePageClient } from "@/components/ComparePageClient";
import { courses } from "@/data/courses";

export default function ComparePage() {
  return <ComparePageClient courses={courses} />;
}
