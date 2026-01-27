import { getPublicCourses } from "@/lib/supabase/queries";
import { PopularToursClient } from "./PopularToursClient";

export async function PopularTours() {
  const courses = await getPublicCourses();

  const sightseeingCourses = courses.filter((c) => c.category === "sightseeing");
  const transferCourses = courses.filter((c) => c.category === "transfer");

  return (
    <PopularToursClient
      sightseeingCourses={sightseeingCourses}
      transferCourses={transferCourses}
    />
  );
}
