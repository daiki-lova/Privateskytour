"use client";

import { useTranslation } from "@/lib/i18n/TranslationContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, CheckCircle2, Map, ExternalLink } from "lucide-react";
import { FAQSection } from "@/components/public/FAQSection";
import {
    BackButton,
    BookButton,
    NotFoundActions,
    ContactButton,
} from "./CourseDetailActions";
import { getPublicCourseById, type PublicCourse } from "@/lib/supabase/actions/courses";
// Remove unused import if necessary, or just don't import Course from types since we use PublicCourse
// import type { Course } from "@/lib/data/types"; 

// Default access point for Tokyo Heliport
const DEFAULT_ACCESS_POINT = {
    name: "東京ヘリポート",
    address: "東京都江東区新木場4-7-28",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.5!2d139.8382!3d35.6358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601889f8f8f8f8f8%3A0x1234567890abcdef!2z5p2x5Lqs44OY44Oq44Od44O844OI!5e0!3m2!1sja!2sjp!4v1234567890"
};

interface CourseDetailViewProps {
    course: PublicCourse | null;
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
    const { t } = useTranslation();

    if (!course) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('tourDetail.notFoundTitle')}</h1>
                    <p className="text-slate-600 mb-8">{t('tourDetail.notFoundDesc')}</p>
                    <NotFoundActions />
                </div>
            </div>
        );
    }

    const accessPoint = DEFAULT_ACCESS_POINT;

    return (
        <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-36 lg:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb / Back Button */}
                <BackButton className="mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
                    {/* Left Content */}
                    <div className="md:col-span-2 lg:col-span-8 space-y-24">

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
                                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t('tourDetail.duration')}</span>
                                <span className="text-lg font-bold text-slate-900">{course.duration}</span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                                <Users className="w-6 h-6 text-slate-400" />
                                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t('tourDetail.capacity')}</span>
                                <span className="text-lg font-bold text-slate-900">{t('tourDetail.maxCapacity', { pax: course.capacity.toString() })}</span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100 hidden md:flex">
                                <MapPin className="w-6 h-6 text-slate-400" />
                                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t('tourDetail.departure')}</span>
                                <span className="text-lg font-bold text-slate-900">Tokyo Heliport</span>
                            </div>
                        </div>

                        {/* Route Map Section */}
                        {course.route_map_url && (
                            <section className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-900 mb-12 flex items-center">
                                    <span className="w-10 h-10 bg-vivid-blue text-white rounded-xl flex items-center justify-center mr-4">
                                        <Map className="h-5 w-5" />
                                    </span>
                                    {t('tourDetail.routeMap')}
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
                                    {t('tourDetail.highlights')}
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

                        {/* Detailed Description */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="w-1.5 h-8 bg-vivid-blue rounded-full mr-4" />
                                {t('tourDetail.detailTitle')}
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
                                {t('tourDetail.meetingPlace')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-start">
                                <div className="space-y-4">
                                    <p className="text-lg font-bold text-slate-900">{accessPoint.name}</p>
                                    <p className="text-slate-600 leading-relaxed">{accessPoint.address}</p>
                                    <Button variant="outline" className="rounded-full border-slate-200" asChild>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accessPoint.name + " " + accessPoint.address)}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            {t('tourDetail.viewMap')}
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
                    <div id="booking-section" className="md:col-span-1 lg:col-span-4 scroll-mt-28">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-vivid-blue text-white p-8 rounded-3xl shadow-2xl">
                                <div className="mb-8">
                                    <p className="text-white/70 text-sm font-bold tracking-widest uppercase mb-2">{t('tourDetail.pricePerHeli')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold">¥{course.price.toLocaleString()}</span>
                                    </div>
                                    {course.return_price && (
                                        <p className="text-white/70 text-sm mt-4 leading-relaxed">
                                            {t('tourDetail.roundTripOption', { price: course.return_price.toLocaleString() })}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8 text-sm text-white/80">
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span>{t('tourDetail.maxCapacity', { pax: "" }).trim()}</span>
                                        <span className="text-white font-bold">{course.capacity}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span>{t('tourDetail.duration')}</span>
                                        <span className="text-white font-bold">{course.duration}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span>{t('tourDetail.cancellation')}</span>
                                        <span className="text-white font-bold">{t('tourDetail.cancellationPolicy')}</span>
                                    </div>
                                </div>

                                {course.duration_minutes >= 30 && (
                                    <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/20">
                                        <p className="text-amber-300 text-xs font-bold tracking-wider mb-1 flex items-center">
                                            <span className="w-2 h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></span>
                                            {t('tourDetail.specialOffer')}
                                        </p>
                                        <p
                                            className="text-white text-sm font-medium leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: t('tourDetail.specialOfferDesc') }}
                                        />
                                    </div>
                                )}

                                <BookButton courseId={course.id} />

                                <p className="text-center text-xs text-white/50 mt-6">
                                    {t('tourDetail.weatherNote')}
                                </p>
                            </div>

                            <ContactButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* モバイル用固定予約バナー */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium mb-1">{t('tourDetail.pricePerHeli')}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                            ¥{course.price.toLocaleString()}
                        </p>
                    </div>
                    <a href="#booking-section">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold px-6 sm:px-10 py-4 sm:py-5 rounded-xl shadow-lg whitespace-nowrap">
                            {t('common.bookNow')}
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
