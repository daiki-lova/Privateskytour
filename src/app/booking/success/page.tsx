import { Suspense } from "react";
import { BookingSuccessContent } from "./BookingSuccessContent";

export const metadata = {
  title: "ご予約完了 | PRIVATESKY",
  description: "ヘリコプターツアーのご予約が完了しました。",
};

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vivid-blue"></div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
