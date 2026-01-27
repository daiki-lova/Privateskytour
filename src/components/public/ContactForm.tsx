"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/TranslationContext";

// Zod schema for contact form validation
const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  subject: z.string().min(1, "件名を入力してください"),
  message: z
    .string()
    .min(1, "本文を入力してください")
    .min(10, "本文は10文字以上で入力してください"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { language } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          lang: language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation or server errors
        const errorMessage =
          result.error ||
          (language === "ja"
            ? "送信に失敗しました。もう一度お試しください。"
            : "Failed to send. Please try again.");
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
      toast.success(
        language === "ja"
          ? "お問い合わせを送信しました"
          : "Your message has been sent"
      );
      reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : language === "ja"
            ? "送信に失敗しました。もう一度お試しください。"
            : "Failed to send. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  // Success state
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {language === "ja" ? "送信完了" : "Message Sent"}
        </h3>
        <p className="text-slate-600 mb-6">
          {language === "ja"
            ? "お問い合わせいただきありがとうございます。\n担当者より順次ご連絡いたします。"
            : "Thank you for your inquiry.\nWe will contact you shortly."}
        </p>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-200 hover:bg-slate-50"
        >
          {language === "ja" ? "新しいお問い合わせ" : "New Inquiry"}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-bold flex items-center justify-between"
          >
            {language === "ja" ? "お名前" : "Name"}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {language === "ja" ? "必須" : "Required"}
            </Badge>
          </Label>
          <Input
            id="name"
            placeholder={language === "ja" ? "山田 太郎" : "John Doe"}
            {...register("name")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${
              errors.name ? "border-red-400 focus:border-red-400" : ""
            }`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500"
              >
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-bold flex items-center justify-between"
          >
            {language === "ja" ? "メールアドレス" : "Email"}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {language === "ja" ? "必須" : "Required"}
            </Badge>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${
              errors.email ? "border-red-400 focus:border-red-400" : ""
            }`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <Label
            htmlFor="subject"
            className="text-sm font-bold flex items-center justify-between"
          >
            {language === "ja" ? "件名" : "Subject"}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {language === "ja" ? "必須" : "Required"}
            </Badge>
          </Label>
          <Input
            id="subject"
            placeholder={
              language === "ja"
                ? "お問い合わせ内容の件名"
                : "Subject of your inquiry"
            }
            {...register("subject")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${
              errors.subject ? "border-red-400 focus:border-red-400" : ""
            }`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.subject && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500"
              >
                {errors.subject.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Label
            htmlFor="message"
            className="text-sm font-bold flex items-center justify-between"
          >
            {language === "ja" ? "本文" : "Message"}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {language === "ja" ? "必須" : "Required"}
            </Badge>
          </Label>
          <Textarea
            id="message"
            placeholder={
              language === "ja"
                ? "お問い合わせ内容を入力してください"
                : "Please enter your message"
            }
            {...register("message")}
            className={`min-h-[160px] border-slate-200 focus:border-vivid-blue rounded-xl resize-none ${
              errors.message ? "border-red-400 focus:border-red-400" : ""
            }`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.message && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500"
              >
                {errors.message.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg bg-vivid-blue hover:bg-vivid-blue/90 text-white rounded-xl font-bold shadow-lg shadow-vivid-blue/10 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {language === "ja" ? "送信中..." : "Sending..."}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              {language === "ja" ? "送信する" : "Send Message"}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
