"use client";

import { useTranslation } from "@/lib/i18n/TranslationContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Step1PlanSelection } from "./Step1PlanSelection";
import { Step2PassengerDetails } from "./Step2PassengerDetails";
import { Step3Confirmation } from "./Step3Confirmation";
import type { Course } from "@/lib/data/types";
import { useRouter } from "next/navigation";

export type BookingData = {
  planId?: string;
  slotId?: string;
  date?: Date;
  time?: string;
  passengers?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  guests?: { name: string; nameRomaji: string }[];
  requestTransfer?: boolean;
  pickupAddress?: string;
  dropoffAddress?: string;
  notes?: string;
  options?: string[];
};

interface BookingWizardProps {
  courses: Course[];
  initialPlanId?: string;
}

export function BookingWizard({ courses, initialPlanId }: BookingWizardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    planId: initialPlanId,
    passengers: 2,
    guests: [],
    requestTransfer: false,
  });

  const updateData = (newData: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev: number) => prev + 1);
  const prevStep = () => setStep((prev: number) => prev - 1);
  const handleGoHome = () => router.push("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-24 lg:pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header of Wizard */}
          <div className="flex items-center justify-between mb-12 gap-2">
            <Button
              variant="ghost"
              onClick={step === 1 ? handleGoHome : prevStep}
              className="hover:bg-slate-200 px-3 py-2 min-w-fit flex-shrink-0"
            >
              {step === 1 ? <Home className="mr-1 sm:mr-2 h-4 w-4" /> : <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />}
              <span className="hidden sm:inline">{step === 1 ? t('common.back') : t('common.back')}</span>
              <span className="sm:hidden">{step === 1 ? t('common.back') : t('common.back')}</span>
            </Button>

            <div className="flex items-center space-x-2 md:space-x-8">
              <StepIndicator currentStep={step} step={1} label={t('booking.step1.label')} />
              <div className="w-8 md:w-16 h-[1px] bg-slate-300" />
              <StepIndicator currentStep={step} step={2} label={t('booking.step2.label')} />
              <div className="w-8 md:w-16 h-[1px] bg-slate-300" />
              <StepIndicator currentStep={step} step={3} label={t('booking.step3.label')} />
            </div>

            <div className="w-12 sm:w-24 md:w-32 flex-shrink-0" /> {/* Spacer for centering */}
          </div>
// ... (content)

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step1PlanSelection
                  courses={courses}
                  data={bookingData}
                  updateData={updateData}
                  onNext={nextStep}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step2PassengerDetails
                  courses={courses}
                  data={bookingData}
                  updateData={updateData}
                  onNext={nextStep}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step3Confirmation
                  courses={courses}
                  data={bookingData}
                  onClose={handleGoHome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep, step, label }: { currentStep: number; step: number; label: string }) {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive || isCompleted
          ? "bg-vivid-blue border-vivid-blue text-white shadow-md"
          : "bg-white border-slate-200 text-slate-300"
          }`}
      >
        {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <span className="text-sm font-medium">{step}</span>}
      </div>
      <span className={`text-[10px] md:text-xs mt-2 font-medium transition-colors duration-300 ${isActive || isCompleted ? "text-vivid-blue" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}
