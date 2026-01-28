"use client";

import Link from "next/link";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import type { Course } from "@/lib/data/types";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

import { useTranslation } from "@/lib/i18n/TranslationContext";

interface PopularToursClientProps {
  sightseeingCourses: Course[];
  transferCourses: Course[];
}

function CourseGrid({
  title,
  subtitle,
  courses,
  className,
}: {
  title: string;
  subtitle: string;
  courses: Course[];
  className?: string;
}) {
  const { t, language } = useTranslation();

  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return "";
    return `${minutes} ${t('common.min')}`;
  };

  return (
    <div className={cn("mb-20", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 max-w-2xl mx-auto whitespace-pre-line">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 md:gap-5 lg:gap-6">
        {courses.map((course, index) => {
          const displayTitle = (language === 'en' && course.titleEn) ? course.titleEn : course.title;
          const displayDescription = (language === 'en' && course.descriptionEn) ? course.descriptionEn : course.description;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/tours/${course.id}`} className="block h-full">
                <div className="flex flex-col h-full bg-white transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-5 shrink-0">
                    <ImageWithFallback
                      src={course.images?.[0] || ""}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="flex flex-col flex-1 gap-0.5">
                    <div className="h-[2rem] flex items-start">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-vivid-blue transition-colors line-clamp-1">
                        {displayTitle}
                      </h3>
                    </div>

                    {/* Price and Duration */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.durationMinutes)}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-200" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-400">{t('common.taxIncl')}</span>
                        <span className="font-bold text-vivid-blue">
                          {course.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-vivid-blue font-bold">{t('common.currency')}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1">
                      {displayDescription}
                    </p>

                    {/* Decorative Button pushed to bottom (parent is a Link) */}
                    <div className="mt-auto pt-4">
                      <div className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-bold transition-colors bg-blue-600 text-white hover:bg-blue-700 h-14 px-4 py-6">
                        {t('common.viewDetails')}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function PopularToursClient({
  sightseeingCourses,
  transferCourses,
}: PopularToursClientProps) {
  const { t } = useTranslation();

  return (
    <section id="plans" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1440px] w-[93%] md:w-full mx-auto relative z-10 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            {t('popularTours.title')}
          </h2>
          <p className="text-slate-500 max-w-3xl mx-auto leading-loose text-lg whitespace-pre-line">
            {t('popularTours.subtitle')}
          </p>
        </motion.div>

        <CourseGrid
          title={t('popularTours.sightseeingTitle')}
          subtitle={t('popularTours.sightseeingSubtitle')}
          courses={sightseeingCourses}
        />

        <CourseGrid
          title={t('popularTours.transferTitle')}
          subtitle={t('popularTours.transferSubtitle')}
          courses={transferCourses}
          className="mb-0"
        />
      </div>
    </section>
  );
}
