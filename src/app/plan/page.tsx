import { MyPlanClient } from "@/components/MyPlanClient";
import { courses } from "@/data/courses";

export default function PlanPage() {
  return <MyPlanClient courses={courses} />;
}
