import { Suspense } from "react";
import { MyPage } from "@/components/public/MyPage";

function MyPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-[93%] max-w-[1080px] mx-auto py-32 pb-20">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-slate-200 rounded mb-4" />
          <div className="h-5 w-96 bg-slate-100 rounded mb-12" />

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-1/4">
              <div className="h-24 bg-slate-100 rounded-xl mb-6" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </aside>
            <main className="lg:w-3/4 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
              ))}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPageRoute() {
  return (
    <Suspense fallback={<MyPageLoading />}>
      <MyPage />
    </Suspense>
  );
}
