"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import {
  Printer, Calendar as CalendarIcon, FileDown, User as UserIcon,
  Phone, FileText, CheckCircle2, Scale, Loader2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

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

// SWR fetcher
const fetcher = (url: string): Promise<ApiResponse> => fetch(url).then(res => res.json());

// Format time for display (HH:mm:ss -> HH:mm)
function formatTime(time: string): string {
  return time.slice(0, 5);
}

export const ManifestView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ManifestReservation | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<ManifestPassenger | null>(null);

  // Edit form state
  const [weightInput, setWeightInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Format date for API query
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Fetch manifest data
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/admin/manifest?date=${dateString}`,
    fetcher
  );

  const slots = data?.data ?? [];

  const handlePrint = () => {
    window.print();
  };

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

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Update failed');
      }

      toast.success('搭乗者情報の変更を正常に保存いたしました。');
      handleCloseDialog();
      mutate(); // Refresh data
    } catch (err) {
      console.error('Error updating passenger:', err);
      toast.error('保存に失敗しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const rows: string[][] = [['時間', '予約番号', '搭乗者名', 'ローマ字', '体重(kg)', '電話番号', '備考']];

    slots.forEach(slot => {
      slot.reservations?.forEach(res => {
        res.passengers?.forEach(p => {
          rows.push([
            formatTime(slot.slotTime),
            res.bookingNumber,
            p.name,
            p.nameRomaji || '',
            p.weightKg?.toString() || '',
            res.customer?.phone || '',
            p.specialRequirements || '',
          ]);
        });
        // If no passengers, still show reservation
        if (!res.passengers?.length) {
          rows.push([
            formatTime(slot.slotTime),
            res.bookingNumber,
            res.customer?.name || '',
            '',
            '',
            res.customer?.phone || '',
            '',
          ]);
        }
      });
    });

    // Create CSV with BOM for Japanese Excel compatibility
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${dateString}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate total passengers and weight for a slot
  const getSlotStats = (reservations: ManifestReservation[]) => {
    let totalPax = 0;
    let totalWeight = 0;
    let checkedCount = 0;

    reservations.forEach(res => {
      totalPax += res.pax;
      res.passengers?.forEach(p => {
        if (p.weightKg) {
          totalWeight += p.weightKg;
          checkedCount++;
        }
      });
    });

    return { totalPax, totalWeight, checkedCount };
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">搭乗名簿</h1>
          <p className="text-xs text-slate-500 mt-1">
            {format(selectedDate, 'yyyy年 MM月 dd日 (eee)', { locale: ja })} のフライト別搭乗者リスト
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 text-sm">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                {format(selectedDate, 'yyyy/MM/dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none h-10 text-sm">
            <Printer className="w-4 h-4 mr-1.5" /> 印刷用表示
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none h-10 text-sm">
            <FileDown className="w-4 h-4 mr-1.5" /> CSVエクスポート
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">読み込み中...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="py-10 flex flex-col items-center justify-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">データの取得に失敗しました</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}>
            再試行
          </Button>
        </div>
      )}

      {/* Manifest content */}
      {!isLoading && !error && (
        <div className="space-y-8 print:space-y-6">
          {slots.map(slot => {
            if (slot.reservations.length === 0) return null;

            const { totalPax, totalWeight, checkedCount } = getSlotStats(slot.reservations);
            const allPassengersCount = slot.reservations.reduce((sum, r) => sum + (r.passengers?.length || 0), 0);

            return (
              <div key={slot.id} className="break-inside-avoid">
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="flex items-center justify-center bg-slate-900 text-white font-mono text-sm font-bold w-16 h-8 rounded-lg shadow-sm">
                    {formatTime(slot.slotTime)}
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                      <UserIcon className="w-4 h-4" />
                      <span>{totalPax}名</span>
                    </div>
                    {totalWeight > 0 && (
                      <div className="flex items-center gap-1.5 bg-emerald-100 px-2 py-1 rounded text-xs font-bold text-emerald-700">
                        <Scale className="w-4 h-4" />
                        <span>{totalWeight}kg</span>
                        <span className="text-emerald-500">({checkedCount}/{allPassengersCount})</span>
                      </div>
                    )}
                  </div>
                </div>

                <Card className="shadow-sm border-slate-200 print:border print:shadow-none bg-white overflow-hidden">

                  {/* Mobile card list */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {slot.reservations.map(res => (
                      res.passengers?.map(passenger => (
                        <div
                          key={passenger.id}
                          className="p-4 active:bg-slate-50 transition-all"
                          onClick={() => handleOpenDetail(res, passenger)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-600 tracking-tight">{res.bookingNumber}</span>
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {passenger.name}
                                {passenger.isChild && <Badge variant="secondary" className="ml-1.5 text-xs">子供</Badge>}
                                {passenger.isInfant && <Badge variant="secondary" className="ml-1.5 text-xs">幼児</Badge>}
                              </div>
                              {passenger.nameRomaji && (
                                <div className="text-xs font-mono text-slate-500 uppercase">
                                  {passenger.nameRomaji}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              {passenger.weightKg && (
                                <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> CHECKED
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100/50 text-xs">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400 uppercase m-0">Weight</Label>
                              <div className="flex items-center gap-1.5 font-mono">
                                <Scale className="w-4 h-4 text-slate-400" />
                                <span className={passenger.weightKg ? "text-slate-900 font-bold" : "text-slate-300"}>
                                  {passenger.weightKg ? `${passenger.weightKg}kg` : 'Pending'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400 uppercase m-0">Contact</Label>
                              <div className="flex items-center gap-1.5 font-mono">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{res.customer?.phone || '-'}</span>
                              </div>
                            </div>
                          </div>

                          {passenger.specialRequirements && (
                            <div className="mt-3 bg-amber-50/50 text-amber-800 p-2.5 rounded-lg text-xs flex items-start gap-2 border border-amber-100/30">
                              <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                              <span className="leading-relaxed">{passenger.specialRequirements}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="w-[100px] text-xs font-semibold text-slate-500 uppercase tracking-wider h-9 pl-6">予約番号</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-9">搭乗者名</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-9">ローマ字</TableHead>
                          <TableHead className="w-[100px] text-xs font-semibold text-slate-500 uppercase tracking-wider h-9">体重(kg)</TableHead>
                          <TableHead className="w-[140px] text-xs font-semibold text-slate-500 uppercase tracking-wider h-9">電話番号</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-9 pr-6">備考</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {slot.reservations.map(res => (
                          res.passengers?.map(passenger => (
                            <TableRow
                              key={passenger.id}
                              className="border-slate-100 hover:bg-slate-50/50 cursor-pointer group transition-colors"
                              onClick={() => handleOpenDetail(res, passenger)}
                            >
                              <TableCell className="font-mono text-xs font-medium text-slate-700 py-3 pl-6 group-hover:text-indigo-600 transition-colors">
                                {res.bookingNumber}
                              </TableCell>
                              <TableCell className="text-xs font-medium text-slate-800 py-3">
                                <div className="flex items-center gap-2">
                                  {passenger.name}
                                  {passenger.isChild && <Badge variant="secondary" className="text-xs">子供</Badge>}
                                  {passenger.isInfant && <Badge variant="secondary" className="text-xs">幼児</Badge>}
                                  {passenger.weightKg && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 font-mono py-3">
                                {passenger.nameRomaji ? (
                                  <span className="font-medium text-slate-700 uppercase">{passenger.nameRomaji}</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 font-mono py-3">
                                {passenger.weightKg ? (
                                  <span className="font-semibold text-slate-700">{passenger.weightKg}kg</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 font-mono py-3">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4 text-slate-300" />
                                  {res.customer?.phone || '-'}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500 max-w-xs py-3 pr-6">
                                {passenger.specialRequirements ? (
                                  <div className="flex items-start gap-1">
                                    <FileText className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{passenger.specialRequirements}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </TableCell>
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

          {/* Empty state */}
          {slots.length === 0 && (
            <div className="py-20 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm">本日のフライト予約はありません</p>
            </div>
          )}

          {/* All slots have no reservations */}
          {slots.length > 0 && slots.every(s => s.reservations.length === 0) && (
            <div className="py-20 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm">本日のフライト予約はありません</p>
            </div>
          )}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!selectedPassenger} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              搭乗者情報編集
              <Badge variant="outline" className="font-mono font-normal text-xs">{selectedReservation?.bookingNumber}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              当日のチェックイン業務に使用します。
            </DialogDescription>
          </DialogHeader>

          {selectedPassenger && selectedReservation && (
            <div className="py-4 space-y-5">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedPassenger.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedPassenger.isChild ? '子供' : selectedPassenger.isInfant ? '幼児' : '大人'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">代表者</div>
                  <div className="text-xs font-medium text-slate-700">{selectedReservation.customer?.name || '-'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" />
                  体重 (kg)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="例: 65"
                    className="font-mono text-sm"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    min={0}
                    max={500}
                  />
                  <Button variant="secondary" size="sm" onClick={() => setWeightInput('60')} className="text-xs">
                    平均値
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  安全運航のため、正確な数値を入力してください。
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">特記事項・メモ</Label>
                <Textarea
                  placeholder="アレルギー情報や特別なリクエストなど"
                  className="resize-none text-xs min-h-[80px]"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="h-9 text-sm">キャンセル</Button>
            <Button onClick={handleSaveManifest} className="h-9 text-sm" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存して閉じる'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
