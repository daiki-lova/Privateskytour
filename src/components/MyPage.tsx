"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Calendar, Clock, MapPin, User, Settings, LogOut, FileText, History, Download, CreditCard, Bell } from "lucide-react";
import { PLANS } from "./booking/constants";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// モックデータ: ユーザー情報
const MOCK_USER = {
  name: "山田 太郎",
  email: "taro.yamada@example.com",
  phone: "090-1234-5678",
  memberId: "SKY-882349",
  avatar: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2ODk4MDc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

// モックデータ: 決済履歴
const MOCK_PAYMENTS = [
    {
        id: "PAY-001",
        date: "2024-10-15",
        planName: "東京・横浜クルーズ",
        amount: 328500,
        method: "Credit Card (**** 4242)",
        status: "paid"
    },
    {
        id: "PAY-002",
        date: "2024-08-01",
        planName: "東京パノラマクルーズ",
        amount: 219000,
        method: "Credit Card (**** 4242)",
        status: "paid"
    }
];

// モックデータ: 予約履歴
const MOCK_RESERVATIONS = [
  {
    id: "RES-001",
    planId: "sightseeing-2",
    planName: "東京パノラマクルーズ",
    date: "2024-12-25",
    time: "18:00",
    passengers: 3,
    price: 219000,
    status: "upcoming", 
    image: PLANS.find(p => p.id === "sightseeing-2")?.image
  },
  {
    id: "RES-002",
    planId: "sightseeing-3",
    planName: "東京・横浜クルーズ",
    date: "2024-10-15",
    time: "14:00",
    passengers: 3,
    price: 328500,
    status: "completed",
    image: PLANS.find(p => p.id === "sightseeing-3")?.image
  }
];

interface MyPageProps {
  onLogout: () => void;
}

export function MyPage({ onLogout }: MyPageProps) {
  const [activeTab, setActiveTab] = useState("reservations");

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
                    <h2 className="font-bold text-xl text-slate-900">{MOCK_USER.name} 様</h2>
                    <p className="text-sm text-slate-400 font-mono mt-1">{MOCK_USER.memberId}</p>
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
                      Upcoming Flights
                    </h3>
                    
                    {MOCK_RESERVATIONS.filter(r => r.status === "upcoming").length > 0 ? (
                      MOCK_RESERVATIONS.filter(r => r.status === "upcoming").map(reservation => (
                        <div key={reservation.id} className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:border-vivid-blue/20 transition-all duration-500">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                                    {reservation.image && (
                                        <ImageWithFallback 
                                            src={reservation.image} 
                                            alt={reservation.planName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                </div>
                                <div className="p-8 md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-2xl font-bold text-slate-900">{reservation.planName}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                                                <p className="text-sm font-bold text-slate-700">{reservation.date} / {reservation.time}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passengers</p>
                                                <p className="text-sm font-bold text-slate-700">{reservation.passengers}名</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                                        <div className="text-2xl font-bold text-vivid-blue">¥{reservation.price.toLocaleString()}</div>
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
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      Flight History
                    </h3>
                    <div className="space-y-3">
                        {MOCK_RESERVATIONS.filter(r => r.status === "completed").map(reservation => (
                            <div key={reservation.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden grayscale">
                                        {reservation.image && (
                                            <ImageWithFallback src={reservation.image} alt="" className="w-full h-full object-cover opacity-50" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{reservation.planName}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{reservation.date}</p>
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
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{MOCK_USER.name}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">会員ID</label>
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 font-mono">{MOCK_USER.memberId}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">メールアドレス</label>
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{MOCK_USER.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">電話番号</label>
                                <p className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">{MOCK_USER.phone}</p>
                            </div>
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
                            <p className="text-[10px] text-slate-400 mt-1">最終更新: 2024/01/15</p>
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
                    <div className="space-y-4">
                        {MOCK_PAYMENTS.map((payment) => (
                            <div key={payment.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payment.date}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">PAID</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{payment.planName}</h4>
                                    <p className="text-sm text-slate-500">{payment.method}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-2xl font-bold text-slate-900">¥{payment.amount.toLocaleString()}</div>
                                    <Button variant="outline" className="border-slate-200 font-bold text-xs h-10 px-6">
                                        <Download className="h-4 w-4 mr-2" />
                                        領収書
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

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
