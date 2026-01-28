"use client";

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle,
  Mail, Clock, LayoutGrid, List, Plus
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Slot, User, Reservation } from '@/lib/data/types';
import { useSlots } from '@/lib/api/hooks';
import { suspendSlot, closeSlot, reopenSlot } from '@/lib/api/mutations/slots';
import { CardGridSkeleton, ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Fixed cancellation notification template (no template management feature in requirements)
const CANCELLATION_TEMPLATE = {
  subject: '【重要】フライト運休のお知らせ',
  body: `お客様各位

ご予約いただいておりましたフライトについて、
天候等の理由により運休となりましたことをお知らせいたします。

ご不便をおかけし誠に申し訳ございません。
返金手続きについては別途ご連絡いたします。

PrivateSky Tour`,
};

export const SlotsView = ({ currentUser }: { currentUser: User }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  // スロット一括生成用state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generateEndDate, setGenerateEndDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [generateMaxPax, setGenerateMaxPax] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  // 週カレンダー用のデータ処理
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // 月曜始まり
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // SWRによるデータ取得（週全体をカバーする日付範囲）
  const { data, error, isLoading, mutate } = useSlots({
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  });

  const slots = data?.data ?? [];

  // Helper to get slot date (handles both snake_case and camelCase from API)
  const getSlotDate = (s: Slot): string => {
    const record = s as unknown as Record<string, unknown>;
    return (record.slot_date as string) ?? s.slotDate ?? s.date ?? '';
  };

  // Helper to get slot time (handles both snake_case and camelCase from API)
  const getSlotTime = (s: Slot): string => {
    const record = s as unknown as Record<string, unknown>;
    const time = (record.slot_time as string) ?? s.slotTime ?? s.time ?? '';
    return time.substring(0, 5); // Extract HH:mm from HH:mm:ss
  };

  // 日次ビュー用のスロットフィルタ
  const todaysSlots = slots.filter(s => getSlotDate(s) === format(selectedDate, 'yyyy-MM-dd'));
  
  // 表示する時間帯（9:00 - 19:00 の30分刻み）
  const timeSlots = useMemo(() => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00'
    ];
  }, []);

  // スロット生成用の時間帯オプション
  const ALL_TIME_OPTIONS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
  ];

  const getSlotForDayTime = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Handle both snake_case (slot_date/slot_time) and camelCase (slotDate/slotTime)
    return slots.find(s => getSlotDate(s) === dateStr && getSlotTime(s) === time);
  };

  const handleDateChange = (amount: number) => {
    if (viewMode === 'day') {
      setSelectedDate(prev => addDays(prev, amount));
    } else {
      setSelectedDate(prev => addDays(prev, amount * 7));
    }
    setSelectedSlot(null);
  };

  // スロット生成用ハンドラー
  const handleToggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const handleSelectAllTimes = () => {
    setSelectedTimes(ALL_TIME_OPTIONS);
  };

  const handleDeselectAllTimes = () => {
    setSelectedTimes([]);
  };

  const handleGenerateSlots = async () => {
    if (!generateStartDate || !generateEndDate || selectedTimes.length === 0) {
      toast.error('開始日、終了日、時間帯を選択してください');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/slots/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: generateStartDate,
          endDate: generateEndDate,
          times: selectedTimes.sort(),
          maxPax: generateMaxPax,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`${json.data.created}件のスロットを生成しました`);
        setIsGenerateDialogOpen(false);
        setGenerateStartDate('');
        setGenerateEndDate('');
        setSelectedTimes([]);
        mutate(); // SWRの再取得
      } else {
        toast.error(json.error || 'スロット生成に失敗しました');
      }
    } catch (error) {
      console.error('Generate slots error:', error);
      toast.error('スロット生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedSlot) {
    return (
      <SlotDetail
        slot={selectedSlot}
        onBack={() => setSelectedSlot(null)}
        currentUser={currentUser}
        onMutate={mutate}
      />
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">スロット管理</h1>
            <p className="text-xs text-slate-500 mt-1">フライト枠の販売状況確認と運休設定</p>
          </div>
        </div>
        <CardGridSkeleton cards={8} columns={4} />
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">スロット管理</h1>
            <p className="text-xs text-slate-500 mt-1">フライト枠の販売状況確認と運休設定</p>
          </div>
        </div>
        <ErrorAlert
          message="スロットデータの取得に失敗しました"
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">スロット管理</h1>
            <p className="text-xs text-slate-500 mt-1">フライト枠の販売状況確認と運休設定</p>
          </div>
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 text-sm bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" /> スロット生成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>スロット一括生成</DialogTitle>
                <DialogDescription className="text-sm">
                  指定した期間と時間帯でスロットを一括生成します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 日付範囲 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">開始日</Label>
                    <Input
                      type="date"
                      value={generateStartDate}
                      onChange={(e) => setGenerateStartDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">終了日</Label>
                    <Input
                      type="date"
                      value={generateEndDate}
                      onChange={(e) => setGenerateEndDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* 時間帯選択 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">時間帯</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={handleSelectAllTimes}
                      >
                        全選択
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={handleDeselectAllTimes}
                      >
                        全解除
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg bg-slate-50/50">
                    {ALL_TIME_OPTIONS.map((time) => (
                      <label
                        key={time}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedTimes.includes(time)}
                          onCheckedChange={() => handleToggleTime(time)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs font-mono">{time}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    選択中: {selectedTimes.length}件
                  </p>
                </div>

                {/* 最大人数 */}
                <div className="space-y-1.5">
                  <Label className="text-xs">最大搭乗人数</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={generateMaxPax}
                    onChange={(e) => setGenerateMaxPax(Number(e.target.value))}
                    className="h-9 text-sm w-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsGenerateDialogOpen(false)}
                  className="h-9 text-sm"
                  disabled={isGenerating}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleGenerateSlots}
                  className="h-9 text-sm bg-indigo-600 hover:bg-indigo-700"
                  disabled={isGenerating || !generateStartDate || !generateEndDate || selectedTimes.length === 0}
                >
                  {isGenerating ? '生成中...' : `${selectedTimes.length}件の時間帯で生成`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
           <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 flex-1 xs:flex-none">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                "flex-1 px-3 py-1.5 text-[10px] font-medium rounded-sm transition-all flex items-center justify-center gap-1.5",
                viewMode === 'day' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="w-3 h-3" /> 日次
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "flex-1 px-3 py-1.5 text-[10px] font-medium rounded-sm transition-all flex items-center justify-center gap-1.5",
                viewMode === 'week' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-3 h-3" /> 週次
            </button>
          </div>
          
          <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden h-9">
            <Button variant="ghost" size="icon" className="h-full w-8 rounded-none border-r border-slate-100 hover:bg-slate-50" onClick={() => handleDateChange(-1)}>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            </Button>
            <div className="flex items-center gap-2 px-2 sm:px-3 flex-1 justify-center bg-white min-w-[140px] sm:min-w-[180px]">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500 hidden xs:block" />
              <span className="text-[11px] sm:text-xs font-bold tabular-nums text-slate-700 whitespace-nowrap">
                {viewMode === 'day'
                  ? format(selectedDate, 'yyyy年 MM月 dd日 (eee)', { locale: ja })
                  : `${format(weekStart, 'MM/dd')} - ${format(weekEnd, 'MM/dd')}`
                }
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-full w-8 rounded-none border-l border-slate-100 hover:bg-slate-50" onClick={() => handleDateChange(1)}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'day' ? (
        <>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {todaysSlots.length === 0 ? (
               <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                 <div className="flex flex-col items-center gap-2">
                   <CalendarIcon className="w-8 h-8 opacity-20" />
                   <span className="text-xs">この日のフライト予定はありません</span>
                 </div>
               </div>
            ) : (
              todaysSlots.map((slot) => (
                <SlotCard 
                  key={slot.id} 
                  slot={slot} 
                  onClick={() => setSelectedSlot(slot)} 
                />
              ))
            )}
          </div>

          <Card className="border-red-100 bg-red-50/10 shadow-none mt-6">
            <CardContent className="p-3 flex items-start gap-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-red-700">運航中止判断について</h4>
                <p className="text-[10px] text-red-600/80 leading-relaxed">
                  運休処理を行うと、対象枠のすべての予約ステータスが「運休」に変更され、自動送信メールが配信される設定になっています。
                  返金処理は別途、予約詳細画面から個別に行う必要があります。
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-xs border-collapse min-w-[800px]">
               <thead>
                 <tr>
                   <th className="p-2 border-b border-r border-slate-100 bg-slate-50/50 w-20 sticky left-0 z-10 text-slate-500 font-medium">Time</th>
                   {weekDays.map(day => (
                     <th key={day.toISOString()} className={cn(
                       "p-2 border-b border-slate-100 text-center font-medium min-w-[100px]",
                       format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-indigo-50 text-indigo-700" : "bg-slate-50/50 text-slate-700"
                     )}>
                       <div>{format(day, 'MM/dd')}</div>
                       <div className="text-[10px] text-slate-400 mt-0.5 uppercase">{format(day, 'eee', { locale: ja })}</div>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {timeSlots.map(time => (
                   <tr key={time}>
                     <td className="p-2 border-r border-b border-slate-100 font-mono font-medium text-slate-500 text-center sticky left-0 bg-white z-10">
                       {time}
                     </td>
                     {weekDays.map(day => {
                       const slot = getSlotForDayTime(day, time);
                       return (
                         <td key={`${day.toISOString()}-${time}`} className="p-1 border-b border-slate-100 text-center h-16 align-top">
                           {slot ? (
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <div 
                                     onClick={() => setSelectedSlot(slot)}
                                     className={cn(
                                       "w-full h-full rounded p-1.5 cursor-pointer transition-all border flex flex-col justify-between gap-1",
                                       slot.status === 'suspended' ? "bg-amber-50 border-amber-200 hover:bg-amber-100" :
                                       slot.status === 'closed' ? "bg-slate-100 border-slate-200 opacity-60 hover:opacity-100" :
                                       (slot.reservations ?? []).length > 0 ? "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300" :
                                       "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                                     )}
                                   >
                                     <div className="flex justify-between items-start">
                                       <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-4 border-0",
                                         slot.status === 'suspended' ? "bg-amber-100 text-amber-700" :
                                         slot.status === 'closed' ? "bg-slate-200 text-slate-600" :
                                         (slot.reservations ?? []).length > 0 ? "bg-white text-indigo-700 border border-indigo-100 shadow-sm" :
                                         "bg-slate-100 text-slate-500"
                                       )}>
                                         {slot.status === 'suspended' ? '運休' : slot.status === 'closed' ? '売止' : (slot.reservations ?? []).length > 0 ? '予約済' : '空き'}
                                       </Badge>
                                     </div>
                                     <div className="text-right">
                                       {(slot.reservations ?? []).length > 0 ? (
                                         <div className="text-[10px] font-bold text-slate-900">
                                           {slot.currentPax}名
                                         </div>
                                       ) : (
                                          <div className="text-[10px] text-slate-300">-</div>
                                       )}
                                     </div>
                                   </div>
                                 </TooltipTrigger>
                                 <TooltipContent side="top" className="text-xs p-2">
                                   <div className="font-bold mb-1">{format(new Date(getSlotDate(slot)), 'M/d')} {getSlotTime(slot)}</div>
                                   <div className="space-y-1">
                                     <div className="flex justify-between gap-4">
                                       <span className="text-slate-400">搭乗人数</span>
                                       <span className="font-mono">{slot.currentPax} / {slot.maxPax}名</span>
                                     </div>
                                   </div>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                           ) : (
                             <div className="w-full h-full rounded bg-slate-50/30 border border-transparent flex items-center justify-center text-slate-200 text-[10px]">
                               -
                             </div>
                           )}
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </Card>
      )}
    </div>
  );
};

const SlotCard = ({ slot, onClick }: { slot: Slot, onClick: () => void }) => {
  const isSuspended = slot.status === 'suspended';
  const isClosed = slot.status === 'closed';
  const hasReservation = (slot.reservations ?? []).length > 0;
  // Handle both camelCase and snake_case from API
  const slotTime = ((slot.slotTime ?? slot.time) ?? '').substring(0, 5);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer bg-white",
        isSuspended ? "border-amber-200 bg-amber-50/50" : 
        isClosed ? "border-slate-200 bg-slate-50 opacity-70" : 
        hasReservation ? "border-indigo-100 bg-white ring-1 ring-indigo-50 shadow-sm" : // 予約あり
        "border-slate-100 hover:border-indigo-200 bg-white" // 空き
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            hasReservation ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
          )}>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">{slotTime}</span>
        </div>
        <Badge variant="outline" className={cn(
          "text-[10px] px-2 py-0.5 border font-medium rounded-full",
          isSuspended ? "bg-amber-100 text-amber-700 border-amber-200" :
          isClosed ? "bg-slate-200 text-slate-600 border-slate-300" :
          hasReservation ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : // 予約済
          "bg-white text-slate-500 border-slate-200" // 空き
        )}>
          {isSuspended ? '運休' : isClosed ? '売止' : hasReservation ? '予約済' : '空き'}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className={cn(
          "flex justify-between items-center px-3 py-2.5 rounded-lg border transition-colors",
          hasReservation ? "bg-indigo-50/30 border-indigo-100" : "bg-slate-50/50 border-slate-100"
        )}>
           <span className="text-[11px] font-medium text-slate-500">搭乗人数</span>
           {hasReservation ? (
             <div className="flex items-baseline gap-1">
               <span className="font-mono text-xl font-black text-indigo-600">{slot.currentPax}</span>
               <span className="text-xs text-slate-400 font-mono">/ {slot.maxPax}名</span>
             </div>
           ) : (
             <span className="text-sm text-slate-300 font-medium">Available</span>
           )}
        </div>

        {slot.reason && (
          <div className="flex items-start gap-2 bg-amber-50 p-2 rounded-lg text-[10px] text-amber-700 border border-amber-100/50">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{slot.reason}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      </div>
    </div>
  );
};

const SlotDetail = ({
  slot,
  onBack,
  currentUser,
  onMutate
}: {
  slot: Slot;
  onBack: () => void;
  currentUser: User;
  onMutate: () => void;
}) => {
  // Handle both camelCase and snake_case from API
  const slotDate = slot.slotDate ?? slot.date ?? '';
  const slotTime = ((slot.slotTime ?? slot.time) ?? '').substring(0, 5);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('weather');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [emailSubject, setEmailSubject] = useState(CANCELLATION_TEMPLATE.subject);
  const [emailBody, setEmailBody] = useState(CANCELLATION_TEMPLATE.body);

  // Get reservations from slot data (joined from API)
  const reservations: Reservation[] = (slot.reservations ?? []).map(res => {
    if (typeof res === 'string') {
      // If it's just an ID, return a minimal reservation object
      return { id: res } as Reservation;
    }
    // Map API response fields to Reservation type
    const reservation = res as Reservation & {
      booking_number?: string;
      customer_id?: string;
      total_price?: number;
      payment_status?: string;
      customer?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
      };
    };
    return {
      ...reservation,
      bookingNumber: reservation.bookingNumber ?? reservation.booking_number ?? '',
      customerId: reservation.customerId ?? reservation.customer_id ?? '',
      price: reservation.price ?? reservation.total_price ?? 0,
      paymentStatus: reservation.paymentStatus ?? reservation.payment_status ?? 'pending',
      customerName: reservation.customerName ?? reservation.customer?.name ?? '',
      customerEmail: reservation.customerEmail ?? reservation.customer?.email ?? '',
      customerPhone: reservation.customerPhone ?? reservation.customer?.phone ?? '',
    } as Reservation;
  });
  const isSuspended = slot.status === 'suspended';
  const hasReservation = reservations.length > 0;

  const handleSuspend = async () => {
    setIsSuspending(true);
    try {
      await suspendSlot(slot.id);
      toast.success('指定された時間枠を運休状態に変更いたしました。');
      setIsSuspendModalOpen(false);
      onMutate();
      onBack();
    } catch (_err) {
      toast.error('運休処理に失敗しました');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleToggleClose = async () => {
    setIsToggling(true);
    try {
      if (slot.status === 'closed') {
        await reopenSlot(slot.id);
        toast.success('スロットを販売再開しました。');
      } else {
        await closeSlot(slot.id);
        toast.success('スロットを売止にしました。');
      }
      onMutate();
      onBack();
    } catch (_err) {
      toast.error('処理に失敗しました');
    } finally {
      setIsToggling(false);
    }
  };

  const handleSendMail = () => {
    setIsEmailModalOpen(false);
    toast.success(`${reservations.length}名の予約者に一斉通知メールを正常に送信いたしました。`);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {slotDate} {slotTime}
            <Badge variant="outline" className={cn(
              "text-xs font-normal",
              isSuspended ? "bg-amber-50 text-amber-700 border-amber-200" :
              slot.status === 'closed' ? "bg-slate-200 text-slate-600 border-slate-300" :
              hasReservation ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
              "bg-white text-slate-600 border-slate-200"
            )}>
              {isSuspended ? '運休中' : slot.status === 'closed' ? '売止中' : hasReservation ? '予約済' : '空き'}
            </Badge>
          </h1>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Main: Reservation List */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">予約リスト ({reservations.length}件)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* モバイル用カードリスト */}
              <div className="md:hidden divide-y divide-slate-100">
                {reservations.length === 0 ? (
                   <div className="text-center py-16 text-xs text-slate-400">
                      予約はありません
                   </div>
                ) : (
                  reservations.map(res => (
                    <div key={res.id} className="p-4 bg-white active:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-sm font-bold text-slate-900">{res.bookingNumber}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-xs font-normal px-1.5",
                             res.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200'
                           )}>{res.status}</Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 space-y-1 mb-3">
                         <div className="font-medium text-slate-800">{res.customerName}</div>
                         <div className="text-slate-400 text-xs">{res.customerEmail}</div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-slate-500">
                         <span>{res.pax}名</span>
                         {res.paymentStatus === 'refunded' && (
                             <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-xs font-normal px-1.5">返金済</Badge>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* デスクトップ用テーブル */}
              <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="h-10 text-[10px] font-medium text-slate-500 uppercase pl-6">予約番号</TableHead>
                    <TableHead className="h-10 text-[10px] font-medium text-slate-500 uppercase">顧客名</TableHead>
                    <TableHead className="h-10 text-[10px] font-medium text-slate-500 uppercase">人数</TableHead>
                    <TableHead className="h-10 text-[10px] font-medium text-slate-500 uppercase">ステータス</TableHead>
                    <TableHead className="h-10 text-[10px] font-medium text-slate-500 uppercase pr-6">返金</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-xs text-slate-400">
                        予約はありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map(res => (
                      <TableRow key={res.id} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-medium pl-6 py-3">{res.bookingNumber}</TableCell>
                        <TableCell className="py-3">
                          <div className="text-sm font-medium text-slate-700">{res.customerName}</div>
                          <div className="text-xs text-slate-400">{res.customerEmail}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 py-3">{res.pax}名</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className={cn("text-xs font-normal px-1.5",
                            res.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200'
                          )}>{res.status}</Badge>
                        </TableCell>
                        <TableCell className="py-3 pr-6">
                          {res.paymentStatus === 'refunded' ? (
                            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-xs font-normal px-1.5">返金済</Badge>
                          ) : (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {currentUser.role === 'admin' && (
            <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
              <CardHeader className="py-4 px-6 border-b border-amber-200/50">
                <CardTitle className="text-xs font-bold text-amber-800 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" /> 運休処理
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-[10px] text-amber-700/80 leading-relaxed">
                  強風や機材トラブル等でフライトを中止する場合に使用します。予約者への通知は自動で行われますが、返金は個別対応が必要です。
                </p>
                <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full h-9 text-xs bg-amber-600 hover:bg-amber-700 border-amber-700 shadow-none" disabled={isSuspended}>
                      {isSuspended ? '運休設定済み' : '運休として処理する'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base">運休処理の確認</DialogTitle>
                      <DialogDescription className="text-xs">
                        この操作を行うと、この枠のすべての予約が「運休」ステータスに変更され、新規の予約受付が停止されます。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                       <div className="space-y-1.5">
                          <Label className="text-xs">運休理由</Label>
                          <Select value={suspendReason} onValueChange={setSuspendReason}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weather" className="text-xs">悪天候・強風のため</SelectItem>
                              <SelectItem value="maintenance" className="text-xs">機材メンテナンスのため</SelectItem>
                              <SelectItem value="other" className="text-xs">その他</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSuspendModalOpen(false)} className="h-8 text-xs" disabled={isSuspending}>キャンセル</Button>
                      <Button variant="destructive" onClick={handleSuspend} className="h-8 text-xs" disabled={isSuspending}>
                        {isSuspending ? '処理中...' : '実行する'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">アクション</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-10 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" /> 一括メール送信
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-base">一括メール送信</DialogTitle>
                    <DialogDescription className="text-xs">
                      対象: {reservations.length}名の予約者
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-3">
                     <div className="space-y-1.5">
                       <Label className="text-xs">件名</Label>
                       <Input
                         className="h-9 text-xs"
                         value={emailSubject}
                         onChange={(e) => setEmailSubject(e.target.value)}
                       />
                     </div>
                     <div className="space-y-1.5">
                       <Label className="text-xs">本文</Label>
                       <Textarea
                         className="min-h-[200px] text-xs font-mono leading-relaxed"
                         value={emailBody}
                         onChange={(e) => setEmailBody(e.target.value)}
                       />
                     </div>
                     <p className="text-xs text-slate-400">
                       運休通知用のテンプレートです。必要に応じて内容を編集してください。
                     </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEmailModalOpen(false)} className="h-8 text-xs">キャンセル</Button>
                    <Button onClick={handleSendMail} className="h-8 text-xs">送信する</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <Label className="text-xs text-slate-600">売止設定</Label>
                   <Button
                     variant="outline"
                     size="sm"
                     className="h-8 text-xs px-3"
                     disabled={isSuspended || isToggling}
                     onClick={handleToggleClose}
                   >
                     {isToggling ? '処理中...' : slot.status === 'closed' ? '販売再開' : '売止にする'}
                   </Button>
                </div>
                <p className="text-xs text-slate-400">
                  一時的に新規予約を停止します。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};