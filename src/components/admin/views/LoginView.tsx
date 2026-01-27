"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, AlertCircle } from "lucide-react";
import logo from "@/assets/logo-header.png";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginView() {
  const auth = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await auth.login(data.email, data.password);
      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.error ?? "ログインに失敗しました。");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
    }
  };

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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "パスワードを入力してください",
                  minLength: {
                    value: 6,
                    message: "パスワードは6文字以上で入力してください",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
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
                  認証中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </form>

          <p className="text-xs text-center text-slate-400 mt-4">
            Authorized Personnel Only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
