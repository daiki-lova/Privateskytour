"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, ArrowRight, Plane, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // マイページトークンをリクエスト（メールでログインリンクを送信）
      const response = await fetch("/api/auth/mypage-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // メール送信成功（実際に存在するかどうかに関わらず成功メッセージを表示）
        setIsSubmitted(true);
      } else {
        setError(data.error ?? t('login.unknownError'));
      }
    } catch {
      setError(t('login.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  // メール送信完了画面
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 md:p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('login.successTitle')}</h1>
                <p className="text-slate-500 text-sm mb-6">
                  {t('login.successDesc').replace('{email}', "")} {email}
                  <br />
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <p className="text-amber-800 text-sm">
                    <strong>{t('login.troubleTitle')}</strong>
                  </p>
                  <ul className="text-amber-700 text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>{t('login.troubleSpam')}</li>
                    <li>{t('login.troubleEmail')}</li>
                    <li>{t('login.troubleRetry')}</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="mt-6 w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  {t('login.retryButton')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-vivid-blue/10 rounded-2xl mb-6">
                <Plane className="w-8 h-8 text-vivid-blue" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('login.title')}</h1>
              <p className="text-slate-500 text-sm whitespace-pre-line">
                {t('login.description')}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1">{t('login.emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-50 border-slate-100 focus:border-vivid-blue focus:ring-vivid-blue rounded-xl transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-vivid-blue hover:bg-vivid-blue/90 text-white font-bold rounded-xl text-lg group transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('login.sending')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {t('login.sendLink')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-slate-600 text-sm font-medium mb-2">{t('login.nonUserTitle')}</p>
                <p className="text-slate-500 text-xs whitespace-pre-line">
                  {t('login.nonUserDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs">
          &copy; 2026 PrivateSky Tour. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
