"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
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
import Image from "next/image";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import type { Course } from "@/lib/data/types";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface Step3Props {
  courses: Course[];
  data: BookingData;
  onClose: () => void;
}

export function Step3Confirmation({ courses, data, onClose }: Step3Props) {
  const { t, language } = useTranslation();
  const [isConfirmed, _setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [healthConfirmed, setHealthConfirmed] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Cancellation policy data (Translated)
  const cancellationPolicies = [
    { daysBefore: 7, refundPercentage: 100, label: t('booking.step3.cancel7days') },
    { daysBefore: 4, refundPercentage: 70, label: t('booking.step3.cancel4days') },
    { daysBefore: 2, refundPercentage: 50, label: t('booking.step3.cancel2days') },
    { daysBefore: 0, refundPercentage: 0, label: t('booking.step3.cancelToday') },
  ];

  // Check if test mode is enabled
  useEffect(() => {
    const checkPaymentMode = async () => {
      try {
        const res = await fetch("/api/public/payment-mode");
        const data = await res.json();
        setTestMode(data.testMode);
      } catch (error) {
        void error;
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
      // Simple format
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  // Validation for payment button
  const canProceedToPayment = termsAccepted && privacyAccepted && healthConfirmed;

  // Handle Stripe payment
  const handlePayment = async () => {
    if (!canProceedToPayment) {
      toast.error(t('booking.step3.acceptTermsError'));
      return;
    }

    if (!data.date || !data.time || !selectedCourse) {
      toast.error(t('booking.step3.incompleteDataError'));
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
            name: i === 0 ? data.contactName : `${t('booking.step2.guestLabel')}${i + 1}`,
          })),
          customerNotes: data.notes || null,
          healthConfirmed: true,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      if (!reservationRes.ok) {
        const errorData = await reservationRes.json();
        throw new Error(errorData.error || t('booking.step3.reservationCreateError'));
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
          throw new Error(errorData.error || t('booking.step3.reservationConfirmError'));
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
        throw new Error(errorData.error || t('booking.step3.sessionCreateError'));
      }

      const { data: stripeData } = await stripeRes.json();

      // 3. Redirect to Stripe Checkout
      if (stripeData?.url) {
        window.location.href = stripeData.url;
      } else {
        throw new Error(t('booking.step3.urlError'));
      }
    } catch (error) {
      void error;
      toast.error(
        error instanceof Error ? error.message : t('booking.step3.paymentError')
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
          {t('booking.step3.confTitle')}
        </h2>
        <p className="text-slate-500 max-w-md mx-auto">
          {t('booking.step3.confDesc')}
        </p>
        <Button
          onClick={onClose}
          className="bg-vivid-blue text-white px-8 py-3 h-auto text-lg mt-8"
        >
          {t('booking.step3.backToHome')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">{t('booking.step3.title')}</h2>
        <p className="text-slate-500">
          {t('booking.step3.desc')}
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
              <CardTitle>{t('booking.step3.flightInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> {t('booking.step1.dateLabel')}
                  </div>
                  <div className="font-medium">
                    {data.date
                      ? format(data.date, language === 'en' ? "EEE, MMM dd, yyyy" : "yyyy年MM月dd日 (EEE)", { locale: language === 'en' ? enUS : ja })
                      : "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {t('booking.step1.timeLabel')}
                  </div>
                  <div className="font-medium">{data.time || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Users className="w-3 h-3 mr-1" /> {t('booking.step1.paxLabel')}
                  </div>
                  <div className="font-medium">{pax}{t('common.person')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {t('common.duration')}
                  </div>
                  <div className="font-medium">
                    {formatDuration(selectedCourse?.durationMinutes)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">{t('booking.step1.currentPlan')}</h4>
                <p className="font-bold text-lg">{selectedCourse?.title}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-500">{t('booking.step1.location')}</h4>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedCourse?.heliport?.name || "Tokyo Heliport"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedCourse?.heliport?.address ||
                        "Tokyo, Koto-ku, Shinkiba 4-7-25"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('booking.step2.customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-slate-500">{t('booking.step2.nameLabel')}</div>
                  <div className="font-medium">{data.contactName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">{t('booking.step2.emailLabel')}</div>
                  <div className="font-medium">{data.contactEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">{t('booking.step2.phoneLabel')}</div>
                  <div className="font-medium">{data.contactPhone}</div>
                </div>
                {data.notes && (
                  <div>
                    <div className="text-sm text-slate-500">{t('booking.step2.notesLabel')}</div>
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
                {t('booking.step3.cancelPolicyTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cancellationPolicies.map((policy, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0"
                  >
                    <span className="text-sm font-medium text-amber-900">
                      {policy.label}
                    </span>
                    <span
                      className={`text-sm font-bold ${policy.refundPercentage === 100
                        ? "text-green-600"
                        : policy.refundPercentage >= 50
                          ? "text-amber-600"
                          : "text-red-600"
                        }`}
                    >
                      {policy.refundPercentage === 100
                        ? t('booking.step3.fullRefund')
                        : policy.refundPercentage > 0
                          ? `${policy.refundPercentage}% ${t('booking.step3.refund')}`
                          : t('booking.step3.noRefund')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-bold">{t('booking.step3.weatherCancelTitle')}: </span>
                  {t('booking.step3.weatherCancelDesc')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-vivid-blue" />
                {t('booking.step3.termsTitle')}
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
                      {t('common.terms')}
                    </a>
                    {t('booking.step3.agreeTerms')}
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
                      {t('common.privacy')}
                    </a>
                    {t('booking.step3.agreePrivacy')}
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
                    {t('booking.step3.agreeHealth')}
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
              <h3 className="font-bold text-lg">{t('booking.step3.paymentAmount')}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('booking.step3.planPrice')}</span>
                  <span>¥{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('booking.step3.paxCount')}</span>
                  <span>x {pax}{t('common.person')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('booking.step3.subtotal')}</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('booking.step3.tax')}</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-slate-900">{t('booking.step3.total')}</span>
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
                      <span className="text-sm font-medium">Test Mode</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Payment skipped. Reservation confirmed immediately.
                    </p>
                  </div>
                )}
                <Button
                  className={`w-full font-bold h-14 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${testMode
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-orange-400 hover:bg-orange-500 text-white"
                    }`}
                  onClick={handlePayment}
                  disabled={isSubmitting || !canProceedToPayment}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : testMode ? (
                    <>
                      <TestTube2 className="w-5 h-5 mr-2" />
                      Confirm Test Booking
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('booking.step3.payBtn')}
                    </>
                  )}
                </Button>
                {!canProceedToPayment && (
                  <p className="text-xs text-center text-amber-600">
                    {t('booking.step3.checkAllTerms')}
                  </p>
                )}
                {!testMode && (
                  <>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Image
                        src="/images/stripe-badge.svg"
                        alt="Powered by Stripe"
                        width={120}
                        height={24}
                        className="h-6 w-auto opacity-60"
                      />
                    </div>
                    <p className="text-xs text-center text-slate-500">
                      {t('booking.step3.stripeSecure')}
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
