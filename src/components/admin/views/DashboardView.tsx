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
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
            <p className="text-sm text-slate-500 mt-1">本日の運航状況と主要な運用通知</p>
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
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
            <p className="text-sm text-slate-500 mt-1">本日の運航状況と主要な運用通知</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-1">本日の運航状況と主要な運用通知</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            システム正常稼働中
          </Badge>
          <span className="text-xs text-slate-400">最終更新: {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">今月の売上</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {thisMonthRevenue.toLocaleString()}<span className="text-xs font-normal text-slate-400 ml-1">円</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">確定済み予約の合計</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">本日のフライト</CardTitle>
            <Plane className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{todayFlights}<span className="text-xs font-normal text-slate-400 ml-1">枠</span></div>
            <p className="text-xs text-slate-500 mt-1">{format(new Date(), 'M/d')} のスロット数</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">本日の予約</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{todayReservations}<span className="text-xs font-normal text-slate-400 ml-1">件</span></div>
            <p className="text-xs text-slate-500 mt-1">{format(new Date(), 'M/d')} の予約数</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">今月の予約</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{thisMonthReservations}<span className="text-xs font-normal text-slate-400 ml-1">件</span></div>
            <p className="text-xs text-slate-500 mt-1">{format(new Date(), 'M')}月の累計予約</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Today's Flight Status - Main Operational List */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold">本日のフライト状況 ({format(new Date(), 'M/d')})</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">{format(new Date(), 'HH:mm')} 現在</Badge>
            </div>
            <CardDescription className="text-xs">リアルタイムの予約・運航ステータス</CardDescription>
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
                  const slotTime = slot.time || slot.slotTime || '--:--';

                  return (
                    <div key={slot.id || i} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                        <span className="text-xs font-bold text-slate-800 font-mono">{slotTime}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-xs font-bold px-2 py-0.5 rounded-full",
                               isFull ? 'bg-indigo-100 text-indigo-700' :
                               isEmpty ? 'bg-slate-100 text-slate-500' :
                               'bg-emerald-100 text-emerald-700'
                             )}>
                               {isFull ? '満席' : isEmpty ? '空席あり' : `残り${availablePax}席`}
                             </span>
                             <span className="text-xs text-slate-500 truncate font-medium">
                               {slot.course?.title || 'コース未設定'}
                             </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{currentPax}/{maxPax}</span>
                        </div>

                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500",
                              isFull ? 'bg-indigo-500' :
                              isEmpty ? 'bg-transparent' :
                              'bg-emerald-500'
                            )}
                            style={{ width: `${(currentPax / maxPax) * 100}%` }}
                          />
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-300 group-hover:text-indigo-600 shrink-0">
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
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-red-700 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" />
                Important Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                   <p className="text-xs font-bold text-slate-800">未返金の予約 (2件)</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">運休処理された予約の返金処理が未完了です。</p>
                   <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7 border-red-200 text-red-600 hover:bg-red-50">詳細を確認</Button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                   <p className="text-xs font-bold text-slate-800">CRM同期エラー</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">顧客データの同期に失敗しました。</p>
                   <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7 border-amber-200 text-amber-600 hover:bg-amber-50">再試行</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/30">
               <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
               {[
                 { label: 'Database', status: 'Healthy' },
                 { label: 'Stripe API', status: 'Healthy' },
                 { label: 'Mail Server', status: 'Healthy' },
               ].map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-xs">
                   <span className="text-slate-600 font-medium">{item.label}</span>
                   <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
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
