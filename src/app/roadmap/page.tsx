import { RoadmapContent } from "@/components/RoadmapContent";
import { courses } from "@/data/courses";

export default function RoadmapPage() {
  return <RoadmapContent courses={courses} />;
}
