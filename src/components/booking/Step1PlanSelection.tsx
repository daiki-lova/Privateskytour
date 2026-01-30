"use client";

import { useTranslation } from "@/lib/i18n/TranslationContext";
import { useState, useEffect, useMemo } from "react";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { ja } from "date-fns/locale";
import { Clock, MapPin, Check } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { motion } from "motion/react";
import type { Course } from "@/lib/data/types";

interface Step1Props {
  courses: Course[];
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

type SlotInfo = {
  id: string;
  slotTime: string;
  time?: string;
  maxPax: number;
  currentPax: number;
  availablePax: number;
  status: string;
};

type OperatingSettings = {
  activeHours: string[];
  holidayMode: boolean;
};

export function Step1PlanSelection({ courses, data, updateData, onNext }: Step1Props) {
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(data.planId);
  const [date, setDate] = useState<Date | undefined>(data.date);
  const [time, setTime] = useState<string>(data.time || "");
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(data.slotId);
  const [passengers, setPassengers] = useState<number>(data.passengers || 2);
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [operatingSettings, setOperatingSettings] = useState<OperatingSettings | null>(null);

  // Fetch operating settings once on mount
  useEffect(() => {
    async function fetchOperatingSettings() {
      try {
        const hoursRes = await fetch(`/api/public/settings/operating-hours`);
        const hoursJson = await hoursRes.json();

        if (hoursJson.success && hoursJson.data) {
          setOperatingSettings({
            activeHours: hoursJson.data.activeHours || [],
            holidayMode: hoursJson.data.holidayMode || false,
          });
        } else {
          // Default settings
          setOperatingSettings({
            activeHours: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
            holidayMode: false,
          });
        }
      } catch (error) {
        void error;
        setOperatingSettings({
          activeHours: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
          holidayMode: false,
        });
      }
    }
    fetchOperatingSettings();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!date) {
        setAvailableSlots([]);
        return;
      }
      setIsLoadingSlots(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const slotsRes = await fetch(`/api/public/slots/available?date=${dateStr}`);
        const slotsJson = await slotsRes.json();

        if (slotsJson.success) {
          // Deduplicate by time (multiple course_id can have same time)
          // Keep the slot with the most availability
          const slots = (slotsJson.data || []) as SlotInfo[];
          const uniqueByTime = slots.reduce((acc: SlotInfo[], slot: SlotInfo) => {
            const slotTime = slot.slotTime || slot.time || '';
            const existing = acc.find((s) => (s.slotTime || s.time) === slotTime);
            if (!existing) {
              acc.push(slot);
            } else if ((slot.availablePax || 0) > (existing.availablePax || 0)) {
              // Replace with slot that has more availability
              const index = acc.indexOf(existing);
              acc[index] = slot;
            }
            return acc;
          }, []);
          setAvailableSlots(uniqueByTime);
        } else {
          void slotsJson.error;
          setAvailableSlots([]);
        }
      } catch (error) {
        void error;
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [date]);

  // Helper function to check if a time is within active operating hours
  const isWithinOperatingHours = (slotTime: string): boolean => {
    if (!operatingSettings) return true;
    if (operatingSettings.holidayMode) return false; // All slots unavailable in holiday mode
    const time = slotTime.slice(0, 5); // "09:00:00" -> "09:00"
    return operatingSettings.activeHours.includes(time);
  };

  // Derived state - find course from courses prop
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedPlanId),
    [courses, selectedPlanId]
  );

  // Categorize courses by type (standard = sightseeing, charter/premium = transfer)
  const sightseeingCourses = useMemo(
    () => courses.filter((c) => c.courseType === "standard"),
    [courses]
  );
  const transferCourses = useMemo(
    () => courses.filter((c) => c.courseType === "charter" || c.courseType === "premium"),
    [courses]
  );

