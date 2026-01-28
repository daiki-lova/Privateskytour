"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import {
  Printer, Calendar as CalendarIcon, FileDown, User as UserIcon,
  Phone, FileText, CheckCircle2, Scale, Loader2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

// Types for API response
interface ManifestPassenger {
  id: string;
  name: string;
  nameKana: string | null;
  nameRomaji: string | null;
  weightKg: number | null;
  specialRequirements: string | null;
  isChild: boolean | null;
  isInfant: boolean | null;
  seatNumber: number | null;
}

interface ManifestCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string;
}

interface ManifestReservation {
  id: string;
  bookingNumber: string;
  pax: number;
  status: string;
  customer: ManifestCustomer | null;
  passengers: ManifestPassenger[];
}

interface ManifestSlot {
  id: string;
  slotTime: string;
  slotDate: string;
  maxPax: number;
  currentPax: number;
  course: { id: string; title: string } | null;
  reservations: ManifestReservation[];
}

interface ApiResponse {
  success: boolean;
  data?: ManifestSlot[];
  error?: string;
}

const fetcher = (url: string): Promise<ApiResponse> => fetch(url).then(res => res.json());

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export const ManifestView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ManifestReservation | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<ManifestPassenger | null>(null);

  const [weightInput, setWeightInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/admin/manifest?date=${dateString}`,
    fetcher
  );

  const slots = data?.data ?? [];

  const handlePrint = () => window.print();

  const handleOpenDetail = (reservation: ManifestReservation, passenger: ManifestPassenger) => {
    setSelectedReservation(reservation);
    setSelectedPassenger(passenger);
    setWeightInput(passenger.weightKg?.toString() || '');
    setNotesInput(passenger.specialRequirements || '');
  };

  const handleCloseDialog = () => {
    setSelectedReservation(null);
    setSelectedPassenger(null);
  };

  const handleSaveManifest = async () => {
    if (!selectedPassenger) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/passengers/${selectedPassenger.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: weightInput ? parseInt(weightInput, 10) : null,
          specialRequirements: notesInput || null,
        }),
      });
      if (!response.ok) throw new Error('Update failed');
      toast.success('搭乗者情報を更新しました');
      handleCloseDialog();
      mutate();
    } catch { toast.error('保存に失敗しました'); } finally { setIsProcessing(false); }
  };

  const handleExportCSV = () => {
    const rows: string[][] = [['時間', '予約番号', '搭乗者名', 'ローマ字', '体重(kg)', '電話番号', '備考']];
    slots.forEach(slot => {
      slot.reservations?.forEach(res => {
        res.passengers?.forEach(p => {
          rows.push([formatTime(slot.slotTime), res.bookingNumber, p.name, p.nameRomaji || '', p.weightKg?.toString() || '', res.customer?.phone || '', p.specialRequirements || '']);
        });
      });
    });
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${dateString}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSlotStats = (reservations: ManifestReservation[]) => {
    let totalPax = 0; let totalWeight = 0; let checkedCount = 0;
    reservations.forEach(res => {
      totalPax += res.pax;
      res.passengers?.forEach(p => { if (p.weightKg) { totalWeight += p.weightKg; checkedCount++; } });
    });
    return { totalPax, totalWeight, checkedCount };
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">搭乗名簿</h1>
          <p className="text-base font-medium text-slate-500 mt-2">{format(selectedDate, 'yyyy年 MM月 dd日 (eee)', { locale: ja })} の搭乗者リスト</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 text-base font-black font-mono px-6 rounded-xl border-slate-200 bg-white">
                <CalendarIcon className="w-5 h-5 mr-3" />
                {format(selectedDate, 'yyyy/MM/dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" onClick={handlePrint} className="h-12 px-6 text-base font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
            <Printer className="w-5 h-5 mr-3" /> 印刷用表示
          </Button>
          <Button onClick={handleExportCSV} className="h-12 px-6 text-base font-bold bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl shadow-none">
            <FileDown className="w-5 h-5 mr-3" /> CSV出力
          </Button>
        </div>
      </div>

      {isLoading && <div className="py-20 flex flex-col items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mb-2" /><p className="text-xs font-bold">LOADING...</p></div>}
      {error && <ErrorAlert message="データの取得に失敗しました" onRetry={() => mutate()} />}

      {!isLoading && !error && (
        <div className="space-y-8 print:space-y-4">
          {slots.filter(s => s.reservations.length > 0).map(slot => {
            const { totalPax, totalWeight, checkedCount } = getSlotStats(slot.reservations);
            const allPassengersCount = slot.reservations.reduce((sum, r) => sum + (r.passengers?.length || 0), 0);

            return (
              <div key={slot.id} className="break-inside-avoid">
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="flex items-center justify-center bg-slate-900 text-white font-mono text-sm font-black w-16 h-8 rounded-lg shadow-sm">
                    {formatTime(slot.slotTime)}
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-7 text-xs font-bold text-slate-600 bg-slate-100 border-none px-3">
                      <UserIcon className="w-3 h-3 mr-1.5" /> {totalPax}名
                    </Badge>
                    {totalWeight > 0 && (
                      <Badge variant="secondary" className="h-7 text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-100 px-3">
                        <Scale className="w-3 h-3 mr-1.5" /> 合計 {totalWeight}kg ({checkedCount}/{allPassengersCount})
                      </Badge>
                    )}
                  </div>
                </div>

                <Card className="shadow-sm border-slate-200 bg-white overflow-hidden print:border print:shadow-none">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest h-12 pl-6 text-center">予約番号</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12">搭乗者名</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12">ローマ字</TableHead>
                          <TableHead className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest h-12 text-center">体重(kg)</TableHead>
                          <TableHead className="w-40 text-xs font-bold text-slate-500 uppercase tracking-widest h-12">電話番号</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12 pr-6">備考</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {slot.reservations.map(res => (
                          res.passengers?.map(passenger => (
                            <TableRow key={passenger.id} className="border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={() => handleOpenDetail(res, passenger)}>
                              <TableCell className="font-mono text-xs font-black text-slate-900 pl-6 text-center">{res.bookingNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                  {passenger.name}
                                  {(passenger.isChild || passenger.isInfant) && <Badge variant="outline" className="text-xs h-4 px-1">{passenger.isChild ? '子供' : '幼児'}</Badge>}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-mono font-bold text-slate-400 uppercase tracking-tight">{passenger.nameRomaji || '-'}</TableCell>
                              <TableCell className="text-sm font-black font-mono text-slate-900 text-center">{passenger.weightKg ? `${passenger.weightKg}kg` : '-'}</TableCell>
                              <TableCell className="text-xs font-mono text-slate-500"><div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-300" />{res.customer?.phone || '-'}</div></TableCell>
                              <TableCell className="pr-6"><div className="flex items-center gap-1.5 text-xs text-slate-500 italic max-w-xs truncate">{passenger.specialRequirements && <><FileText className="w-3 h-3 shrink-0" /> {passenger.specialRequirements}</>}</div></TableCell>
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            );
          })}
          {slots.length === 0 && <div className="py-20 text-center text-slate-400 bg-slate-50 border border-dashed rounded-lg font-bold text-sm">本日のフライト予約はありません</div>}
        </div>
      )}

      <Dialog open={!!selectedPassenger} onOpenChange={(o) => !o && handleCloseDialog()}>
        <DialogContent className="w-[95vw] lg:max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-none">
          <DialogHeader className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">搭乗者情報編集</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2">当日のチェックイン業務に使用します</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-white">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Passenger Name</div>
              <div className="text-2xl font-black text-slate-900">{selectedPassenger?.name}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">体重 (kg)</Label>
              <Input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="h-14 text-2xl font-black font-mono px-4" />
            </div>
            <div className="space-y-2">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">特記事項</Label>
              <Textarea value={notesInput} onChange={(e) => setNotesInput(e.target.value)} className="min-h-[160px] text-base font-medium px-4 py-3 resize-none border-slate-200 focus-visible:ring-vivid-blue" />
            </div>
          </div>
          <DialogFooter className="px-10 py-8 border-t bg-slate-50/50 flex gap-4">
            <Button variant="ghost" onClick={handleCloseDialog} className="h-14 text-base font-bold bg-white hover:bg-slate-50 border border-slate-200 flex-1">キャンセル</Button>
            <Button onClick={handleSaveManifest} disabled={isProcessing} className="h-14 text-base font-bold bg-vivid-blue hover:bg-vivid-blue/90 text-white shadow-lg shadow-vivid-blue/20 flex-1">
              {isProcessing ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> 保存中...</> : '変更を保存して閉じる'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
