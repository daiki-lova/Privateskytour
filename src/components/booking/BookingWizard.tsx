"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Step1PlanSelection } from "./Step1PlanSelection";
import { Step2PassengerDetails } from "./Step2PassengerDetails";
import { Step3Confirmation } from "./Step3Confirmation";
import { Header } from "../public/Header";
import { Footer } from "../public/Footer";

export type BookingData = {
  planId?: string;
  date?: Date;
  time?: string;
  passengers?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  requestTransfer?: boolean;
  pickupAddress?: string;
  dropoffAddress?: string;
  options?: string[];
  notes?: string;
};

export function BookingWizard({ onClose, initialData }: { onClose: () => void; initialData?: BookingData }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialData || {});

  const nextStep = () => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header of Wizard */}
          <div className="flex items-center justify-between mb-12">
            <Button variant="ghost" onClick={step === 1 ? onClose : prevStep} className="hover:bg-slate-200">
              {step === 1 ? <Home className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
              {step === 1 ? "トップへ戻る" : "前へ"}
            </Button>
            
            <div className="flex items-center space-x-2 md:space-x-8">
              <StepIndicator currentStep={step} step={1} label="日時選択" />
              <div className="w-8 md:w-16 h-[1px] bg-slate-300" />
              <StepIndicator currentStep={step} step={2} label="お客様情報" />
              <div className="w-8 md:w-16 h-[1px] bg-slate-300" />
              <StepIndicator currentStep={step} step={3} label="完了" />
            </div>
            
            <div className="w-24 md:w-32" /> {/* Spacer for centering */}
          </div>

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
                  data={bookingData} 
                  onClose={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepIndicator({ currentStep, step, label }: { currentStep: number; step: number; label: string }) {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
          isActive || isCompleted
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
