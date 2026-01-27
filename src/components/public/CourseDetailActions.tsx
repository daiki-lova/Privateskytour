"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-slate-500 hover:text-slate-900 transition-colors group ${className ?? ""}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">プラン一覧に戻る</span>
    </button>
  );
}

interface BookButtonProps {
  courseId: string;
  className?: string;
}

export function BookButton({ courseId, className }: BookButtonProps) {
  const router = useRouter();

  const handleBook = () => {
    router.push(`/booking?planId=${courseId}`);
  };

  return (
    <Button
      onClick={handleBook}
      className={`w-full bg-white text-vivid-blue hover:bg-slate-100 py-8 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${className ?? ""}`}
    >
      このプランを予約する
    </Button>
  );
}

interface NotFoundActionsProps {
  className?: string;
}

export function NotFoundActions({ className }: NotFoundActionsProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/")}
      className={`bg-vivid-blue text-white ${className ?? ""}`}
    >
      トップページへ戻る
    </Button>
  );
}

interface ContactButtonProps {
  className?: string;
}

export function ContactButton({ className }: ContactButtonProps) {
  const router = useRouter();

  return (
    <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 ${className ?? ""}`}>
      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        団体・法人のお客様へ
      </h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        定員を超える人数や、特別なチャーター、撮影のご相談も承っております。お気軽にお問い合わせください。
      </p>
      <Button
        variant="link"
        className="p-0 h-auto text-slate-900 font-bold hover:text-vivid-blue"
        onClick={() => router.push("/contact")}
      >
        お問い合わせはこちら
      </Button>
    </div>
  );
}
