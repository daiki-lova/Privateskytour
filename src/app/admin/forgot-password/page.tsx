"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-header.png";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error ?? "エラーが発生しました。");
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm shadow-xl border-slate-200">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="flex flex-col items-center justify-center mb-2">
              <img
                src={logo.src}
                alt="PrivateSky Tour"
                className="h-10 object-contain mb-2"
              />
              <p className="text-sm text-slate-400 font-medium">管理画面</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-slate-800">
                  メールを送信しました
                </h2>
                <p className="text-sm text-slate-600">
                  パスワードリセット用のリンクをメールで送信しました。
                  メールをご確認ください。
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                ログイン画面に戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex flex-col items-center justify-center mb-2">
            <img
              src={logo.src}
              alt="PrivateSky Tour"
              className="h-10 object-contain mb-2"
            />
            <p className="text-sm text-slate-400 font-medium">管理画面</p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              パスワードをお忘れですか？
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              登録済みのメールアドレスを入力してください。
              パスワードリセット用のリンクをお送りします。
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "メールアドレスを入力してください",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "有効なメールアドレスを入力してください",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                "リセットリンクを送信"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              ログイン画面に戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
