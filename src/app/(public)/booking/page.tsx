import { getPublicCourses } from "@/lib/supabase/queries";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default async function BookingPage() {
  const courses = await getPublicCourses();
  return <BookingWizard courses={courses} />;
}
