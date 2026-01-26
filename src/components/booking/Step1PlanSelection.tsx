"use client";

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

export function Step1PlanSelection({ courses, data, updateData, onNext }: Step1Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(data.planId);
  const [date, setDate] = useState<Date | undefined>(data.date);
  const [time, setTime] = useState<string>(data.time || "");
  const [availableSlots, setAvailableSlots] = useState<{ id: string; slotTime: string; time?: string; availablePax?: number }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    async function fetchAvailableSlots() {
      if (!date) {
        setAvailableSlots([]);
        return;
      }
      setIsLoadingSlots(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await fetch(`/api/public/slots/available?date=${dateStr}`);
        const json = await res.json();
        if (json.success) {
          setAvailableSlots(json.data || []);
        } else {
          console.error("Failed to fetch slots:", json.error);
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("Failed to fetch slots", error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchAvailableSlots();
  }, [date]);

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
    if (date && time && selectedPlanId) {
      updateData({ 
        planId: selectedPlanId,
        date, 
        time,
        passengers: data.passengers && data.passengers <= 3 ? data.passengers : 2
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
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    return `${minutes}分`;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="relative h-40 overflow-hidden flex-shrink-0 bg-slate-50">
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
                    選択する
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
              希望日: {format(data.date, "yyyy年MM月dd日", { locale: ja })} / {data.passengers}名
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900">プランを選択してください</h2>
          <p className="text-slate-500">ご希望のフライトプランをお選びください</p>
        </div>

        <div>
          {sightseeingCourses.length > 0 && (
            <CourseGrid title="遊覧フライト" coursesData={sightseeingCourses} />
          )}
          {transferCourses.length > 0 && (
            <CourseGrid title="移動・送迎" coursesData={transferCourses} />
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
        <h2 className="text-2xl font-bold text-slate-900">日時の選択</h2>
        <p className="text-slate-500">ご希望のフライト日時を選択してください</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Selected Plan Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-bold text-slate-900">選択中のプラン</Label>
            {!data.planId && (
              <Button variant="ghost" size="sm" onClick={handleResetPlan} className="text-slate-500 h-8 hover:text-slate-900">
                変更する
              </Button>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <div className="relative h-56">
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
                <span>プランは選択済みです。日時をお選びください。</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Date & Time Selection */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-bold text-slate-900">日時を選択</Label>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Date Picker */}
                <div>
                  <Label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">フライト日</Label>
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

                {/* Time Slots */}
                <div>
                  <Label className="mb-3 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    出発時間
                    {isLoadingSlots && <span className="ml-2 text-[10px] text-vivid-blue lowercase">loading...</span>}
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.length === 0 && !isLoadingSlots && date ? (
                      <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                        この日に利用可能なスロットはありません
                      </div>
                    ) : (
                      availableSlots.map((slot) => {
                        const slotTime = slot.slotTime || slot.time || '';
                        const isSelected = time === slotTime;
                        const isFull = (slot.availablePax ?? 0) <= 0;
                        return (
                          <Button
                            key={slot.id}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!date || isLoadingSlots || isFull}
                            className={cn(
                              "w-full h-10 text-sm rounded-lg transition-all",
                              isSelected ? "bg-vivid-blue hover:bg-vivid-blue/90 text-white border-vivid-blue" : "border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900",
                              isFull ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : ""
                            )}
                            onClick={() => setTime(slotTime)}
                          >
                            <span className={isFull ? "line-through opacity-50" : ""}>{slotTime}</span>
                          </Button>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center">
                    {!date ? "※ まずはフライト日を選択してください" : "※ 1機のみの運航のため、各時間帯1組様限定です。"}
                  </p>
                </div>

                {/* Location Info */}
                <div className="bg-slate-50 p-4 rounded-xl flex items-start space-x-3 border border-slate-100">
                  <MapPin className="w-5 h-5 text-vivid-blue mt-0.5" />
                  <div>
                    <span className="block font-bold text-sm text-slate-900">
                      集合場所: {selectedCourse?.heliport?.name || "東京ヘリポート"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedCourse?.heliport?.address || "東京都江東区新木場4-7-25"}
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
              次へ進む
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
