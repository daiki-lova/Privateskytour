"use client";

import { CourseDetail } from "../CourseDetail";
import { PLANS } from "../booking/constants";
import { TOKYO_HELIPORT } from "../AccessSection";
import { useRouter } from "../../lib/next-mock";

interface TourDetailPageProps {
    planId: string;
}

export default function TourDetailPage({ planId }: TourDetailPageProps) {
  const router = useRouter();
  const plan = PLANS.find(p => p.id === planId);
  const tokyoHeliport = TOKYO_HELIPORT;

  const handleBack = () => {
    router.back();
  };

  const handleBook = (id: string) => {
    router.push(`/booking?planId=${id}`);
  };

  if (!plan) {
      return <div className="pt-32 text-center">Plan not found</div>;
  }

  return (
    <CourseDetail 
      plan={plan} 
      onBack={handleBack} 
      onBook={handleBook} 
      accessPoint={tokyoHeliport}
    />
  );
}
