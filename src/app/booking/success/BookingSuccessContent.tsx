"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle, Calendar, Clock, Users, MapPin, Home, Mail, Phone, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReservationDetails {
  id: string;
  bookingNumber: string;
  courseName?: string;
  reservationDate?: string;
  reservationTime?: string;
  pax?: number;
  totalPrice?: number;
  customerName?: string;
  customerEmail?: string;
  heliportName?: string;
  heliportAddress?: string;
  testMode?: boolean;
}

export function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const reservationId = searchParams.get("reservation_id");
  const isTestMode = searchParams.get("test_mode") === "true";
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      // Handle test mode with reservation_id
      if (isTestMode && reservationId) {
        try {
          const res = await fetch(`/api/public/reservations/${reservationId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setReservation({
                id: data.data.id,
                bookingNumber: data.data.booking_number,
                courseName: data.data.course?.title,
                reservationDate: data.data.reservation_date,
                reservationTime: data.data.reservation_time,
                pax: data.data.pax,
                totalPrice: data.data.total_price,
                customerName: data.data.customer?.name,
                customerEmail: data.data.customer?.email,
                heliportName: data.data.course?.heliport?.name,
                heliportAddress: data.data.course?.heliport?.address,
                testMode: true,
              });
            }
          }
        } catch (err) {
          console.error("Error fetching reservation:", err);
          setError("予約情報の取得に失敗しました");
        }
        setIsLoading(false);
        return;
      }

      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, you would fetch the reservation details
        // based on the Stripe session ID from your API
        // For now, we'll show a generic success message
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("予約情報の取得に失敗しました");
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [sessionId, reservationId, isTestMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vivid-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center space-y-6 mb-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-14 h-14 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {(isTestMode || reservation?.testMode) && (
              <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-4">
                <TestTube2 className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-medium text-amber-800">
                  テストモード予約
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-slate-900">
              ご予約ありがとうございます
            </h1>
            <p className="text-slate-500 max-w-md mx-auto">
              {isTestMode || reservation?.testMode ? (
                <>
                  テストモードで予約が確定しました。
                  <br />
                  実際の決済は行われていません。
                </>
              ) : (
                <>
                  決済が完了し、ご予約が確定しました。
                  <br />
                  確認メールをお送りいたしましたので、ご確認ください。
                </>
              )}
            </p>
          </motion.div>
        </div>

        {/* Reservation Details Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-vivid-blue text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                予約完了
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Booking Number */}
              {reservation?.bookingNumber && (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-500 mb-1">予約番号</p>
                  <p className="text-2xl font-mono font-bold text-slate-900">
                    {reservation.bookingNumber}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">ご予約内容</h3>

                {reservation ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {reservation.courseName && (
                      <div className="col-span-2">
                        <p className="text-slate-500">プラン</p>
                        <p className="font-medium">{reservation.courseName}</p>
                      </div>
                    )}
                    {reservation.reservationDate && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> フライト日
                        </p>
                        <p className="font-medium">{reservation.reservationDate}</p>
                      </div>
                    )}
                    {reservation.reservationTime && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 時間
                        </p>
                        <p className="font-medium">{reservation.reservationTime}</p>
                      </div>
                    )}
                    {reservation.pax && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> 人数
                        </p>
                        <p className="font-medium">{reservation.pax}名</p>
                      </div>
                    )}
                    {reservation.totalPrice && (
                      <div>
                        <p className="text-slate-500">お支払い金額</p>
                        <p className="font-bold text-vivid-blue">
                          ¥{reservation.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 space-y-2">
                    <p>
                      ご予約の詳細は確認メールをご覧ください。
                    </p>
                    <p>
                      メールが届かない場合は、迷惑メールフォルダをご確認いただくか、
                      下記までお問い合わせください。
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Meeting Point Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-vivid-blue" />
                  集合場所
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium">
                    {reservation?.heliportName || "東京ヘリポート"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {reservation?.heliportAddress || "東京都江東区新木場4-7-25"}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    ※フライト開始時刻の15分前までにお越しください
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900">お問い合わせ</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a
                      href="mailto:info@privatesky.co.jp"
                      className="text-vivid-blue hover:underline"
                    >
                      info@privatesky.co.jp
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a
                      href="tel:03-1234-5678"
                      className="text-vivid-blue hover:underline"
                    >
                      03-1234-5678
                    </a>
                  </div>
                  <p className="text-slate-500 text-xs">
                    営業時間: 平日 10:00 - 18:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild className="bg-vivid-blue hover:bg-vivid-blue/90">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              トップページへ戻る
            </Link>
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500">
            当日は素晴らしいフライトをお楽しみください。
            <br />
            皆様のお越しを心よりお待ちしております。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
