import { getPublicCourses } from "@/lib/supabase/queries";
import { BookingWizard } from "@/components/booking/BookingWizard";

interface BookingPageProps {
  searchParams: Promise<{ planId?: string }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const courses = await getPublicCourses();
  return <BookingWizard courses={courses} initialPlanId={params.planId} />;
}