  const handleNext = () => {
    if (date && time && selectedPlanId && selectedSlotId) {
      updateData({
        planId: selectedPlanId,
        slotId: selectedSlotId,
        date,
        time,
        passengers,
      });
      onNext();
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleResetPlan = () => {
    setSelectedPlanId(undefined);
  };

  // Helper to format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  // ------------------------------------------------------------------
  // VIEW: PLAN SELECTION LIST (When no plan is selected)
  // ------------------------------------------------------------------
  if (!selectedPlanId) {
    const CourseGrid = ({ title, coursesData }: { title: string; coursesData: Course[] }) => (
      <div className="mb-10 last:mb-0">
        <div className="flex items-center gap-2 mb-4 px-1 border-l-4 border-vivid-blue pl-3">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {coursesData.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              layout
            >
              <Card
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-slate-100 ring-1 ring-slate-100 h-full flex flex-col"
                onClick={() => handleSelectPlan(course.id)}
              >
                <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden flex-shrink-0 bg-slate-50">
                  <ImageWithFallback
                    src={course.images?.[0] || "/images/placeholder.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-vivid-blue border border-slate-100">
                    ¥{course.price.toLocaleString()}
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-vivid-blue transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <div className="flex items-center text-[10px] text-slate-500 mb-2 space-x-2">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5" /> {formatDuration(course.durationMinutes)}
                    </div>
                    {course.heliport && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" /> {course.heliport.name}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto mb-3 space-y-1">
                    {(course.highlights || []).slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                        <Check className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-vivid-blue hover:bg-vivid-blue/90 text-white h-9 text-xs mt-auto rounded-lg">
                    {t('common.select')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          {data.date && (
            <div className="inline-block bg-slate-50 text-slate-600 px-4 py-1 rounded-full text-sm font-medium mb-2 border border-slate-100">
              {t('booking.step1.selectedDate')}: {format(data.date, "yyyy/MM/dd")} / {data.passengers}
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900">{t('booking.step1.planSelectTitle')}</h2>
          <p className="text-slate-500">{t('booking.step1.planSelectDesc')}</p>
        </div>

        <div>
          {sightseeingCourses.length > 0 && (
            <CourseGrid title={t('popularTours.sightseeingTitle')} coursesData={sightseeingCourses} />
          )}
          {transferCourses.length > 0 && (
            <CourseGrid title={t('popularTours.transferTitle')} coursesData={transferCourses} />
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW: DATE SELECTION (When plan is selected)
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">{t('booking.step1.title')}</h2>
        <p className="text-slate-500">{t('booking.step1.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Left Column: Selected Plan Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-bold text-slate-900">{t('booking.step1.currentPlan')}</Label>
            {!data.planId && (
              <Button variant="ghost" size="sm" onClick={handleResetPlan} className="text-slate-500 h-8 hover:text-slate-900">
                {t('booking.step1.changePlan')}
              </Button>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <div className="relative h-40 sm:h-48 md:h-56">
              <ImageWithFallback
                src={selectedCourse?.images?.[0] || "/images/placeholder.jpg"}
                alt={selectedCourse?.title || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                {selectedCourse?.heliport && (
                  <div className="flex items-center space-x-2 text-xs mb-1">
                    <span className="bg-vivid-blue px-2 py-0.5 rounded font-bold">
                      {selectedCourse.heliport.name}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold">{selectedCourse?.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center text-slate-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">{formatDuration(selectedCourse?.durationMinutes)}</span>
                </div>
                <div className="text-2xl font-bold text-vivid-blue">
                  ¥{selectedCourse?.price.toLocaleString()}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm">
                {selectedCourse?.description}
              </p>

              <div className="pt-2 flex items-center text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Check className="w-4 h-4 mr-2 text-vivid-blue" />
                <span>{t('booking.step1.desc')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Date & Time Selection */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-bold text-slate-900">{t('booking.step1.title')}</Label>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Date Picker */}
                <div>
                  <Label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('booking.step1.dateLabel')}</Label>
                  <div className="border border-slate-100 rounded-xl p-4 flex justify-center bg-white shadow-inner">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={ja}
                      className="rounded-md border-0"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </div>

                {/* Passenger Count */}
                <div>
                  <Label className="mb-3 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('booking.step1.paxLabel')}
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((num) => (
                      <Button
                        key={num}
                        variant={passengers === num ? "default" : "outline"}
                        className={cn(
                          "flex-1 h-12 text-base rounded-lg transition-all",
                          passengers === num
                            ? "bg-vivid-blue hover:bg-vivid-blue/90 text-white border-vivid-blue"
                            : "border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                        )}
                        onClick={() => {
                          setPassengers(num);
                          // Clear time selection if current slot doesn't have enough capacity
                          if (time && selectedSlotId) {
                            const currentSlot = availableSlots.find(s => s.id === selectedSlotId);
                            if (currentSlot && (currentSlot.availablePax || 0) < num) {
                              setTime("");
                              setSelectedSlotId(undefined);
                            }
                          }
                        }}
                      >
                        {num}{t('booking.step1.paxLabel')}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    {t('booking.step1.paxNote')}
                  </p>
                </div>

                {/* Time Slots */}
                <div>
                  <Label className="mb-3 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('booking.step1.timeLabel')}
                    {isLoadingSlots && <span className="ml-2 text-[10px] text-vivid-blue lowercase">{t('booking.step1.loading')}</span>}
                    {operatingSettings?.holidayMode && (
                      <span className="ml-2 text-[10px] text-red-500 normal-case font-medium">
                        （{t('booking.step1.holiday')}）
                      </span>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.length === 0 && !isLoadingSlots && date ? (
                      <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                        {t('booking.step1.noSlots')}
                      </div>
                    ) : (
                      availableSlots.map((slot) => {
                        const slotTime = slot.slotTime || slot.time || '';
                        const displayTime = slotTime.slice(0, 5); // "09:00:00" -> "09:00"
                        const isSelected = time === slotTime;
                        const availablePax = slot.availablePax ?? 0;
                        const isFull = availablePax <= 0;
                        const hasEnoughCapacity = availablePax >= passengers;
                        const withinOperatingHours = isWithinOperatingHours(slotTime);
                        const isOutsideHours = !withinOperatingHours;
                        const isUnavailable = isFull || !hasEnoughCapacity || isOutsideHours;

                        return (
                          <Button
                            key={slot.id}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!date || isLoadingSlots || isUnavailable}
                            className={cn(
                              "w-full h-12 text-sm rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
                              isSelected
                                ? "bg-vivid-blue hover:bg-vivid-blue/90 text-white border-vivid-blue"
                                : "border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900",
                              isOutsideHours && "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed hover:border-slate-100 hover:text-slate-300",
                              !isOutsideHours && isUnavailable && "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed hover:border-slate-200 hover:text-slate-400"
                            )}
                            onClick={() => {
                              if (!isUnavailable) {
                                setTime(slotTime);
                                setSelectedSlotId(slot.id);
                              }
                            }}
                          >
                            <span className={isFull || isOutsideHours ? "line-through" : ""}>{displayTime}</span>
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isSelected ? "text-white/80" : "text-slate-400",
                              isOutsideHours && "text-slate-300",
                              !isOutsideHours && isUnavailable && "text-slate-400"
                            )}>
                              {operatingSettings?.holidayMode
                                ? t('booking.step1.holiday')
                                : isOutsideHours
                                  ? "-"
                                  : isFull
                                    ? "Full"
                                    : `${availablePax} left`}
                            </span>
                          </Button>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center">
                    {!date
                      ? t('booking.step1.desc')
                      : operatingSettings?.holidayMode
                        ? t('booking.step1.holidayNote')
                        : t('booking.step1.timeNote')}
                  </p>
                </div>

                {/* Location Info */}
                <div className="bg-slate-50 p-4 rounded-xl flex items-start space-x-3 border border-slate-100">
                  <MapPin className="w-5 h-5 text-vivid-blue mt-0.5" />
                  <div>
                    <span className="block font-bold text-sm text-slate-900">
                      {t('booking.step1.location')}: {selectedCourse?.heliport?.name || "Tokyo Heliport"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNext}
              disabled={!date || !time}
              className="w-full h-14 text-lg bg-vivid-blue hover:bg-vivid-blue/90 text-white shadow-md rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('booking.step1.nextBtn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
