"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Car, Info, UserPlus } from "lucide-react";
import { PLANS } from "./constants";

// Zodスキーマ定義
const guestSchema = z.object({
  name: z.string().min(1, "ゲスト名を入力してください"),
});

const passengerSchema = z.object({
  contactName: z.string().min(1, "お名前を入力してください"),
  contactEmail: z.string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  contactPhone: z.string()
    .min(1, "電話番号を入力してください")
    .regex(/^\+?[0-9\-\s]+$/, "有効な電話番号を入力してください（例: +81-90-1234-5678）"),
  passengers: z.string(),
  guests: z.array(guestSchema),
  requestTransfer: z.boolean(),
  pickupAddress: z.string(),
  dropoffAddress: z.string(),
  notes: z.string(),
}).refine(
  (data) => {
    // 送迎希望時はピックアップ住所が必須
    if (data.requestTransfer && !data.pickupAddress) {
      return false;
    }
    return true;
  },
  {
    message: "送迎をご希望の場合は、お迎え先住所を入力してください",
    path: ["pickupAddress"],
  }
);

type PassengerFormData = z.infer<typeof passengerSchema>;

interface Step2Props {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export function Step2PassengerDetails({ data, updateData, onNext }: Step2Props) {
  const selectedPlan = PLANS.find(p => p.id === data.planId);
  const isEligibleForTransfer = selectedPlan ? parseInt(selectedPlan.duration) >= 30 : false;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      contactName: data.contactName || "",
      contactEmail: data.contactEmail || "",
      contactPhone: data.contactPhone || "",
      passengers: data.passengers?.toString() || "2",
      guests: data.guests || [],
      requestTransfer: data.requestTransfer || false,
      pickupAddress: data.pickupAddress || "",
      dropoffAddress: data.dropoffAddress || "",
      notes: data.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guests",
  });

  const watchPassengers = watch("passengers");
  const watchRequestTransfer = watch("requestTransfer");

  // 搭乗人数に応じてゲストフィールドを調整
  useEffect(() => {
    const passengerCount = parseInt(watchPassengers) || 2;
    // 代表者を除いた追加ゲスト数 (代表者 + ゲスト = 合計搭乗人数)
    const requiredGuests = passengerCount - 1;
    const currentGuests = fields.length;

    if (requiredGuests > currentGuests) {
      // ゲストを追加
      for (let i = currentGuests; i < requiredGuests; i++) {
        append({ name: "" });
      }
    } else if (requiredGuests < currentGuests) {
      // ゲストを削除
      for (let i = currentGuests - 1; i >= requiredGuests; i--) {
        remove(i);
      }
    }
  }, [watchPassengers, fields.length, append, remove]);

  const onSubmit = (formData: PassengerFormData) => {
    updateData({
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      passengers: parseInt(formData.passengers),
      guests: formData.guests,
      requestTransfer: formData.requestTransfer,
      pickupAddress: formData.pickupAddress,
      dropoffAddress: formData.dropoffAddress,
      options: [],
      notes: formData.notes,
    });
    onNext();
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">お客様情報の入力</h2>
        <p className="text-slate-500">ご予約に必要な情報を入力してください</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-bold flex items-center justify-between">
                お名前 (カタカナ)
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
              </Label>
              <Input
                id="contactName"
                placeholder="オオゾラ タロウ"
                {...register("contactName")}
                className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.contactName ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.contactName && (
                <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-bold flex items-center justify-between">
                  メールアドレス
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="skyview@example.com"
                  {...register("contactEmail")}
                  className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.contactEmail ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-bold flex items-center justify-between">
                  電話番号
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="+81-90-1234-5678"
                  {...register("contactPhone")}
                  className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.contactPhone ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>
                )}
                <p className="text-[10px] text-slate-400">
                  ※国際電話番号も入力可能です（例: +81-90-1234-5678）
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers" className="text-sm font-bold flex items-center justify-between">
                搭乗人数
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
              </Label>
              <Select
                value={watchPassengers}
                onValueChange={(val) => setValue("passengers", val)}
              >
                <SelectTrigger className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg">
                  <SelectValue placeholder="人数を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1名</SelectItem>
                  <SelectItem value="2">2名</SelectItem>
                  <SelectItem value="3">3名</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 mt-1">
                ※搭乗者様の合計体重制限は220kgまでとなります。
              </p>
            </div>
          </div>
        </div>

        {/* Guest Names Section */}
        {fields.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-slate-700 p-2 rounded-xl">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">同乗者様のお名前</h3>
                <p className="text-[10px] text-slate-500">搭乗される方全員のお名前をご入力ください</p>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={`guests.${index}.name`}
                    className="text-xs font-bold text-slate-500 flex items-center justify-between"
                  >
                    同乗者 {index + 1}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`guests.${index}.name`}
                      placeholder="オオゾラ ハナコ"
                      {...register(`guests.${index}.name`)}
                      className={`bg-white border-slate-200 focus:border-vivid-blue rounded-lg h-12 ${errors.guests?.[index]?.name ? "border-red-400 focus:border-red-400" : ""}`}
                    />
                  </div>
                  {errors.guests?.[index]?.name && (
                    <p className="text-xs text-red-500">{errors.guests[index]?.name?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Transfer Option (Conditional) */}
        {isEligibleForTransfer && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-vivid-blue p-2 rounded-xl">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">無料ハイヤー送迎のご案内</h3>
                <p className="text-[10px] text-vivid-blue font-bold tracking-wider uppercase">Alphard Transfer Service</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100">
              <Checkbox
                id="transfer"
                checked={watchRequestTransfer}
                onCheckedChange={(checked) => setValue("requestTransfer", checked === true)}
                className="w-5 h-5"
              />
              <label
                htmlFor="transfer"
                className="text-sm font-bold text-slate-700 cursor-pointer select-none"
              >
                無料送迎（アルファード）を利用する
              </label>
            </div>

            {watchRequestTransfer && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress" className="text-xs font-bold text-slate-500 flex items-center justify-between">
                    お迎え先住所
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                  </Label>
                  <Input
                    id="pickupAddress"
                    placeholder="例：東京都港区六本木 ◯-◯-◯"
                    {...register("pickupAddress")}
                    className={`bg-white border-slate-200 focus:border-vivid-blue rounded-lg ${errors.pickupAddress ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                  {errors.pickupAddress && (
                    <p className="text-xs text-red-500 mt-1">{errors.pickupAddress.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffAddress" className="text-xs font-bold text-slate-500">お送り先住所（省略可）</Label>
                  <Input
                    id="dropoffAddress"
                    placeholder="例：東京都港区六本木 ◯-◯-◯"
                    {...register("dropoffAddress")}
                    className="bg-white border-slate-200 focus:border-vivid-blue rounded-lg"
                  />
                  <div className="flex items-start gap-1.5 mt-2">
                    <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed">※対象エリア：東京23区内・横浜市内・舞浜エリア等</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-bold flex items-center justify-between">
              備考欄
              <Badge variant="outline" className="text-slate-400 text-[10px] py-0 px-1.5 border-slate-200 font-normal">任意</Badge>
            </Label>
            <Textarea
              id="notes"
              placeholder="特別なご要望や、記念日でのご利用などございましたらご自由にご記入ください"
              {...register("notes")}
              className="min-h-[120px] border-slate-200 focus:border-vivid-blue rounded-xl resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-lg bg-vivid-blue hover:bg-vivid-blue/90 text-white mt-8 rounded-xl font-bold shadow-lg shadow-vivid-blue/10 transition-all active:scale-[0.98]"
        >
          予約内容を確認する
        </Button>
      </form>
    </div>
  );
}
