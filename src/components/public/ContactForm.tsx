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


type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactForm() {
  const { t, language } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Zod schema for contact form validation
  // Note: We need to recreate the schema inside the component or use a function to make it reactive to language
  // But for simplicity, we'll keep the schema static or use a validation resolver that translates errors.
  // Actually, standard practice is to let Zod handle structure and pass translated strings to resolver,
  // or just Map error types. Here we will define schema with T keys but Zod doesn't support that easily without some work.
  // Instead, we'll use a trick: standard schema, but we will rely on manual error mapping OR simple schema.
  // For this tasks, let's keep it simple: we want translated errors.
  // Since `t` is available, we can define the schema inside validation logic or use `t` directly if we move schema inside component (uncommon but works for small comps)
  // OR we just use the schema for validation and override the message display.
  // Let's move schema definition inside for easiest translation access.
  const contactSchema = z.object({
    name: z.string().min(1, t('contact.validation.name')),
    email: z
      .string()
      .min(1, t('contact.validation.email'))
      .email(t('contact.validation.emailInvalid')),
    subject: z.string().min(1, t('contact.validation.subject')),
    message: z
      .string()
      .min(1, t('contact.validation.message'))
      .min(10, t('contact.validation.messageLength')),
  });

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
          result.error || t('contact.failed');
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
      toast.success(t('contact.successTitle'));
      reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('contact.failed');
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
          {t('contact.successTitle')}
        </h3>
        <p className="text-slate-600 mb-6 whitespace-pre-line">
          {t('contact.successDesc')}
        </p>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-200 hover:bg-slate-50"
        >
          {t('contact.newInquiry')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-bold flex items-center justify-between"
          >
            {t('contact.form.name')}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {t('contact.form.required')}
            </Badge>
          </Label>
          <Input
            id="name"
            placeholder={t('contact.form.namePlaceholder')}
            {...register("name")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.name ? "border-red-400 focus:border-red-400" : ""
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
            {t('contact.form.email')}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {t('contact.form.required')}
            </Badge>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('contact.form.emailPlaceholder')}
            {...register("email")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.email ? "border-red-400 focus:border-red-400" : ""
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
            {t('contact.form.subject')}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {t('contact.form.required')}
            </Badge>
          </Label>
          <Input
            id="subject"
            placeholder={t('contact.form.subjectPlaceholder')}
            {...register("subject")}
            className={`h-12 border-slate-200 focus:border-vivid-blue rounded-lg ${errors.subject ? "border-red-400 focus:border-red-400" : ""
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
            {t('contact.form.message')}
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0"
            >
              {t('contact.form.required')}
            </Badge>
          </Label>
          <Textarea
            id="message"
            placeholder={t('contact.form.messagePlaceholder')}
            {...register("message")}
            className={`min-h-[160px] border-slate-200 focus:border-vivid-blue rounded-xl resize-none ${errors.message ? "border-red-400 focus:border-red-400" : ""
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
              {t('contact.sending')}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              {t('contact.send')}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
