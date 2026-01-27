"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Calendar, User, Settings, LogOut, FileText, History, Download, Bell, AlertTriangle, Info } from "lucide-react";
import type { MypageData } from "@/lib/auth/mypage-token";

interface MyPageProps {
  onLogout: () => void;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-[93%] max-w-[1080px] mx-auto py-32 pb-20">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-slate-200 rounded mb-4" />
          <div className="h-5 w-96 bg-slate-100 rounded mb-12" />

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-1/4">
              <div className="h-24 bg-slate-100 rounded-xl mb-6" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </aside>
            <main className="lg:w-3/4 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
              ))}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          アクセスできません
        </h1>
        <p className="text-slate-500 mb-8">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-vivid-blue hover:bg-vivid-blue/90">
            再試行
          </Button>
        )}
      </div>
    </div>
  );
}

// Token required state
function TokenRequiredState() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          マイページへのアクセス
        </h1>
        <p className="text-slate-500 mb-6">
          マイページにアクセスするには、予約完了時にお送りしたメールに記載されているリンクをご利用ください。
        </p>
        <div className="bg-slate-50 rounded-xl p-6 text-left">
          <p className="text-sm text-slate-600 mb-3">
            <strong>メールが見つからない場合:</strong>
          </p>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>* 迷惑メールフォルダをご確認ください</li>
            <li>* 予約時のメールアドレスをご確認ください</li>
            <li>* お問い合わせフォームからご連絡ください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日(${weekday})`;
}

function formatTime(timeString: string): string {
  return timeString.slice(0, 5);
}

function formatPrice(price: number): string {
  return price.toLocaleString("ja-JP");
}

export function MyPage({ onLogout }: MyPageProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [activeTab, setActiveTab] = useState("reservations");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mypageData, setMypageData] = useState<MypageData | null>(null);

  // Fetch mypage data from API
  const fetchMypageData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/auth/mypage-token?token=${encodeURIComponent(token)}&includeData=true`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "マイページデータの取得に失敗しました");
        return;
      }

      setMypageData(data.data);
    } catch (err) {
      console.error("Mypage fetch error:", err);
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMypageData();
  }, [fetchMypageData]);

  // Render states
  if (!token) {
    return <TokenRequiredState />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMypageData} />;
  }

  if (!mypageData) {
    return <ErrorState message="データが見つかりませんでした" />;
  }

  const { customer, reservations } = mypageData;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = reservations.filter((r) => {
    const resDate = new Date(r.reservationDate);
    resDate.setHours(0, 0, 0, 0);
    return resDate >= today && r.status !== "cancelled" && r.status !== "completed";
  });

  const pastReservations = reservations.filter((r) => {
    const resDate = new Date(r.reservationDate);
    resDate.setHours(0, 0, 0, 0);
    return resDate < today || r.status === "cancelled" || r.status === "completed";
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="w-[93%] max-w-[1080px] mx-auto py-32 pb-20">
        <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Page</h1>
            <p className="text-slate-500 mt-2">ご予約内容の確認および会員情報の変更が可能です。</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-32 space-y-6">
                <div className="pb-6 border-b border-slate-100">
                    <h2 className="font-bold text-xl text-slate-900">{customer.name} 様</h2>
                    <p className="text-sm text-slate-400 mt-1">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-slate-400">{customer.phone}</p>
                    )}
                    <div className="mt-4">
                        <span className="inline-block bg-vivid-blue/10 text-vivid-blue text-[10px] px-2 py-1 rounded font-bold tracking-widest">
                            PREMIUM MEMBER
                        </span>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveTab("reservations")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTab === "reservations"
                        ? "bg-vivid-blue text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-vivid-blue"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    予約履歴
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTab === "profile"
                        ? "bg-vivid-blue text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-vivid-blue"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    会員情報設定
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTab === "billing"
                        ? "bg-vivid-blue text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-vivid-blue"
                    }`}
                  >
                    <History className="h-4 w-4" />
                    決済履歴・領収書
                  </button>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 w-full transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      ログアウト
                    </button>
                  </div>
                </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "reservations" && (
                <div className="space-y-12">
                  {/* Upcoming Reservations */}
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-vivid-blue" />
                      Upcoming Flights ({upcomingReservations.length})
                    </h3>

                    {upcomingReservations.length > 0 ? (
                      upcomingReservations.map(reservation => (
                        <div key={reservation.id} className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:border-vivid-blue/20 transition-all duration-500 mb-4">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-2xl font-bold text-slate-900">{reservation.course?.title ?? "ヘリコプター遊覧飛行"}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                                                <p className="text-sm font-bold text-slate-700">{formatDate(reservation.reservationDate)} / {formatTime(reservation.reservationTime)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passengers</p>
                                                <p className="text-sm font-bold text-slate-700">{reservation.pax}名</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                                        <div className="text-2xl font-bold text-vivid-blue">¥{formatPrice(reservation.totalPrice)}</div>
                                        <div className="flex gap-4">
                                            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-white font-bold">
                                                詳細
                                            </Button>
                                            <Button className="bg-vivid-blue text-white hover:bg-vivid-blue/90 font-bold px-8">
                                                変更依頼
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))
                    ) : (
                        <div className="py-20 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium text-sm">現在予定されているフライトはありません</p>
                        </div>
                    )}
                  </section>

                  {/* Past Reservations */}
                  {pastReservations.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        Flight History ({pastReservations.length})
                      </h3>
                      <div className="space-y-3">
                          {pastReservations.map(reservation => (
                              <div key={reservation.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden grayscale">
                                          <Calendar className="h-6 w-6 text-slate-300" />
                                      </div>
                                      <div>
                                          <h4 className="text-sm font-bold text-slate-900">{reservation.course?.title ?? "ヘリコプター遊覧飛行"}</h4>
                                          <p className="text-[10px] text-slate-400 font-medium">{formatDate(reservation.reservationDate)}</p>
                                      </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-vivid-blue font-bold hover:bg-vivid-blue/5">
                                      <FileText className="h-4 w-4 mr-2" />
                                      領収書
                                  </Button>
                              </div>
                          ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="max-w-2xl space-y-12">
                  <section className="space-y-8">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">お名前</label>
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{customer.name}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">メールアドレス</label>
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{customer.email}</p>
                            </div>
                            {customer.phone && (
                              <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">電話番号</label>
                                  <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{customer.phone}</p>
                              </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 flex justify-start">
                        <Button className="bg-vivid-blue text-white hover:bg-vivid-blue/90 px-12 font-bold h-12 rounded-full">
                            情報を変更する
                        </Button>
                    </div>
                  </section>

                  <section className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-slate-400" />
                        Security Settings
                    </h3>
                    <div className="flex items-center justify-between py-4 border-b border-slate-200">
                        <div>
                            <p className="text-sm font-bold text-slate-700">パスワード</p>
                            <p className="text-[10px] text-slate-400 mt-1">最終更新: -</p>
                        </div>
                        <Button variant="outline" className="border-slate-200 font-bold text-xs h-9">
                            更新
                        </Button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Payment History</h3>

                    {/* Show payments based on completed reservations */}
                    {pastReservations.filter(r => r.paymentStatus === "paid").length > 0 ? (
                      <div className="space-y-4">
                          {pastReservations.filter(r => r.paymentStatus === "paid").map((reservation) => (
                              <div key={reservation.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(reservation.reservationDate)}</span>
                                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">PAID</span>
                                      </div>
                                      <h4 className="font-bold text-slate-900 text-lg mb-1">{reservation.course?.title ?? "ヘリコプター遊覧飛行"}</h4>
                                      <p className="text-sm text-slate-500">予約番号: {reservation.bookingNumber}</p>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <div className="text-2xl font-bold text-slate-900">¥{formatPrice(reservation.totalPrice)}</div>
                                      <Button variant="outline" className="border-slate-200 font-bold text-xs h-10 px-6">
                                          <Download className="h-4 w-4 mr-2" />
                                          領収書
                                      </Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-20 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                          <p className="text-slate-400 font-medium text-sm">決済履歴はありません</p>
                      </div>
                    )}

                    <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-start gap-3">
                            <Bell className="h-5 w-5 text-vivid-blue mt-1" />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-2">インボイス制度への対応について</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    SkyViewでは適格請求書等保存方式（インボイス制度）に対応した領収書を発行しております。
                                    ダウンロードした領収書には弊社の登録番号が記載されています。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
