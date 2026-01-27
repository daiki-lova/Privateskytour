"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  CheckCircle,
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  TestTube2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import type { Course } from "@/lib/data/types";

interface Step3Props {
  courses: Course[];
  data: BookingData;
  onClose: () => void;
}

// Cancellation policy data
const CANCELLATION_POLICIES = [
  { daysBefore: 7, refundPercentage: 100, label: "7日前まで" },
  { daysBefore: 4, refundPercentage: 70, label: "4日前まで" },
  { daysBefore: 2, refundPercentage: 50, label: "2日前まで" },
  { daysBefore: 0, refundPercentage: 0, label: "前日〜当日" },
];

export function Step3Confirmation({ courses, data, onClose }: Step3Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [healthConfirmed, setHealthConfirmed] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Check if test mode is enabled
  useEffect(() => {
    const checkPaymentMode = async () => {
      try {
        const res = await fetch("/api/public/payment-mode");
        const data = await res.json();
        setTestMode(data.testMode);
      } catch (error) {
        console.error("Failed to check payment mode:", error);
      }
    };
    checkPaymentMode();
  }, []);

  // Find the selected course
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === data.planId) || courses[0],
    [courses, data.planId]
  );
  const basePrice = selectedCourse?.price || 0;
  const pax = data.passengers || 1;
  const subtotal = basePrice * pax;
  const taxRate = 0.1;
  const tax = Math.floor(subtotal * taxRate);
  const totalPrice = subtotal + tax;

  // Format duration helper
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    return `${minutes}分`;
  };

  // Validation for payment button
  const canProceedToPayment = termsAccepted && privacyAccepted && healthConfirmed;

  // Handle Stripe payment
  const handlePayment = async () => {
    if (!canProceedToPayment) {
      toast.error("全ての同意事項にチェックを入れてください");
      return;
    }

    if (!data.date || !data.time || !selectedCourse) {
      toast.error("予約情報が不完全です");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create reservation in database
      const reservationRes = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          slotId: data.slotId,
          reservationDate: format(data.date, "yyyy-MM-dd"),
          reservationTime: data.time.slice(0, 5), // Convert "09:00:00" to "09:00"
          customer: {
            name: data.contactName,
            email: data.contactEmail,
            phone: data.contactPhone,
          },
          passengers: Array.from({ length: pax }, (_, i) => ({
            name: i === 0 ? data.contactName : `搭乗者${i + 1}`,
          })),
          customerNotes: data.notes || null,
          healthConfirmed: true,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      if (!reservationRes.ok) {
        const errorData = await reservationRes.json();
        throw new Error(errorData.error || "予約の作成に失敗しました");
      }

      const reservationData = await reservationRes.json();
      const reservation = reservationData.data;

      // TEST MODE: Skip Stripe and directly confirm reservation
      if (testMode) {
        const confirmRes = await fetch(
          `/api/public/reservations/${reservation.id}/confirm-test`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!confirmRes.ok) {
          const errorData = await confirmRes.json();
          throw new Error(errorData.error || "予約の確定に失敗しました");
        }

        // Redirect to success page with test mode indicator
        window.location.href = `/booking/success?test_mode=true&reservation_id=${reservation.id}`;
        return;
      }

      // 2. Create Stripe checkout session (normal mode)
      const stripeRes = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: totalPrice,
          courseName: selectedCourse.title,
          customerEmail: data.contactEmail,
        }),
      });

      if (!stripeRes.ok) {
        const errorData = await stripeRes.json();
        throw new Error(errorData.error || "決済セッションの作成に失敗しました");
      }

      const { data: stripeData } = await stripeRes.json();

      // 3. Redirect to Stripe Checkout
      if (stripeData?.url) {
        window.location.href = stripeData.url;
      } else {
        throw new Error("決済URLの取得に失敗しました");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "決済処理中にエラーが発生しました"
      );
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="text-center space-y-6 py-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900">
          ご予約ありがとうございます
        </h2>
        <p className="text-slate-500 max-w-md mx-auto">
          ご予約完了メールをお送りいたしました。
          <br />
          当日お会いできることを心よりお待ちしております。
        </p>
        <Button
          onClick={onClose}
          className="bg-vivid-blue text-white px-8 py-3 h-auto text-lg mt-8"
        >
          トップページへ戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">予約内容の確認</h2>
        <p className="text-slate-500">
          以下の内容をご確認の上、お支払いへお進みください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Flight Information Card */}
          <Card className="overflow-hidden">
            <div className="h-36 sm:h-40 md:h-48 w-full relative">
              <ImageWithFallback
                src={selectedCourse?.images?.[0] || "/images/placeholder.jpg"}
                alt={selectedCourse?.title || ""}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>フライト情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> フライト日
                  </div>
                  <div className="font-medium">
                    {data.date
                      ? format(data.date, "yyyy年MM月dd日 (EEE)", { locale: ja })
                      : "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 時間
                  </div>
                  <div className="font-medium">{data.time || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Users className="w-3 h-3 mr-1" /> 人数
                  </div>
                  <div className="font-medium">{pax}名</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 所要時間
                  </div>
                  <div className="font-medium">
                    {formatDuration(selectedCourse?.durationMinutes)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">プラン名</h4>
                <p className="font-bold text-lg">{selectedCourse?.title}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">集合場所</h4>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedCourse?.heliport?.name || "東京ヘリポート"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedCourse?.heliport?.address ||
                        "東京都江東区新木場4-7-25"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>お客様情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-slate-500">お名前</div>
                  <div className="font-medium">{data.contactName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">メールアドレス</div>
                  <div className="font-medium">{data.contactEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">電話番号</div>
                  <div className="font-medium">{data.contactPhone}</div>
                </div>
                {data.notes && (
                  <div>
                    <div className="text-sm text-slate-500">備考</div>
                    <div className="font-medium text-sm whitespace-pre-wrap">
                      {data.notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy Card */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                キャンセルポリシー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {CANCELLATION_POLICIES.map((policy, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0"
                  >
                    <span className="text-sm font-medium text-amber-900">
                      {policy.label}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        policy.refundPercentage === 100
                          ? "text-green-600"
                          : policy.refundPercentage >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {policy.refundPercentage === 100
                        ? "全額返金"
                        : policy.refundPercentage > 0
                          ? `${policy.refundPercentage}%返金`
                          : "返金不可"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-bold">天候による中止の場合：</span>
                  悪天候によりフライトが中止となった場合は、全額返金または振替対応をいたします。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-vivid-blue" />
                同意事項
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-vivid-blue underline"
                    >
                      利用規約
                    </a>
                    に同意します
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) =>
                      setPrivacyAccepted(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-vivid-blue underline"
                    >
                      プライバシーポリシー
                    </a>
                    に同意します
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <Checkbox
                    id="health"
                    checked={healthConfirmed}
                    onCheckedChange={(checked) =>
                      setHealthConfirmed(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    搭乗者全員が健康状態に問題がなく、搭乗に支障がないことを確認しました
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="md:col-span-1">
          <Card className="md:sticky md:top-8 bg-slate-50 border-vivid-blue/20">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg">お支払い金額</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">プラン料金</span>
                  <span>¥{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">人数</span>
                  <span>x {pax}名</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">小計</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">消費税 (10%)</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-slate-900">合計(税込)</span>
                  <span className="text-2xl font-bold text-vivid-blue">
                    ¥{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                {testMode && (
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <TestTube2 className="w-4 h-4" />
                      <span className="text-sm font-medium">テストモード</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      決済はスキップされ、予約が直接確定されます
                    </p>
                  </div>
                )}
                <Button
                  className={`w-full font-bold h-14 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    testMode
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-orange-400 hover:bg-orange-500 text-white"
                  }`}
                  onClick={handlePayment}
                  disabled={isSubmitting || !canProceedToPayment}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : testMode ? (
                    <>
                      <TestTube2 className="w-5 h-5 mr-2" />
                      テスト予約を確定
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      お支払いへ進む
                    </>
                  )}
                </Button>
                {!canProceedToPayment && (
                  <p className="text-xs text-center text-amber-600">
                    上記の同意事項全てにチェックを入れてください
                  </p>
                )}
                {!testMode && (
                  <>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <img
                        src="/images/stripe-badge.svg"
                        alt="Powered by Stripe"
                        className="h-6 opacity-60"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-slate-500">
                      安全な決済はStripeによって処理されます
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
