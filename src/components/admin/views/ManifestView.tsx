"use client";

import React, { useState } from 'react';
import { 
  Printer, Calendar as CalendarIcon, FileDown, User as UserIcon, 
  Phone, FileText, CheckCircle2, Scale, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { MOCK_RESERVATIONS, MOCK_SLOTS } from '@/lib/data/mockData';
import { Reservation } from '@/lib/data/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ManifestView = () => {
  const [selectedDate, setSelectedDate] = useState('2025-12-25');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // 編集用の一時ステート
  const [weightInput, setWeightInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const slots = MOCK_SLOTS.filter(s => s.date === selectedDate);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenDetail = (res: Reservation) => {
    setSelectedReservation(res);
    setWeightInput(res.weight?.toString() || '');
    setNotesInput(res.notes || '');
  };

  const handleSaveManifest = () => {
    setIsProcessing(true);
    // モックの遅延
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('搭乗者情報の変更を正常に保存いたしました。');
      setSelectedReservation(null);
    }, 500);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">搭乗名簿</h1>
          <p className="text-xs text-slate-500 mt-1">
            {format(new Date(selectedDate), 'yyyy年 MM月 dd日 (eee)', { locale: ja })} のフライト別搭乗者リスト
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none h-9 text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> 印刷用表示
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 text-xs">
            <FileDown className="w-3.5 h-3.5 mr-1.5" /> CSVエクスポート
          </Button>
        </div>
      </div>

      <div className="space-y-8 print:space-y-6">
        {slots.map(slot => {
          const reservations = MOCK_RESERVATIONS.filter(r => slot.reservations.includes(r.id));
          if (reservations.length === 0) return null;
          
          const totalPax = reservations.reduce((acc, r) => acc + r.pax, 0);

          return (
            <div key={slot.id} className="break-inside-avoid">
               <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="flex items-center justify-center bg-slate-900 text-white font-mono text-sm font-bold w-16 h-8 rounded-lg shadow-sm">
                    {slot.time}
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600">
                      <UserIcon className="w-3 h-3" />
                      <span>{totalPax}名</span>
                    </div>
                  </div>
               </div>
               
               <Card className="shadow-sm border-slate-200 print:border print:shadow-none bg-white overflow-hidden">
                 
                 {/* モバイル用リスト */}
                 <div className="md:hidden divide-y divide-slate-100">
                   {reservations.map(res => (
                     <div 
                       key={res.id} 
                       className="p-4 active:bg-slate-50 transition-all"
                       onClick={() => handleOpenDetail(res)}
                     >
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-indigo-600 tracking-tight">{res.bookingNumber}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                               {res.customerName} <span className="text-[10px] font-normal text-slate-400">様</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                             <Badge variant="secondary" className="font-bold text-[10px] bg-slate-100 text-slate-700 border-transparent">{res.pax}名</Badge>
                             {res.weight && <div className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> CHECKED</div>}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100/50 text-[11px]">
                           <div className="space-y-1">
                              <Label className="text-[9px] text-slate-400 uppercase m-0">Weight</Label>
                              <div className="flex items-center gap-1.5 font-mono">
                                <Scale className="w-3 h-3 text-slate-400" />
                                <span className={res.weight ? "text-slate-900 font-bold" : "text-slate-300"}>
                                  {res.weight ? `${res.weight}kg` : 'Pending'}
                                </span>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[9px] text-slate-400 uppercase m-0">Contact</Label>
                              <div className="flex items-center gap-1.5 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-700">{res.customerPhone}</span>
                              </div>
                           </div>
                        </div>

                        {res.notes && (
                          <div className="mt-3 bg-amber-50/50 text-amber-800 p-2.5 rounded-lg text-[11px] flex items-start gap-2 border border-amber-100/30">
                             <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                             <span className="leading-relaxed">{res.notes}</span>
                          </div>
                        )}
                     </div>
                   ))}
                 </div>

                 {/* デスクトップ用テーブル */}
                 <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="w-[100px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9 pl-6">予約番号</TableHead>
                        <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9">代表者名</TableHead>
                        <TableHead className="w-[60px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9">人数</TableHead>
                        <TableHead className="w-[100px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9">体重合計(推計)</TableHead>
                        <TableHead className="w-[140px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9">電話番号</TableHead>
                        <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-9 pr-6">備考</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map(res => (
                        <TableRow 
                          key={res.id} 
                          className="border-slate-100 hover:bg-slate-50/50 cursor-pointer group transition-colors"
                          onClick={() => handleOpenDetail(res)}
                        >
                          <TableCell className="font-mono text-xs font-medium text-slate-700 py-3 pl-6 group-hover:text-indigo-600 transition-colors">
                            {res.bookingNumber}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-800 py-3">
                            <div className="flex items-center gap-2">
                              {res.customerName}
                              {res.weight && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 py-3">{res.pax}名</TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono py-3">
                            {res.weight ? (
                              <span className="font-semibold text-slate-700">{res.weight}kg</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono py-3 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-300" />
                            {res.customerPhone}
                          </TableCell>
                          <TableCell className="text-[10px] text-slate-500 max-w-xs py-3 pr-6">
                            {res.notes ? (
                              <div className="flex items-start gap-1">
                                <FileText className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{res.notes}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                 </Table>
                 </div>
               </Card>
            </div>
          );
        })}
        {slots.every(s => MOCK_RESERVATIONS.filter(r => s.reservations.includes(r.id)).length === 0) && (
            <div className="py-20 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
               <p className="text-sm">本日のフライト予約はありません</p>
            </div>
        )}
      </div>

      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
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
          
          {selectedReservation && (
            <div className="py-4 space-y-5">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedReservation.customerName} 様</div>
                  <div className="text-xs text-slate-500 mt-0.5">{selectedReservation.pax}名様でのご搭乗</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">コース</div>
                  <div className="text-xs font-medium text-slate-700">{selectedReservation.planName}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" />
                  搭乗者・荷物 総重量 (kg)
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="例: 145" 
                    className="font-mono text-sm"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                  />
                  <Button variant="secondary" size="sm" onClick={() => setWeightInput('120')} className="text-xs">
                    平均値セット
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400">
                  ※安全運航のため、正確な数値を入力してください。
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
            <Button variant="outline" onClick={() => setSelectedReservation(null)} className="h-8 text-xs">キャンセル</Button>
            <Button onClick={handleSaveManifest} className="h-8 text-xs" disabled={isProcessing}>
              {isProcessing ? '保存中...' : '保存して閉じる'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};