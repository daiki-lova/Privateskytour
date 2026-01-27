import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, CheckCircle2, Map, ExternalLink } from "lucide-react";
import { FAQSection } from "@/components/public/FAQSection";
import { getPublicCourseById } from "@/lib/supabase/actions/courses";
import {
  BackButton,
  BookButton,
  NotFoundActions,
  ContactButton,
} from "./CourseDetailActions";

// Default access point for Tokyo Heliport
const DEFAULT_ACCESS_POINT = {
  name: "東京ヘリポート",
  address: "東京都江東区新木場4-7-28",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.5!2d139.8382!3d35.6358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601889f8f8f8f8f8%3A0x1234567890abcdef!2z5p2x5Lqs44OY44Oq44Od44O844OI!5e0!3m2!1sja!2sjp!4v1234567890"
};

interface CourseDetailProps {
  planId: string;
}

export async function CourseDetail({ planId }: CourseDetailProps) {
  const course = await getPublicCourseById(planId);

  if (!course) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">プランが見つかりません</h1>
          <p className="text-slate-600 mb-8">お探しのプランは存在しないか、削除された可能性があります。</p>
          <NotFoundActions />
        </div>
      </div>
    );
  }

  const accessPoint = DEFAULT_ACCESS_POINT;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Button */}
        <BackButton className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="md:col-span-2 lg:col-span-8 space-y-12">

            {/* Main Image (16:9 ratio) */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-100">
              <ImageWithFallback
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Description */}
            <section className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {course.description}
              </p>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                <Clock className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">所要時間</span>
                <span className="text-lg font-bold text-slate-900">{course.duration}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                <Users className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">定員</span>
                <span className="text-lg font-bold text-slate-900">最大 {course.capacity} 名</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100 hidden md:flex">
                <MapPin className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">出発地</span>
                <span className="text-lg font-bold text-slate-900">東京ヘリポート</span>
              </div>
            </div>

            {/* Route Map Section */}
            {course.route_map_url && (
              <section className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <span className="w-10 h-10 bg-vivid-blue text-white rounded-xl flex items-center justify-center mr-4">
                    <Map className="h-5 w-5" />
                  </span>
                  ルート案内
                </h2>
                <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 mb-8">
                  <ImageWithFallback
                    src={course.route_map_url}
                    alt={`${course.title} Route Map`}
                    className="w-full h-auto object-contain bg-white"
                  />
                </div>

                <div className="relative pl-8 border-l-2 border-slate-100 ml-4 space-y-8">
                  {course.itinerary.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white border-4 border-vivid-blue" />
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-400">{item.time}</span>
                        <p className="text-slate-900 font-bold text-lg">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights */}
            {course.highlights && course.highlights.length > 0 && (
              <section className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                   <span className="w-1.5 h-8 bg-vivid-blue rounded-full mr-4" />
                   プランの魅力
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {course.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <CheckCircle2 className="h-6 w-6 text-vivid-blue flex-shrink-0" />
                      <p className="text-slate-700 font-medium leading-relaxed">{highlight}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Detailed Description - using description since longDescription doesn't exist in DB */}
            <section className="space-y-6">
               <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                 <span className="w-1.5 h-8 bg-vivid-blue rounded-full mr-4" />
                 コース詳細
              </h2>
              <p className="text-slate-600 leading-loose text-lg whitespace-pre-wrap">
                {course.description}
              </p>
            </section>

            {/* Access */}
            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <span className="w-10 h-10 bg-vivid-blue text-white rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="h-5 w-5" />
                </span>
                集合場所
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-lg font-bold text-slate-900">{accessPoint.name}</p>
                  <p className="text-slate-600 leading-relaxed">{accessPoint.address}</p>
                  <Button variant="outline" className="rounded-full border-slate-200" asChild>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accessPoint.name + " " + accessPoint.address)}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Mapsで開く
                    </a>
                  </Button>
                </div>
                <div className="rounded-2xl overflow-hidden h-56 sm:h-64 md:h-72 lg:h-80 border border-slate-200">
                  <iframe
                    src={accessPoint.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title={`${accessPoint.name} Map`}
                  ></iframe>
                </div>
              </div>
            </section>

            <FAQSection />
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="md:col-span-1 lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-vivid-blue text-white p-8 rounded-3xl shadow-2xl">
                <div className="mb-8">
                  <p className="text-white/70 text-sm font-bold tracking-widest uppercase mb-2">一機あたり（税込）</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">¥{course.price.toLocaleString()}</span>
                  </div>
                  {course.return_price && (
                    <p className="text-white/70 text-sm mt-4 leading-relaxed">
                      ※日帰り往復の場合は +¥{course.return_price.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8 text-sm text-white/80">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>最大定員</span>
                    <span className="text-white font-bold">{course.capacity}名</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>所要時間</span>
                    <span className="text-white font-bold">{course.duration}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>キャンセル料</span>
                    <span className="text-white font-bold">前日 50% / 当日 100%</span>
                  </div>
                </div>

                {course.duration_minutes >= 30 && (
                  <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/20">
                    <p className="text-amber-300 text-xs font-bold tracking-wider mb-1 flex items-center">
                      <span className="w-2 h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></span>
                      SPECIAL OFFER
                    </p>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      30分以上のフライトをご予約の方は、<br/>
                      <span className="text-amber-300 font-bold">アルファードでの無料送迎</span>をご利用いただけます。
                    </p>
                  </div>
                )}

                <BookButton courseId={course.id} />

                <p className="text-center text-xs text-white/50 mt-6">
                  ※天候によりフライトが中止となる場合がございます
                </p>
              </div>

              <ContactButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
