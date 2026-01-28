"use client";

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle2, Users, Plane, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { cn } from "@/components/ui/utils";
import { useReservations, useSlots } from '@/lib/api/hooks';
import { CardGridSkeleton, ErrorAlert } from '@/components/admin/shared';

export const DashboardView = () => {
  const today = format(new Date(), 'yyyy-MM-dd');

  // 本日のスロット取得（30秒ごとに自動リフレッシュ）
  const { data: todaySlots, isLoading: slotsLoading, error: slotsError } = useSlots({
    startDate: today,
    endDate: today,
  }, {
    refreshInterval: 30000,
  });

  // 予約データ取得（30秒ごとに自動リフレッシュ）
  const { data: reservationsData, isLoading: reservationsLoading, error: reservationsError } = useReservations({
    page: 1,
    pageSize: 100,
  });

  const isLoading = slotsLoading || reservationsLoading;
  const hasError = slotsError || reservationsError;

  // 今月の売上計算
  const thisMonthRevenue = useMemo(() => {
    if (!reservationsData?.data) return 0;
    const thisMonth = format(new Date(), 'yyyy-MM');
    return reservationsData.data
      .filter(r => {
        const bookingDate = r.reservationDate || r.date;
        return bookingDate?.startsWith(thisMonth) && r.status === 'confirmed';
      })
      .reduce((sum, r) => sum + (r.totalPrice || r.price || 0), 0);
  }, [reservationsData]);

  // 本日のフライト数
  const todayFlights = todaySlots?.data?.length || 0;

  // 今月の予約数
  const thisMonthReservations = useMemo(() => {
    if (!reservationsData?.data) return 0;
    const thisMonth = format(new Date(), 'yyyy-MM');
    return reservationsData.data.filter(r => {
      const bookingDate = r.reservationDate || r.date;
      return bookingDate?.startsWith(thisMonth);
    }).length;
  }, [reservationsData]);

  // 本日の予約数
  const todayReservations = useMemo(() => {
    if (!reservationsData?.data) return 0;
    return reservationsData.data.filter(r => {
      const bookingDate = r.reservationDate || r.date;
      return bookingDate === today;
    }).length;
  }, [reservationsData, today]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">ダッシュボード</h1>
            <p className="text-base font-medium text-slate-500 mt-2">本日の運航状況と主要な運用通知</p>
          </div>
        </div>
        <CardGridSkeleton cards={4} columns={4} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">ダッシュボード</h1>
            <p className="text-base font-medium text-slate-500 mt-2">本日の運航状況と主要な運用通知</p>
          </div>
        </div>
        <ErrorAlert
          title="データの取得に失敗しました"
          message="サーバーとの通信でエラーが発生しました。再読み込みしてください。"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">ダッシュボード</h1>
          <p className="text-lg font-medium text-slate-500 mt-2">本日の運航状況と主要な運用通知</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-black">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            システム正常稼働中
          </Badge>
          <span className="text-sm font-bold text-slate-400">最終更新: {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-[0.15em]">今月の売上</CardTitle>
            <DollarSign className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
              {thisMonthRevenue.toLocaleString()}<span className="text-base font-bold text-slate-400 ml-2 uppercase">JPY</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4">確定済み予約の合計</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-[0.15em]">本日のフライト</CardTitle>
            <Plane className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{todayFlights}<span className="text-base font-bold text-slate-400 ml-2 uppercase">枠</span></div>
            <p className="text-sm font-medium text-slate-500 mt-4">{format(new Date(), 'M/d')} のスロット数</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-[0.15em]">本日の予約</CardTitle>
            <Users className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{todayReservations}<span className="text-base font-bold text-slate-400 ml-2">件</span></div>
            <p className="text-sm font-medium text-slate-500 mt-4">{format(new Date(), 'M/d')} の予約数</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-[0.15em]">今月の予約</CardTitle>
            <Calendar className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{thisMonthReservations}<span className="text-base font-bold text-slate-400 ml-2">件</span></div>
            <p className="text-sm font-medium text-slate-500 mt-4">{format(new Date(), 'M')}月の累計予約</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Today's Flight Status - Main Operational List */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold">本日のフライト状況 ({format(new Date(), 'M/d')})</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{format(new Date(), 'HH:mm')} 現在</Badge>
            </div>
            <CardDescription className="text-sm font-medium mt-1">リアルタイムの予約・運航ステータス</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {todaySlots?.data && todaySlots.data.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {todaySlots.data.map((slot, i) => {
                  const maxPax = slot.maxPax;
                  const currentPax = slot.currentPax;
                  const availablePax = slot.availablePax ?? (maxPax - currentPax);
                  const isFull = availablePax === 0;
                  const isEmpty = currentPax === 0;
                  const rawTime = slot.time || slot.slotTime || '--:--';
                  const slotTime = rawTime.length > 5 ? rawTime.slice(0, 5) : rawTime;

                  return (
                    <div key={slot.id || i} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                        <span className="text-xs font-bold text-slate-800 font-mono">{slotTime}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-bold px-3 py-1 rounded-full",
                              isFull ? 'bg-vivid-blue/20 text-vivid-blue' :
                                isEmpty ? 'bg-slate-100 text-slate-500' :
                                  'bg-emerald-100 text-emerald-700'
                            )}>
                              {isFull ? '満席' : isEmpty ? '空席あり' : `残り${availablePax}席`}
                            </span>
                            <span className="text-sm text-slate-600 truncate font-semibold">
                              {slot.course?.title || 'コース未設定'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono font-bold">{currentPax}/{maxPax}</span>
                        </div>

                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500",
                              isFull ? 'bg-vivid-blue/100' :
                                isEmpty ? 'bg-transparent' :
                                  'bg-emerald-500'
                            )}
                            style={{ width: `${(currentPax / maxPax) * 100}%` }}
                          />
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-300 group-hover:text-vivid-blue shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                本日のフライトはありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
          <Card className="border-red-100 bg-red-50/10 shadow-none">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-red-700 uppercase tracking-[0.15em]">
                <AlertTriangle className="w-4 h-4" />
                Important Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm transition-all hover:border-red-200">
                  <p className="text-lg font-black text-slate-900">未返金の予約 (2件)</p>
                  <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">運休処理された予約の返金処理が未完了です。お客様への信頼に関わります。</p>
                  <Button className="w-full mt-4 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100">詳細を確認</Button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm transition-all hover:border-amber-200">
                  <p className="text-lg font-black text-slate-900">CRM同期エラー</p>
                  <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">顧客データの同期に失敗しました。</p>
                  <Button className="w-full mt-4 h-12 bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-50 rounded-xl">同期を再試行</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Health</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { label: 'Database', status: 'Healthy' },
                { label: 'Stripe API', status: 'Healthy' },
                { label: 'Mail Server', status: 'Healthy' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-semibold">{item.label}</span>
                  <span className="text-emerald-600 flex items-center gap-2 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {item.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
