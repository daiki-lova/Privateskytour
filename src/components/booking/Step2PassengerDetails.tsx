"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/lib/i18n/TranslationContext";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Car, Info, UserPlus } from "lucide-react";
import type { Course } from "@/lib/data/types";

// ローマ字バリデーション（半角英字とスペースのみ）
const romajiRegex = /^[A-Za-z\s]+$/;

type PassengerFormData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  passengers: string;
  guests: { name: string; nameRomaji: string }[];
  requestTransfer: boolean;
  pickupAddress: string;
  dropoffAddress: string;
  notes: string;
};

interface Step2Props {
  courses: Course[];
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export function Step2PassengerDetails({ courses, data, updateData, onNext }: Step2Props) {
  const { t } = useTranslation();

  // Zod schema with translation
  const passengerSchema = useMemo(() => {
    const guestSchema = z.object({
      name: z.string().min(1, t('validation.guestNameRequired')),
      nameRomaji: z.string()
        .min(1, t('validation.guestNameRomajiRequired'))
        .regex(romajiRegex, t('validation.romajiOnly'))
        .transform((val) => val.toUpperCase()),
    });

    return z.object({
      contactName: z.string().min(1, t('validation.nameRequired')),
      contactEmail: z.string()
        .min(1, t('validation.emailRequired'))
        .email(t('validation.emailInvalid')),
      contactPhone: z.string()
        .min(1, t('validation.phoneRequired'))
        .regex(/^\+?[0-9\-\s]+$/, t('validation.phoneInvalid')),
      passengers: z.string(),
      guests: z.array(guestSchema),
      requestTransfer: z.boolean(),
      pickupAddress: z.string(),
      dropoffAddress: z.string(),
      notes: z.string(),
    }).refine(
      (data) => {
        if (data.requestTransfer && !data.pickupAddress) {
          return false;
        }
        return true;
      },
      {
        message: t('validation.pickupAddressRequired'),
        path: ["pickupAddress"],
      }
    );
  }, [t]);

  // Find the selected course from courses prop
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === data.planId),
    [courses, data.planId]
  );
  // 30分以上のフライトは無料送迎対象
  const isEligibleForTransfer = selectedCourse?.durationMinutes ? selectedCourse.durationMinutes >= 30 : false;

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
        append({ name: "", nameRomaji: "" });
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">{t('booking.step2.title')}</h2>
        <p className="text-slate-500">{t('booking.step2.desc')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Personal Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-bold flex items-center justify-between">
                {t('booking.step2.nameLabel')}
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
              </Label>
              <Input
                id="contactName"
                placeholder={t('booking.step2.namePlaceholder')}
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
                  {t('booking.step2.emailLabel')}
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
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
                  {t('booking.step2.phoneLabel')}
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
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
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {t('booking.step2.phoneNote')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers" className="text-sm font-bold flex items-center justify-between">
                {t('booking.step2.paxLabel')}
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
              </Label>
              <Select
                value={watchPassengers}
                onValueChange={(val) => setValue("passengers", val)}
              >
                <SelectTrigger className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg">
                  <SelectValue placeholder={t('booking.step2.paxPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t('common.person')}</SelectItem>
                  <SelectItem value="2">2 {t('common.person')}</SelectItem>
                  <SelectItem value="3">3 {t('common.person')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                {t('booking.step2.weightLimitNote')}
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
                <h3 className="font-bold text-slate-900">{t('booking.step2.guestTitle')}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">{t('booking.step2.guestDesc')}</p>
              </div>
            </div>

            <div className="space-y-5">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 bg-white rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-600 mb-2">{t('booking.step2.guestLabel')} {index + 1}</div>

                  {/* 名前（カタカナ） */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`guests.${index}.name`}
                      className="text-xs font-bold text-slate-500 flex items-center justify-between"
                    >
                      {t('booking.step2.guestNameLabel')}
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
                    </Label>
                    <Input
                      id={`guests.${index}.name`}
                      placeholder={t('booking.step2.guestNamePlaceholder')}
                      {...register(`guests.${index}.name`)}
                      className={`bg-white border-slate-200 focus:border-vivid-blue rounded-lg h-12 ${errors.guests?.[index]?.name ? "border-red-400 focus:border-red-400" : ""}`}
                    />
                    {errors.guests?.[index]?.name && (
                      <p className="text-xs text-red-500">{errors.guests?.[index]?.name?.message}</p>
                    )}
                  </div>

                  {/* 名前（ローマ字） */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`guests.${index}.nameRomaji`}
                      className="text-xs font-bold text-slate-500 flex items-center justify-between"
                    >
                      {t('booking.step2.guestRomajiLabel')}
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
                    </Label>
                    <Input
                      id={`guests.${index}.nameRomaji`}
                      placeholder="OZORA HANAKO"
                      {...register(`guests.${index}.nameRomaji`)}
                      onChange={(e) => {
                        // 大文字に変換
                        e.target.value = e.target.value.toUpperCase();
                        register(`guests.${index}.nameRomaji`).onChange(e);
                      }}
                      className={`bg-white border-slate-200 focus:border-vivid-blue rounded-lg h-12 font-mono uppercase ${errors.guests?.[index]?.nameRomaji ? "border-red-400 focus:border-red-400" : ""}`}
                    />
                    {errors.guests?.[index]?.nameRomaji && (
                      <p className="text-xs text-red-500">{errors.guests?.[index]?.nameRomaji?.message}</p>
                    )}
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {t('booking.step2.guestRomajiNote')}
                    </p>
                  </div>
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
                <h3 className="font-bold text-slate-900">{t('booking.step2.transferTitle')}</h3>
                <p className="text-[11px] sm:text-xs text-vivid-blue font-bold tracking-wider uppercase">Alphard Transfer Service</p>
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
                {t('booking.step2.transferCheckbox')}
              </label>
            </div>

            {watchRequestTransfer && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress" className="text-xs font-bold text-slate-500 flex items-center justify-between">
                    {t('booking.step2.pickupLabel')}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[11px] sm:text-xs py-0 px-1.5 border-0">{t('common.required')}</Badge>
                  </Label>
                  <Input
                    id="pickupAddress"
                    placeholder={t('booking.step2.addressPlaceholder')}
                    {...register("pickupAddress")}
                    className={`bg-white border-slate-200 focus:border-vivid-blue rounded-lg ${errors.pickupAddress ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                  {errors.pickupAddress && (
                    <p className="text-xs text-red-500 mt-1">{errors.pickupAddress.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffAddress" className="text-xs font-bold text-slate-500">{t('booking.step2.dropoffLabel')}</Label>
                  <Input
                    id="dropoffAddress"
                    placeholder={t('booking.step2.addressPlaceholder')}
                    {...register("dropoffAddress")}
                    className="bg-white border-slate-200 focus:border-vivid-blue rounded-lg"
                  />
                  <div className="flex items-start gap-1.5 mt-2">
                    <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{t('booking.step2.transferAreaNote')}</p>
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
              {t('booking.step2.notesLabel')}
              <Badge variant="outline" className="text-slate-400 text-[11px] sm:text-xs py-0 px-1.5 border-slate-200 font-normal">{t('common.optional')}</Badge>
            </Label>
            <Textarea
              id="notes"
              placeholder={t('booking.step2.notesPlaceholder')}
              {...register("notes")}
              className="min-h-[120px] border-slate-200 focus:border-vivid-blue rounded-xl resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-lg bg-vivid-blue hover:bg-vivid-blue/90 text-white mt-8 rounded-xl font-bold shadow-lg shadow-vivid-blue/10 transition-all active:scale-[0.98]"
        >
          {t('booking.step2.nextBtn')}
        </Button>
      </form>
    </div>
  );
}
