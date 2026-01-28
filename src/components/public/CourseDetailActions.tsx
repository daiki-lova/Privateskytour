"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-slate-500 hover:text-slate-900 transition-colors group ${className ?? ""}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">{t('tourDetail.backToList')}</span>
    </button>
  );
}

interface BookButtonProps {
  courseId: string;
  className?: string;
}

export function BookButton({ courseId, className }: BookButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBook = () => {
    router.push(`/booking?planId=${courseId}`);
  };

  return (
    <Button
      onClick={handleBook}
      className={`w-full bg-white text-vivid-blue hover:bg-slate-100 py-8 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${className ?? ""}`}
    >
      {t('tourDetail.bookBtn')}
    </Button>
  );
}

interface NotFoundActionsProps {
  className?: string;
}

export function NotFoundActions({ className }: NotFoundActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => router.push("/")}
      className={`bg-vivid-blue text-white ${className ?? ""}`}
    >
      {t('tourDetail.backToTop')}
    </Button>
  );
}

interface ContactButtonProps {
  className?: string;
}

export function ContactButton({ className }: ContactButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 ${className ?? ""}`}>
      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        {t('tourDetail.companyTitle')}
      </h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        {t('tourDetail.companyDesc')}
      </p>
      <Button
        variant="link"
        className="p-0 h-auto text-slate-900 font-bold hover:text-vivid-blue"
        onClick={() => router.push("/contact")}
      >
        {t('tourDetail.contactBtn')}
      </Button>
    </div>
  );
}
