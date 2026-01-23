"use client";

import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CheckCircle, Calendar, Clock, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { PLANS } from "./constants";
import { saveBooking } from "@/lib/supabase";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface Step3Props {
  data: BookingData;
  onClose: () => void;
}

export function Step3Confirmation({ data, onClose }: Step3Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the selected plan
  const selectedPlan = PLANS.find(p => p.id === data.planId) || PLANS[0];
  const basePrice = selectedPlan.price;
  const totalPrice = basePrice; // No options anymore

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Send data to Supabase
      if (data.date && data.time) {
        await saveBooking({
          plan_id: selectedPlan.id,
          booking_date: format(data.date, "yyyy-MM-dd"),
          time_slot: data.time,
          passengers: data.passengers || 2,
          total_price: totalPrice
        });
        toast.success("予約が完了しました");
        setIsConfirmed(true);
      } else {
        toast.error("予約日時が正しく選択されていません");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("予約の保存中にエラーが発生しました。再度お試しください。");
    } finally {
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
        <h2 className="text-3xl font-bold text-slate-900">ご予約ありがとうございます</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          ご予約完了メールをお送りいたしました。<br />
          当日お会いできることを心よりお待ちしております。
        </p>
        <Button onClick={onClose} className="bg-vivid-blue text-white px-8 py-3 h-auto text-lg mt-8">
          トップページへ戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
       <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">予約内容の確認</h2>
        <p className="text-slate-500">以下の内容で予約を確定しますか？</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-48 w-full relative">
              <ImageWithFallback
                src={selectedPlan.image}
                alt={selectedPlan.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>フライト情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center"><Calendar className="w-3 h-3 mr-1" /> フライト日</div>
                  <div className="font-medium">
                    {data.date ? format(data.date, "yyyy年MM月dd日 (EEE)", { locale: ja }) : "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> 時間</div>
                  <div className="font-medium">{data.time || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center"><Users className="w-3 h-3 mr-1" /> 人数</div>
                  <div className="font-medium">{data.passengers}名</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> 所要時間</div>
                  <div className="font-medium">{selectedPlan.duration}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">プラン名</h4>
                <p className="font-bold text-lg">{selectedPlan.title}</p>
              </div>

               <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">集合場所</h4>
                <div className="flex items-start">
                   <MapPin className="w-4 h-4 mr-1 text-slate-400 mt-0.5" />
                   <div>
                     <p className="font-medium">東京ヘリポート</p>
                     <p className="text-xs text-slate-500">東京都江東区新木場4-7-25</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                 <div>
                  <div className="text-sm text-slate-500">備考</div>
                  <div className="font-medium text-sm whitespace-pre-wrap">{data.notes || "なし"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-8 bg-slate-50 border-vivid-blue/20">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg">お支払い金額</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">プラン料金</span>
                  <span>¥{basePrice.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-slate-900">合計(税込)</span>
                  <span className="text-2xl font-bold text-vivid-blue">¥{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold h-12 shadow-lg disabled:opacity-50"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "処理中..." : "予約を確定する"}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  予約完了後、確認メールが送信されます。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}