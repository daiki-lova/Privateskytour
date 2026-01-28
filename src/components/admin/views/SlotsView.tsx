"use client";

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, AlertTriangle,
  Mail, Clock, LayoutGrid, List, Plus, RotateCcw
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

// Fixed cancellation notification template
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

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generateEndDate, setGenerateEndDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [generateMaxPax, setGenerateMaxPax] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data, error, isLoading, mutate } = useSlots({
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  });

  const slots = data?.data ?? [];

  const getSlotDate = (s: Slot): string => {
    const record = s as unknown as Record<string, unknown>;
    return (record.slot_date as string) ?? s.slotDate ?? s.date ?? '';
  };

  const getSlotTime = (s: Slot): string => {
    const record = s as unknown as Record<string, unknown>;
    const time = (record.slot_time as string) ?? s.slotTime ?? s.time ?? '';
    return time.substring(0, 5);
  };

  const todaysSlots = slots.filter(s => getSlotDate(s) === format(selectedDate, 'yyyy-MM-dd'));

  const timeSlots = useMemo(() => [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
  ], []);

  const ALL_TIME_OPTIONS = timeSlots;

  const getSlotForDayTime = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
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

  const handleToggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
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
        mutate();
      } else {
        toast.error(json.error || 'スロット生成に失敗しました');
      }
    } catch (error) {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">スロット管理</h1>
            <p className="text-base font-medium text-slate-500 mt-2">フライト枠の販売状況確認と運休設定</p>
          </div>
        </div>
        <CardGridSkeleton cards={8} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert message="スロットデータの取得に失敗しました" onRetry={() => mutate()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">スロット管理</h1>
          <p className="text-base font-medium text-slate-500 mt-2">フライト枠の販売状況確認と運休設定</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 rounded-xl">
              <Plus className="w-5 h-5 mr-3" /> スロットを一括生成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-xl font-black">スロット一括生成</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-1.5">
                期間と時間帯を指定して生成します
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-base font-black text-slate-700">開始日</Label>
                  <Input type="date" value={generateStartDate} onChange={(e) => setGenerateStartDate(e.target.value)} className="h-12 text-base font-medium px-4" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-base font-black text-slate-700">終了日</Label>
                  <Input type="date" value={generateEndDate} onChange={(e) => setGenerateEndDate(e.target.value)} className="h-12 text-base font-medium px-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">時間帯</Label>
                <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg bg-slate-50/50">
                  {ALL_TIME_OPTIONS.map((time) => (
                    <label key={time} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox checked={selectedTimes.includes(time)} onCheckedChange={() => handleToggleTime(time)} className="h-3.5 w-3.5" />
                      <span className="text-xs font-mono">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-slate-50/50 flex gap-3">
              <Button variant="ghost" onClick={() => setIsGenerateDialogOpen(false)} className="btn-secondary border-none flex-1">キャンセル</Button>
              <Button onClick={handleGenerateSlots} className="btn-primary flex-1" disabled={isGenerating}>生成する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto mt-4">
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 flex-1 xs:flex-none">
          <button onClick={() => setViewMode('day')} className={cn("flex-1 px-6 py-2.5 text-sm font-black rounded-sm transition-all flex items-center justify-center gap-2", viewMode === 'day' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>
            <List className="w-4 h-4" /> 日次
          </button>
          <button onClick={() => setViewMode('week')} className={cn("flex-1 px-6 py-2.5 text-sm font-black rounded-sm transition-all flex items-center justify-center gap-2", viewMode === 'week' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>
            <LayoutGrid className="w-4 h-4" /> 週次
          </button>
        </div>
        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-12">
          <Button variant="ghost" size="icon" className="h-full w-12 rounded-none border-r" onClick={() => handleDateChange(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="px-6 text-sm font-black tabular-nums">
            {viewMode === 'day' ? format(selectedDate, 'yyyy/MM/dd (eee)', { locale: ja }) : `${format(weekStart, 'MM/dd')} - ${format(weekEnd, 'MM/dd')}`}
          </div>
          <Button variant="ghost" size="icon" className="h-full w-12 rounded-none border-l" onClick={() => handleDateChange(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {viewMode === 'day' ? (
        <div className="grid gap-3 md:grid-cols-4 mt-6">
          {todaysSlots.map(slot => (
            <SlotCard key={slot.id} slot={slot} onClick={() => setSelectedSlot(slot)} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-3 border-b border-r bg-slate-50/50 w-20 sticky left-0 font-bold text-slate-500">TIME</th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className={cn("p-3 border-b border-slate-100 text-center font-bold min-w-[100px]", format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-indigo-50 text-indigo-700" : "bg-slate-50/50 text-slate-700")}>
                      <div className="text-sm">{format(day, 'MM/dd')}</div>
                      <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{format(day, 'eee', { locale: ja })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="p-3 border-r border-b border-slate-100 font-mono font-bold text-slate-500 text-center sticky left-0 bg-white">
                      {time}
                    </td>
                    {weekDays.map(day => {
                      const slot = getSlotForDayTime(day, time);
                      return (
                        <td key={`${day.toISOString()}-${time}`} className="p-1 border-b border-slate-100 text-center h-16 align-top">
                          {slot ? (
                            <div
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "w-full h-full rounded p-2 cursor-pointer transition-all border flex flex-col justify-between items-center group",
                                slot.status === 'suspended' ? "bg-amber-50 border-amber-200" :
                                  slot.status === 'closed' ? "bg-slate-100 border-slate-200 opacity-60" :
                                    (slot.reservations?.length ?? 0) > 0 ? "bg-indigo-50 border-indigo-200" :
                                      "bg-white border-slate-100 hover:border-indigo-300"
                              )}
                            >
                              <Badge variant="outline" className="text-xs font-bold py-0 h-4 uppercase">
                                {slot.status === 'suspended' ? '運休' : slot.status === 'closed' ? '売止' : (slot.reservations?.length ?? 0) > 0 ? '予約済' : '空き'}
                              </Badge>
                              <div className="text-xs font-black tabular-nums">
                                {(slot.reservations?.length ?? 0) > 0 ? `${slot.currentPax}名` : <span className="text-slate-200 font-bold text-xs tracking-tight">AVAILABLE</span>}
                              </div>
                            </div>
                          ) : null}
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
  const slotTime = ((slot.slotTime ?? slot.time) ?? '').substring(0, 5);
  const hasReservation = (slot.reservations?.length ?? 0) > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl border transition-all hover:shadow-lg cursor-pointer bg-white",
        slot.status === 'suspended' ? "border-amber-200 bg-amber-50/50" :
          slot.status === 'closed' ? "border-slate-200 bg-slate-50" :
            hasReservation ? "border-indigo-100 bg-indigo-50/20" : "border-slate-100"
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-black font-mono">{slotTime}</span>
        <Badge variant="outline" className="font-bold text-xs uppercase">
          {slot.status === 'suspended' ? '運休' : slot.status === 'closed' ? '売止' : hasReservation ? '予約済' : '空き'}
        </Badge>
      </div>
      <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400">搭乗状況</span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black font-mono text-indigo-600">{slot.currentPax}</span>
          <span className="text-xs font-bold text-slate-400">/ {slot.maxPax}</span>
        </div>
      </div>
    </div>
  );
};

const SlotDetail = ({ slot, onBack, currentUser, onMutate }: { slot: Slot, onBack: () => void, currentUser: User, onMutate: () => void }) => {
  const slotDate = slot.slotDate ?? slot.date ?? '';
  const slotTime = ((slot.slotTime ?? slot.time) ?? '').substring(0, 5);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [emailSubject, setEmailSubject] = useState(CANCELLATION_TEMPLATE.subject);
  const [emailBody, setEmailBody] = useState(CANCELLATION_TEMPLATE.body);

  const reservations: Reservation[] = (slot.reservations ?? []).map((res: any) => {
    if (typeof res === 'string') return { id: res } as Reservation;
    return {
      ...res,
      bookingNumber: res.bookingNumber ?? res.booking_number ?? '',
      customerId: res.customerId ?? res.customer_id ?? '',
      price: res.price ?? res.total_price ?? 0,
      paymentStatus: res.paymentStatus ?? res.payment_status ?? 'pending',
      customerName: res.customerName ?? res.customer?.name ?? '',
      customerEmail: res.customerEmail ?? res.customer?.email ?? '',
      customerPhone: res.customerPhone ?? res.customer?.phone ?? '',
    } as Reservation;
  });

  const handleSuspend = async () => {
    setIsSuspending(true);
    try {
      await suspendSlot(slot.id);
      toast.success('運休済みに設定しました');
      setIsSuspendModalOpen(false);
      onMutate();
      onBack();
    } catch { toast.error('エラーが発生しました'); } finally { setIsSuspending(false); }
  };

  const handleToggleClose = async () => {
    setIsToggling(true);
    try {
      if (slot.status === 'closed') await reopenSlot(slot.id);
      else await closeSlot(slot.id);
      onMutate();
      onBack();
      toast.success('ステータスを更新しました');
    } catch { toast.error('エラーが発生しました'); } finally { setIsToggling(false); }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            {slotDate} <span className="text-slate-200 font-light mx-2">/</span> {slotTime}
            <Badge variant="outline" className="text-sm font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-slate-50 border-slate-200 shadow-sm ml-4">{slot.status}</Badge>
          </h1>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 mt-8">
        <div className="lg:col-span-8 space-y-10">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="px-10 py-8 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">予約者リスト ({reservations.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="pl-10 h-16 text-sm font-black text-slate-400 uppercase tracking-widest">予約番号</TableHead>
                    <TableHead className="h-16 text-sm font-black text-slate-400 uppercase tracking-widest">顧客名</TableHead>
                    <TableHead className="h-16 text-sm font-black text-slate-400 uppercase tracking-widest">人数</TableHead>
                    <TableHead className="pr-10 h-16 text-sm font-black text-slate-400 uppercase tracking-widest text-right">ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map(res => (
                    <TableRow key={res.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-10 py-6 font-mono font-black text-base text-slate-900">{res.bookingNumber}</TableCell>
                      <TableCell className="py-6">
                        <div className="font-black text-lg text-slate-800">{res.customerName}</div>
                        <div className="text-base font-medium text-slate-400 mt-1">{res.customerEmail}</div>
                      </TableCell>
                      <TableCell className="py-6 font-black text-slate-600 text-base">{res.pax}名</TableCell>
                      <TableCell className="pr-10 py-6 text-right">
                        <Badge variant="secondary" className="font-black uppercase text-sm px-3 py-1 bg-slate-100 text-slate-600 border-none">{res.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reservations.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-300 font-bold">予約はありません</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-indigo-100 bg-indigo-50/20 shadow-none">
            <CardHeader className="px-10 py-8 border-b border-indigo-100/50">
              <CardTitle className="text-sm font-black text-indigo-900 uppercase tracking-widest">フライト概要</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-indigo-700/70">現在搭乗</span>
                <span className="text-4xl font-black font-mono text-indigo-950">{slot.currentPax} <span className="text-xl text-indigo-400">/</span> {slot.maxPax} <span className="text-xl">名</span></span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="px-10 py-8 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">アクション</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <Button className="h-16 text-base font-black w-full justify-start px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100" disabled={reservations.length === 0} onClick={() => setIsEmailModalOpen(true)}>
                <Mail className="w-6 h-6 mr-4" /> 一斉通知メールを送信
              </Button>
              <Button variant="ghost" onClick={handleToggleClose} disabled={isToggling} className="h-16 text-base font-black w-full justify-start px-8 border border-slate-200 hover:bg-slate-50 text-slate-700">
                <Clock className="w-6 h-6 mr-4" /> {slot.status === 'closed' ? '販売を再開する' : 'この枠を売止にする'}
              </Button>
              <div className="pt-4 px-2">
                <Separator className="bg-slate-100" />
              </div>
              <Button onClick={() => setIsSuspendModalOpen(true)} disabled={slot.status === 'suspended'} className="h-16 text-base font-black w-full justify-start px-8 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                <AlertTriangle className="w-6 h-6 mr-4" /> 運休処理を実行する
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-black text-red-700">運休処理の実行</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">この枠の全予約を運休に変更し、販売を停止します。<br /><span className="text-red-500">※この操作は取り消せません。</span></p>
          </div>
          <DialogFooter className="p-6 border-t bg-red-50/50 flex gap-3">
            <Button variant="ghost" onClick={() => setIsSuspendModalOpen(false)} className="btn-secondary border-none flex-1">キャンセル</Button>
            <Button onClick={handleSuspend} disabled={isSuspending} className="bg-red-600 hover:bg-red-700 text-white font-black flex-1">運休を確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};