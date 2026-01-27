"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, RefreshCcw, Activity, Settings,
  CheckCircle2, AlertCircle, XCircle, RotateCcw, Save,
  CreditCard, History, FileText, Phone, Mail, MapPin, Tag,
  ExternalLink, ChevronRight, Copy, Terminal, Sun, Moon,
  Cloud, Plus, X
} from 'lucide-react';
import { User, AuditLog, Customer, Reservation } from '@/lib/data/types';
import { useCustomers, useLogs, useRefundCandidates, processRefund, RefundCandidate, useReservations } from '@/lib/api/hooks';
import { TableSkeleton, ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Customers View ---
export const CustomersView = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Customer | null>(null);

  const { data, error, isLoading, mutate } = useCustomers({
    page,
    pageSize: 20,
    search: searchTerm || undefined,
  });

  const customers = data?.data ?? [];

  // 選択された顧客の予約履歴を取得
  const { data: reservationsData, isLoading: isLoadingReservations } = useReservations({
    customerId: selectedCustomer?.id,
    pageSize: 50,
  });

  const customerHistory = reservationsData?.data ?? [];

  const handleStartEdit = () => {
    if (selectedCustomer) {
      setEditForm({ ...selectedCustomer });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editForm || !selectedCustomer) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          notes: editForm.notes,
          tags: editForm.tags
        })
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Update failed');
      }

      const result = await response.json();
      setSelectedCustomer(result.data);
      setIsEditing(false);
      setEditForm(null);
      toast.success("顧客情報を正常に更新いたしました。");
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedCustomer(null);
      setIsEditing(false);
      setEditForm(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">顧客管理</h1>
            <p className="text-xs text-slate-500">顧客情報の検索・編集・予約履歴の確認</p>
          </div>
        </div>
        <ErrorAlert
          message="顧客データの取得に失敗しました"
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">顧客管理</h1>
          <p className="text-xs text-slate-500">顧客情報の検索・編集・予約履歴の確認</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <div className="py-4 px-4 sm:px-6 border-b border-slate-100 bg-slate-50/30">
           <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="検索..."
                className="pl-9 h-9 text-xs border-slate-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <>
        {/* モバイル用カードリスト */}
         <div className="md:hidden divide-y divide-slate-100">
           {customers.map(c => (
             <div 
               key={c.id} 
               className="p-4 active:bg-slate-50 transition-colors"
               onClick={() => setSelectedCustomer(c)}
             >
               <div className="flex items-start gap-3 mb-3">
                 <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {c.name.substring(0, 2)}
                    </AvatarFallback>
                 </Avatar>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                     <div className="text-sm font-bold text-slate-900 truncate">{c.name}</div>
                     <Badge variant="outline" className="text-[10px] ml-2 shrink-0 bg-slate-50 font-mono">{c.bookingCount} flights</Badge>
                   </div>
                   <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.email}</div>
                 </div>
               </div>
               
               <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <div className="flex gap-1.5">
                    {(c.tags ?? []).slice(0, 2).map(t => (
                       <Badge key={t} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-transparent px-1.5 py-0">{t}</Badge>
                    ))}
                  </div>
                  <div className="text-[11px] font-bold text-slate-900">
                    <span className="text-slate-400 font-normal mr-1 text-[9px] uppercase tracking-wider">Total</span>
                    <span className="font-mono">¥{c.totalSpent.toLocaleString()}</span>
                  </div>
               </div>
             </div>
           ))}
         </div>

        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">氏名</TableHead>
              <TableHead>連絡先</TableHead>
              <TableHead>言語</TableHead>
              <TableHead>利用実績</TableHead>
              <TableHead className="pr-6">タグ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow 
                key={c.id} 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedCustomer(c)}
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                        {c.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-slate-900">{c.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-700">{c.email}</div>
                  <div className="text-xs text-slate-400 font-mono">{c.phone}</div>
                </TableCell>
                <TableCell className="uppercase text-xs font-medium text-slate-500">{c.lang}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-slate-900">{c.bookingCount}回</div>
                  <div className="text-xs text-slate-400">Total: ¥{c.totalSpent.toLocaleString()}</div>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex gap-1 flex-wrap">
                    {(c.tags ?? []).map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">{t}</Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
          </>
        )}
      </Card>

      <Sheet open={!!selectedCustomer} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col gap-0 overflow-hidden">
          {selectedCustomer && (
            <>
              <SheetHeader className="px-6 py-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm shrink-0">
                      <AvatarFallback className="bg-indigo-600 text-white text-xl">
                        {selectedCustomer.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 w-full pr-4">
                      {isEditing && editForm ? (
                         <div className="space-y-2">
                            <Input 
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="h-8 text-sm font-medium"
                              placeholder="氏名"
                            />
                         </div>
                      ) : (
                        <SheetTitle className="text-xl">{selectedCustomer.name}</SheetTitle>
                      )}
                      
                      <SheetDescription className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{selectedCustomer.id}</span>
                        <Badge variant="outline" className="text-[10px] font-normal border-indigo-200 text-indigo-700 bg-indigo-50">
                          {selectedCustomer.bookingCount > 5 ? 'VIP Customer' : 'Standard'}
                        </Badge>
                      </SheetDescription>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="h-8 text-xs">キャンセル</Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isSaving} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isSaving ? (
                          <><RefreshCcw className="w-3.5 h-3.5 mr-1 animate-spin" />保存中</>
                        ) : (
                          '保存'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleStartEdit} className="h-8 text-xs shrink-0">編集</Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Total Spent</div>
                    <div className="text-lg font-bold text-slate-900">¥{selectedCustomer.totalSpent.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Bookings</div>
                    <div className="text-lg font-bold text-slate-900">{selectedCustomer.bookingCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Avg. Price</div>
                    <div className="text-lg font-bold text-slate-900">¥{Math.round(selectedCustomer.totalSpent / Math.max(selectedCustomer.bookingCount, 1)).toLocaleString()}</div>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      基本情報
                    </h3>
                    
                    {isEditing && editForm ? (
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">メールアドレス</Label>
                          <Input 
                            value={editForm.email} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">電話番号</Label>
                          <Input 
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="h-9"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-slate-700">{selectedCustomer.email}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-slate-400 hover:text-slate-600">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-slate-700">{selectedCustomer.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* History */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" />
                      予約履歴
                    </h3>
                    <div className="space-y-3">
                      {isLoadingReservations ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          <RefreshCcw className="w-4 h-4 animate-spin mx-auto mb-2" />
                          読み込み中...
                        </div>
                      ) : customerHistory.length > 0 ? (
                        customerHistory.map(res => (
                          <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{res.reservationDate || res.date}</span>
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-white">
                                  {res.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500">{res.planName || res.course?.title || '-'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono font-medium">¥{(res.totalPrice || res.price || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400">{res.pax}名</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          予約履歴はありません
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />

                  {/* Memo */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      管理者メモ
                    </h3>
                    {isEditing && editForm ? (
                       <Textarea 
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        placeholder="顧客に関する特記事項を入力..." 
                        className="min-h-[100px] text-sm resize-none bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400"
                      />
                    ) : (
                      <div className="p-3 rounded-md bg-yellow-50/30 border border-yellow-100 text-sm text-slate-700 min-h-[60px]">
                        {selectedCustomer.notes || 'メモはありません'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// --- Refunds View ---
export const RefundsView = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RefundCandidate | null>(null);
  const [refundReason, setRefundReason] = useState<'customer_request' | 'weather' | 'mechanical' | 'operator_cancel' | 'other'>('customer_request');
  const [refundReasonDetail, setRefundReasonDetail] = useState('');

  const { refundCandidates, error, isLoading, mutate } = useRefundCandidates();

  const handleRefund = async (candidate: RefundCandidate) => {
    if (!candidate.payment) {
      toast.error('支払い情報が見つかりません');
      return;
    }

    setProcessingId(candidate.id);

    try {
      await processRefund(candidate.id, {
        reason: refundReason,
        reasonDetail: refundReasonDetail || undefined,
      });
      toast.success(`${candidate.bookingNumber} の返金処理が完了しました`);
      mutate();
      setSelectedCandidate(null);
      setRefundReason('customer_request');
      setRefundReasonDetail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '返金処理に失敗しました';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const reasonLabels: Record<string, string> = {
    customer_request: 'お客様都合',
    weather: '悪天候',
    mechanical: '機材整備',
    operator_cancel: '運航者都合',
    other: 'その他',
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">未返金管理</h1>
            <p className="text-xs text-slate-500">運休・キャンセル後の返金漏れ防止リスト</p>
          </div>
        </div>
        <ErrorAlert
          message="返金データの取得に失敗しました"
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">未返金管理</h1>
          <p className="text-xs text-slate-500">運休・キャンセル後の返金漏れ防止リスト</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => mutate()}>
          <RefreshCcw className="w-3.5 h-3.5 mr-2" /> 更新
        </Button>
      </div>

      {refundCandidates.length > 0 && (
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-sm">未処理の返金が {refundCandidates.length} 件あります</h3>
            <p className="text-[11px] text-red-700/80 mt-1 leading-relaxed max-w-2xl">
              これらの予約は運休またはキャンセルされましたが、まだ返金処理が完了していません。
              Stripeダッシュボードまたは本システムから速やかに返金処理を実行してください。
            </p>
          </div>
        </div>
      )}

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <>
         {/* モバイル用カードリスト */}
         <div className="md:hidden divide-y divide-slate-100">
           {refundCandidates.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm font-medium">未処理の返金はありません</span>
             </div>
           ) : (
             refundCandidates.map(res => (
               <div key={res.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                 <div className="flex justify-between items-start">
                   <div className="space-y-1">
                     <div className="font-mono font-bold text-sm text-slate-900">{res.bookingNumber}</div>
                     <Badge variant="outline" className="text-[10px] font-normal bg-slate-100 text-slate-500 border-slate-200">
                       キャンセル
                     </Badge>
                   </div>
                   <div className="text-right">
                     <div className="font-bold font-mono text-slate-900">
                       {res.payment?.amount ? `¥${res.payment.amount.toLocaleString()}` : '-'}
                     </div>
                     <div className="text-xs text-red-600 font-medium">未返金</div>
                   </div>
                 </div>

                 <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                   <div>
                     <span className="text-slate-400 block text-[10px] uppercase">Flight Date</span>
                     <span className="font-medium">{res.reservationDate} {res.reservationTime}</span>
                   </div>
                   <div>
                     <span className="text-slate-400 block text-[10px] uppercase">Customer</span>
                     <span className="font-medium">{res.customer?.name ?? '-'}</span>
                   </div>
                 </div>

                 <Button
                   size="sm"
                   variant="outline"
                   className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                   onClick={() => setSelectedCandidate(res)}
                   disabled={processingId === res.id}
                 >
                   {processingId === res.id ? (
                     <><RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> 処理中...</>
                   ) : (
                     <>返金処理</>
                   )}
                 </Button>
               </div>
             ))
           )}
         </div>

         <div className="hidden md:block">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="pl-6">予約番号</TableHead>
              <TableHead>運航予定日</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right pr-6">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refundCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span className="font-medium">未処理返金はありません</span>
                    <span className="text-xs text-slate-400">すべて正常に処理されています</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              refundCandidates.map(res => (
                <TableRow key={res.id}>
                  <TableCell className="font-mono font-medium pl-6">{res.bookingNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-900">{res.reservationDate}</div>
                    <div className="text-xs text-slate-500 font-mono">{res.reservationTime}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{res.customer?.name ?? '-'}</TableCell>
                  <TableCell className="font-bold font-mono text-slate-900">
                    {res.payment?.amount ? `¥${res.payment.amount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal bg-slate-100 text-slate-500 border-slate-200">
                      キャンセル
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setSelectedCandidate(res)}
                      disabled={processingId === res.id}
                    >
                      {processingId === res.id ? (
                        <><RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> 処理中...</>
                      ) : (
                        <>返金処理</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
          </>
        )}
      </Card>

      {/* Refund Confirmation Sheet */}
      <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <SheetContent className="w-full sm:w-[480px] p-0 flex flex-col gap-0">
          {selectedCandidate && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <CreditCard className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-slate-900">返金処理</SheetTitle>
                    <SheetDescription className="font-mono text-xs mt-0.5">{selectedCandidate.bookingNumber}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">顧客名</span>
                      <span className="font-medium text-slate-900">{selectedCandidate.customer?.name ?? '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">メール</span>
                      <span className="font-medium text-slate-900">{selectedCandidate.customer?.email ?? '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">運航予定日</span>
                      <span className="font-medium text-slate-900">{selectedCandidate.reservationDate} {selectedCandidate.reservationTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">コース</span>
                      <span className="font-medium text-slate-900">{selectedCandidate.course?.title ?? '-'}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">返金金額</span>
                    <span className="text-xl font-bold text-red-600">
                      {selectedCandidate.payment?.amount ? `¥${selectedCandidate.payment.amount.toLocaleString()}` : '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">返金理由</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(reasonLabels).map(([key, label]) => (
                        <Button
                          key={key}
                          type="button"
                          variant={refundReason === key ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-9 text-xs",
                            refundReason === key && "bg-indigo-600 hover:bg-indigo-700"
                          )}
                          onClick={() => setRefundReason(key as typeof refundReason)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">詳細メモ (任意)</Label>
                    <Textarea
                      value={refundReasonDetail}
                      onChange={(e) => setRefundReasonDetail(e.target.value)}
                      placeholder="返金に関する補足情報があれば入力..."
                      className="min-h-[80px] text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-slate-50 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  キャンセル
                </Button>
                <Button
                  className="flex-1 h-10 text-sm bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleRefund(selectedCandidate)}
                  disabled={processingId === selectedCandidate.id}
                >
                  {processingId === selectedCandidate.id ? (
                    <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> 処理中...</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" /> 返金を実行</>
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// --- Logs View ---
export const LogsView = () => {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, error, isLoading, mutate } = useLogs({
    page,
    pageSize: 50,
  });

  const logs = data?.data ?? [];

  // Helper to get status icon
  const getStatusIcon = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Helper to get status display
  const getStatusDisplay = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </div>
        );
      case 'failure':
        return (
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <XCircle className="w-3.5 h-3.5" /> Failure
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Warning
          </div>
        );
      case 'info':
        return (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Info
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">連携・ログ</h1>
            <p className="text-sm text-slate-500">システム連携ログと操作履歴</p>
          </div>
        </div>
        <ErrorAlert
          message="ログデータの取得に失敗しました"
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">連携・ログ</h1>
          <p className="text-sm text-slate-500">システム連携ログと操作履歴</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => mutate()}>
          <RefreshCcw className="w-3.5 h-3.5 mr-2" /> ログ更新
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="stripe">Stripe連携</TabsTrigger>
          <TabsTrigger value="crm">CRM同期</TabsTrigger>
          <TabsTrigger value="operation">操作ログ</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            {isLoading ? (
              <TableSkeleton rows={10} columns={5} />
            ) : (
              <>
            {/* モバイル用カードリスト */}
            <div className="md:hidden divide-y divide-slate-100">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-4 active:bg-slate-50 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="font-bold text-xs text-slate-900">{log.action}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{log.createdAt}</span>
                  </div>

                  <div className="text-xs text-slate-600 line-clamp-2 mb-2">
                     {log.message || '-'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-slate-50 border-slate-200 text-slate-500">
                      {log.logType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[180px]">日時</TableHead>
                  <TableHead className="w-[100px]">種別</TableHead>
                  <TableHead className="w-[200px]">アクション</TableHead>
                  <TableHead className="w-[100px]">状態</TableHead>
                  <TableHead>メッセージ</TableHead>
                  <TableHead className="pr-6 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-mono text-xs text-slate-500 pl-6">{log.createdAt}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal text-slate-500 bg-slate-50">
                        {log.logType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs text-slate-700">{log.action}</TableCell>
                    <TableCell>
                      {getStatusDisplay(log.status)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 truncate max-w-[300px]">{log.message || '-'}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 inline-block" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="w-full sm:w-[600px] p-0 flex flex-col gap-0">
          {selectedLog && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2">
                   {selectedLog.status === 'success' ? (
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    ) : selectedLog.status === 'failure' ? (
                      <div className="p-2 bg-red-100 rounded-full">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                    ) : selectedLog.status === 'info' ? (
                      <div className="p-2 bg-blue-100 rounded-full">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-100 rounded-full">
                         <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <SheetTitle className="text-base font-bold text-slate-900">{selectedLog.action}</SheetTitle>
                      <SheetDescription className="font-mono text-xs mt-0.5">{selectedLog.id}</SheetDescription>
                    </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500 uppercase tracking-wider">Type</Label>
                      <div className="font-medium text-sm text-slate-900">{selectedLog.logType.toUpperCase()}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500 uppercase tracking-wider">Timestamp</Label>
                      <div className="font-mono text-sm text-slate-900">{selectedLog.createdAt}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Message</Label>
                    <div className={cn(
                      "p-3 rounded-md text-sm border",
                      selectedLog.status === 'failure' ? "bg-red-50 border-red-100 text-red-700" : "bg-slate-50 border-slate-100 text-slate-700"
                    )}>
                      {selectedLog.message || '-'}
                    </div>
                  </div>

                  {/* Payload Data from metadata */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> Request Payload
                    </Label>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify({
                        resource: selectedLog.action.split(' ')[0],
                        timestamp: selectedLog.createdAt,
                        targetTable: selectedLog.targetTable,
                        targetId: selectedLog.targetId,
                        user: selectedLog.userEmail || 'system'
                      }, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                       <Terminal className="w-3.5 h-3.5" /> Response Data
                    </Label>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify({
                         status: selectedLog.status === 'success' ? 200 : selectedLog.status === 'failure' ? 500 : 200,
                         message: selectedLog.message,
                         oldValues: selectedLog.oldValues,
                         newValues: selectedLog.newValues
                      }, null, 2)}</pre>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white">
                  <Copy className="w-3.5 h-3.5 mr-2" /> JSONをコピー
                </Button>
                {selectedLog.status === 'failure' && (
                  <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> 再試行
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// --- Settings View ---
export const SettingsView = () => {
  // デフォルトで有効な時間帯
  const [activeHours, setActiveHours] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // その他設定のState
  const [holidayMode, setHolidayMode] = useState(false);
  const [policyJa, setPolicyJa] = useState("");
  const [policyEn, setPolicyEn] = useState("");

  // 当日連絡先設定
  const [contactPhone, setContactPhone] = useState("");
  const [contactHours, setContactHours] = useState("");

  // 天候判断設定
  const [weatherDecisionTime, setWeatherDecisionTime] = useState("08:00");
  const [weatherNotificationEnabled, setWeatherNotificationEnabled] = useState(true);

  // 管理者通知設定
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [newEmail, setNewEmail] = useState("");

  // 9:00 から 19:00 までの時間枠生成 (30分刻み)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
  ];

  // 設定をDBから読み込む
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings?keys=active_hours,holiday_mode,cancellation_policy_ja,cancellation_policy_en,contact_phone,contact_hours,weather_decision_time,weather_notification_enabled,notification_emails,notification_enabled');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};

        // active_hours（配列）
        if (data.active_hours && Array.isArray(data.active_hours)) {
          setActiveHours(data.active_hours);
        } else {
          // デフォルト値
          setActiveHours(['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']);
        }

        // holiday_mode（boolean）
        if (typeof data.holiday_mode === 'boolean') {
          setHolidayMode(data.holiday_mode);
        }

        // cancellation policies
        if (data.cancellation_policy_ja) {
          setPolicyJa(data.cancellation_policy_ja);
        } else {
          setPolicyJa("前日50%、当日100%のキャンセル料が発生します。悪天候による運休の場合は全額返金いたします。");
        }

        if (data.cancellation_policy_en) {
          setPolicyEn(data.cancellation_policy_en);
        } else {
          setPolicyEn("Cancellation fee: 50% for previous day, 100% for same day. Full refund for cancellations due to bad weather.");
        }

        // 当日連絡先設定
        if (data.contact_phone) {
          setContactPhone(data.contact_phone);
        }
        if (data.contact_hours) {
          setContactHours(data.contact_hours);
        }

        // 天候判断設定
        if (data.weather_decision_time) {
          setWeatherDecisionTime(data.weather_decision_time);
        }
        if (typeof data.weather_notification_enabled === 'boolean') {
          setWeatherNotificationEnabled(data.weather_notification_enabled);
        }

        // 管理者通知設定
        if (Array.isArray(data.notification_emails)) {
          setNotificationEmails(data.notification_emails);
        }
        if (typeof data.notification_enabled === 'boolean') {
          setNotificationEnabled(data.notification_enabled);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('設定の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleHour = (time: string) => {
    if (activeHours.includes(time)) {
      setActiveHours(activeHours.filter(h => h !== time));
    } else {
      setActiveHours([...activeHours, time].sort());
    }
  };

  // メールアドレス追加
  const handleAddEmail = () => {
    const email = newEmail.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('有効なメールアドレスを入力してください');
      return;
    }
    if (notificationEmails.includes(email)) {
      toast.error('このメールアドレスは既に追加されています');
      return;
    }
    setNotificationEmails([...notificationEmails, email]);
    setNewEmail("");
  };

  // メールアドレス削除
  const handleRemoveEmail = (email: string) => {
    setNotificationEmails(notificationEmails.filter(e => e !== email));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            active_hours: activeHours,
            holiday_mode: holidayMode,
            cancellation_policy_ja: policyJa,
            cancellation_policy_en: policyEn,
            contact_phone: contactPhone,
            contact_hours: contactHours,
            weather_decision_time: weatherDecisionTime,
            weather_notification_enabled: weatherNotificationEnabled,
            notification_emails: notificationEmails,
            notification_enabled: notificationEnabled,
          }
        })
      });

      if (response.ok) {
        toast.success("システム設定を正常に保存いたしました。変更は即座に反映されます。");
      } else {
        const result = await response.json();
        toast.error(result.error || '設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">設定</h1>
            <p className="text-xs text-slate-500">システム設定・マスタ管理・運用時間設定</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
          >
            {isSaving ? (
              <><RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> 保存中...</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-2" /> 設定を保存</>
            )}
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">予約可能時間枠 (Slots Config)</CardTitle>
                  <CardDescription className="text-[10px]">日没時間や機材運用の都合に合わせて、予約を受け付ける時間帯をオンオフできます。</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-7 lg:grid-cols-9 gap-3">
                  {timeSlots.map((time) => {
                    const isActive = activeHours.includes(time);
                    const hour = parseInt(time);
                    const isMorning = hour < 12;
                    const isEvening = hour >= 16;
                    
                    return (
                      <button
                        key={time}
                        onClick={() => toggleHour(time)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 active:scale-95",
                          isActive 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-sm font-bold tracking-tight font-mono">{time}</span>
                        
                        {/* 時間帯アイコン (装飾) */}
                        <div className="mt-1.5 opacity-80">
                          {isMorning ? (
                            <Sun className={cn("w-3.5 h-3.5", isActive ? "text-indigo-100" : "text-amber-400/60")} />
                          ) : isEvening ? (
                            <Moon className={cn("w-3.5 h-3.5", isActive ? "text-indigo-100" : "text-blue-400/60")} />
                          ) : (
                            <div className={cn("w-3.5 h-3.5 rounded-full border-2", isActive ? "border-indigo-100" : "border-slate-200")} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                      現在、{activeHours.length}個の時間枠が有効です
                    </p>
                    <p className="text-xs text-slate-500">
                      OFFにした時間帯は、予約カレンダー上で「受付不可」として表示され、新規予約ができなくなります。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>臨時休業設定</CardTitle>
              <CardDescription>特定日の休業や緊急停止</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between py-2">
                 <div className="space-y-0.5">
                   <Label htmlFor="holiday-mode">全枠停止 (臨時休業)</Label>
                   <p className="text-xs text-slate-500">すべての新規予約受付を一時停止します</p>
                 </div>
                 <Switch 
                    id="holiday-mode" 
                    checked={holidayMode}
                    onCheckedChange={setHolidayMode}
                  />
               </div>
             </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>キャンセルポリシー要約</CardTitle>
              <CardDescription>予約画面やメールに表示される文言</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>日本語</Label>
                <Textarea 
                  className="h-20" 
                  value={policyJa}
                  onChange={(e) => setPolicyJa(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>English</Label>
                <Textarea 
                  className="h-20" 
                  value={policyEn}
                  onChange={(e) => setPolicyEn(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSaveSettings} disabled={isSaving || isLoading}>
                {isSaving ? (
                  <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> 保存</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 当日連絡先設定カード */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                当日連絡先
              </CardTitle>
              <CardDescription>お客様への案内に表示される連絡先情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>電話番号</Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="03-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label>受付時間</Label>
                <Input
                  value={contactHours}
                  onChange={(e) => setContactHours(e.target.value)}
                  placeholder="9:00-18:00 (土日祝除く)"
                />
              </div>
            </CardContent>
          </Card>

          {/* 天候判断設定カード */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                天候判断設定
              </CardTitle>
              <CardDescription>フライト当日の天候判断に関する設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>天候判断時刻</Label>
                  <p className="text-xs text-slate-500">この時刻までに運航可否を判断します</p>
                </div>
                <Select value={weatherDecisionTime} onValueChange={setWeatherDecisionTime}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00</SelectItem>
                    <SelectItem value="07:00">07:00</SelectItem>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>天候通知</Label>
                  <p className="text-xs text-slate-500">悪天候時に予約者へ自動通知</p>
                </div>
                <Switch
                  checked={weatherNotificationEnabled}
                  onCheckedChange={setWeatherNotificationEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* 管理者通知設定カード */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                管理者通知設定
              </CardTitle>
              <CardDescription>予約・キャンセル等の通知先メールアドレス</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>管理者通知</Label>
                  <p className="text-xs text-slate-500">新規予約時にメール通知を送信</p>
                </div>
                <Switch
                  checked={notificationEnabled}
                  onCheckedChange={setNotificationEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>通知先メールアドレス</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@example.com"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                  />
                  <Button onClick={handleAddEmail} variant="outline" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {notificationEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {notificationEmails.map(email => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1 pr-1">
                        {email}
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {notificationEmails.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2">通知先メールアドレスが登録されていません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};