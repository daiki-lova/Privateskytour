import { CourseDetail } from "@/components/public/CourseDetail";

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <CourseDetail planId={planId} />;
}
