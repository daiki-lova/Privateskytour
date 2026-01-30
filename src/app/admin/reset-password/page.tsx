"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo-header.png";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    // Handle the recovery token from URL hash
    const handleRecoveryToken = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Check if there's a hash fragment with access_token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        // Set the session with the recovery tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          void error;
          setError("セッションの設定に失敗しました。リンクが無効か期限切れの可能性があります。");
          setIsLoading(false);
          return;
        }

        setIsValidSession(true);
        setIsLoading(false);
        // Clear the hash from URL for security
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      // Check if user already has a valid session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsValidSession(true);
        setIsLoading(false);
        return;
      }

      // No valid session or recovery token
      setError("パスワードリセットリンクが無効か期限切れです。もう一度リセットをお試しください。");
      setIsLoading(false);
    };

    handleRecoveryToken();
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);

    if (data.password !== data.confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } else {
        setError(result.error ?? "エラーが発生しました。");
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm shadow-xl border-slate-200">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-600">セッションを確認中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
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
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-slate-800">
                  リンクが無効です
                </h2>
                <p className="text-sm text-slate-600">
                  {error || "パスワードリセットリンクが無効か期限切れです。"}
                </p>
              </div>
              <Link
                href="/admin/forgot-password"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                パスワードリセットを再試行
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  パスワードを更新しました
                </h2>
                <p className="text-sm text-slate-600">
                  パスワードが正常に更新されました。
                  ログイン画面に自動的に移動します...
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                今すぐログイン画面へ
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
              新しいパスワードを設定
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              6文字以上のパスワードを入力してください。
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "パスワードを入力してください",
                    minLength: {
                      value: 6,
                      message: "パスワードは6文字以上で入力してください",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword", {
                    required: "パスワードを再入力してください",
                    validate: (value) =>
                      value === password || "パスワードが一致しません",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
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
                  更新中...
                </>
              ) : (
                "パスワードを更新"
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
