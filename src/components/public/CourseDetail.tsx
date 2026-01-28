import { getPublicCourseById } from "@/lib/supabase/actions/courses";
import { CourseDetailView } from "./CourseDetailView";

interface CourseDetailProps {
  planId: string;
}

export async function CourseDetail({ planId }: CourseDetailProps) {
  const course = await getPublicCourseById(planId);

  return <CourseDetailView course={course} />;
}
