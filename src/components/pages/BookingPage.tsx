"use client";

import { BookingWizard } from "../booking/BookingWizard";
import { useRouter, useSearchParams } from "../../lib/next-mock";

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialData = {
    planId: searchParams.get('planId') || undefined,
    date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
    passengers: searchParams.get('passengers') ? parseInt(searchParams.get('passengers')!) : undefined
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <BookingWizard 
      onClose={handleClose} 
      initialData={initialData}
    />
  );
}
