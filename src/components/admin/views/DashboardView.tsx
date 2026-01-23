"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, CheckCircle2, Users, Plane, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { cn } from "@/components/ui/utils";

export const DashboardView = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
          <p className="text-xs text-slate-500 mt-1">本日の運航状況と主要な運用通知</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 text-[10px] font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            システム正常稼働中
          </Badge>
          <span className="text-[10px] text-slate-400">最終更新: 14:00</span>
        </div>
      </div>

      {/* KPI Cards - Reverted to Operational focus */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">本日の予約</CardTitle>
            <Users className="h-3.5 w-3.5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">5<span className="text-xs font-normal text-slate-400 ml-1">件</span></div>
            <p className="text-[10px] text-slate-500 mt-1">+2件 (前日比)</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">運休・キャンセル</CardTitle>
            <Plane className="h-3.5 w-3.5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600">1<span className="text-xs font-normal text-slate-400 ml-1">枠</span></div>
            <p className="text-[10px] text-slate-500 mt-1">強風による運休 (16:30)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-red-50/10 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-red-600 uppercase tracking-wider">要対応アクション</CardTitle>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">3<span className="text-xs font-normal text-slate-400 ml-1">件</span></div>
            <p className="text-[10px] text-red-500 mt-1 font-medium">未返金 2件 / 同期エラー 1件</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Today's Flight Status - Main Operational List */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold">本日のフライト状況 (12/25)</CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">14:00 現在</Badge>
            </div>
            <CardDescription className="text-xs">リアルタイムの予約・運航ステータス</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {[
                { time: '16:30', status: 'full', pax: '3/3', label: '満席', desc: 'サンセットクルーズ' },
                { time: '17:00', status: 'full', pax: '3/3', label: '満席', desc: 'ナイトクルーズ' },
                { time: '17:30', status: 'open', pax: '0/3', label: '空席あり', desc: 'ナイトクルーズ' },
                { time: '18:00', status: 'open', pax: '0/3', label: '空席あり', desc: 'ナイトクルーズ' },
                { time: '18:30', status: 'maintenance', pax: '-', label: '機体点検', desc: '定期メンテナンス' },
                { time: '19:00', status: 'open', pax: '1/3', label: '残り2席', desc: 'ナイトクルーズ' },
              ].map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                    <span className="text-xs font-bold text-slate-800 font-mono">{slot.time}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[10px] font-bold px-2 py-0.5 rounded-full",
                           slot.status === 'full' ? 'bg-indigo-100 text-indigo-700' :
                           slot.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                           'bg-emerald-100 text-emerald-700'
                         )}>
                           {slot.label}
                         </span>
                         <span className="text-[11px] text-slate-500 truncate font-medium">{slot.desc}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{slot.pax}</span>
                    </div>
                    
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", 
                          slot.status === 'full' ? 'bg-indigo-500 w-full' : 
                          slot.status === 'maintenance' ? 'bg-amber-400 w-full' : 
                          slot.status === 'open' && slot.pax !== '0/3' ? 'bg-emerald-500 w-1/3' : 'bg-transparent'
                        )} 
                      />
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-300 group-hover:text-indigo-600 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
           <Card className="border-red-100 bg-red-50/10 shadow-none">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-red-700 uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" />
                Important Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                   <p className="text-[11px] font-bold text-slate-800">未返金の予約 (2件)</p>
                   <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">運休処理された予約の返金処理が未完了です。</p>
                   <Button size="sm" variant="outline" className="w-full mt-2 text-[10px] h-7 border-red-200 text-red-600 hover:bg-red-50">詳細を確認</Button>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                   <p className="text-[11px] font-bold text-slate-800">CRM同期エラー</p>
                   <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">顧客データの同期に失敗しました。</p>
                   <Button size="sm" variant="outline" className="w-full mt-2 text-[10px] h-7 border-amber-200 text-amber-600 hover:bg-amber-50">再試行</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/30">
               <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Health</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
               {[
                 { label: 'Database', status: 'Healthy' },
                 { label: 'Stripe API', status: 'Healthy' },
                 { label: 'Mail Server', status: 'Healthy' },
               ].map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-[11px]">
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