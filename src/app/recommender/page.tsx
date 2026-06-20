import { RecommenderContent } from "@/components/RecommenderContent";
import { courses } from "@/data/courses";

export default function RecommenderPage() {
  return <RecommenderContent courses={courses} />;
}
