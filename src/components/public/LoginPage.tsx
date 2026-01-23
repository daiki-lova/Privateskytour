"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { User, Lock, ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // TODO: Implement actual login logic
      router.push("/mypage");
      setIsLoading(false);
    }, 1200);
  };

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
              <h1 className="text-2xl font-bold text-slate-900 mb-2">おかえりなさい</h1>
              <p className="text-slate-500 text-sm">
                SkyView マイページにログインして、<br/>
                予約の確認や変更を行えます。
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1">メールアドレス</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-slate-700 font-bold">パスワード</Label>
                  <button type="button" className="text-xs text-vivid-blue font-bold hover:underline">
                    パスワードを忘れた方
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-50 border-slate-100 focus:border-vivid-blue focus:ring-vivid-blue rounded-xl transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-vivid-blue hover:bg-vivid-blue/90 text-white font-bold rounded-xl text-lg group transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ログイン中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    ログインする
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm mb-4">アカウントをお持ちでない方</p>
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
                新規会員登録
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs">
          &copy; 2026 SkyView. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
