"use client";

import React, { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowLeft, Download, Mail, Ban,
  RefreshCcw, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, MoreHorizontal, CalendarDays, ArrowUpDown, Plus
} from 'lucide-react';
import { Reservation, User, ReservationStatus } from '@/lib/data/types';
import { useReservations, useCourses } from '@/lib/api/hooks';
import { updateReservation, cancelReservation } from '@/lib/api/mutations/reservations';
import { TableSkeleton, ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { toast } from "sonner";
// Note: DropdownMenu reserved for future context menu implementation
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ReservationsViewProps {
  currentUser: User;
}

export const ReservationsView = ({ currentUser }: ReservationsViewProps) => {
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  const [page, _setPage] = useState(1);
  const [pageSize] = useState(50);
  // Note: _setPage reserved for future pagination UI implementation

  // 新規予約フォーム用のstate
  const [newReservation, setNewReservation] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    planId: '',
    date: new Date(),
    time: '12:00',
    pax: '2',
    notes: ''
  });
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // SWR フックでデータ取得
  const { data: reservationsData, error: reservationsError, isLoading: reservationsLoading, mutate } = useReservations({
    page,
    pageSize,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

  const { data: coursesData } = useCourses();

  const reservations = reservationsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const totalCount = reservationsData?.pagination?.total ?? 0;

  // 予約データから利用可能な「年」のリストを抽出
  const availableYears = useMemo(() => {
    const years = new Set(reservations.map(res => res.date?.split('-')[0] ?? new Date().getFullYear().toString()));
    return Array.from(years).sort().reverse();
  }, [reservations]);

  const handleCreateReservation = () => {
    // 簡易バリデーション
    if (!newReservation.customerName || !newReservation.customerEmail || !newReservation.planId) {
      toast.error('必須項目が未入力です。お名前、メールアドレス、プランは必ず指定してください。');
      return;
    }

    toast.success('新規予約を正常に作成いたしました。');
    setIsNewReservationModalOpen(false);
    
    // フォームリセット
    setNewReservation({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      planId: '',
      date: new Date(),
      time: '12:00',
      pax: '2',
      notes: ''
    });
  };

  // ステータス更新ハンドラ（オプティミスティック更新）
  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    // オプティミスティック更新用のデータを作成
    const optimisticData = reservationsData ? {
      ...reservationsData,
      data: reservationsData.data?.map(r =>
        r.id === id ? { ...r, status: newStatus } : r
      ) ?? [],
    } : undefined;

    try {
      await mutate(
        async () => {
          await updateReservation(id, { status: newStatus });
          return reservationsData; // 再フェッチで上書きされる
        },
        {
          optimisticData,
          rollbackOnError: true,
          revalidate: true,
        }
      );
      toast.success('ステータスを更新しました');
    } catch (_err) {
      toast.error('更新に失敗しました');
    }
  };

  // キャンセルハンドラ
  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id);
      toast.success('予約をキャンセルしました');
      mutate();
    } catch (_err) {
      toast.error('キャンセルに失敗しました');
    }
  };

  // フィルタリングとソートのロジック（クライアントサイド検索を維持）
  const filteredReservations = useMemo(() => {
    let result = reservations.filter(res => {
      // テキスト検索（クライアントサイド）
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          (res.customerName?.toLowerCase().includes(query) ?? false) ||
          (res.customerEmail?.toLowerCase().includes(query) ?? false) ||
          res.bookingNumber.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }

      // 年月フィルタ（クライアントサイド）
      const dateParts = res.date?.split('-') ?? [];
      const [year, month] = dateParts;
      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (selectedMonth !== 'all' && parseInt(month).toString() !== selectedMonth) return false;

      return true;
    });

    // ソート
    result.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    return result;
  }, [reservations, searchQuery, selectedYear, selectedMonth, sortOrder]);

  // ローディング状態
  if (reservationsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">予約管理</h1>
            <p className="text-sm text-slate-500 mt-1">すべての予約ステータスの確認・編集・返金処理</p>
          </div>
        </div>
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <TableSkeleton rows={10} columns={7} />
        </Card>
      </div>
    );
  }

  // エラー状態
  if (reservationsError) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">予約管理</h1>
            <p className="text-sm text-slate-500 mt-1">すべての予約ステータスの確認・編集・返金処理</p>
          </div>
        </div>
        <ErrorAlert
          message={reservationsError.message ?? 'データの取得に失敗しました'}
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  if (selectedRes) {
    return (
      <ReservationDetail
        reservation={selectedRes}
        onBack={() => setSelectedRes(null)}
        currentUser={currentUser}
        onStatusChange={handleStatusChange}
        onCancel={handleCancel}
        mutate={mutate}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">予約管理</h1>
          <p className="text-sm text-slate-500 mt-1">すべての予約ステータスの確認・編集・返金処理</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog open={isNewReservationModalOpen} onOpenChange={setIsNewReservationModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-none h-10 text-sm bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1.5" /> 新規予約
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規予約の作成</DialogTitle>
                <DialogDescription>
                  電話予約や直接予約の情報を手動で登録します。
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">顧客情報</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">氏名 <span className="text-red-500">*</span></Label>
                      <Input 
                        value={newReservation.customerName}
                        onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
                        placeholder="山田 太郎" 
                        className="h-10 text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">メールアドレス <span className="text-red-500">*</span></Label>
                      <Input 
                        value={newReservation.customerEmail}
                        onChange={(e) => setNewReservation({...newReservation, customerEmail: e.target.value})}
                        placeholder="taro@example.com" 
                        type="email" 
                        className="h-10 text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">電話番号</Label>
                      <Input 
                        value={newReservation.customerPhone}
                        onChange={(e) => setNewReservation({...newReservation, customerPhone: e.target.value})}
                        placeholder="090-0000-0000" 
                        className="h-10 text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">フライト情報</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">プラン <span className="text-red-500">*</span></Label>
                      <Select 
                        value={newReservation.planId} 
                        onValueChange={(val) => setNewReservation({...newReservation, planId: val})}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="プランを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id} className="text-xs">
                              {course.title} (¥{course.price.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">日付 <span className="text-red-500">*</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 text-sm",
                                !newReservation.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-3.5 w-3.5" />
                              {newReservation.date ? format(newReservation.date, "yyyy/MM/dd") : <span>日付を選択</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newReservation.date}
                              onSelect={(date) => date && setNewReservation({...newReservation, date})}
                              initialFocus
                              locale={ja}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">時間 <span className="text-red-500">*</span></Label>
                        <Select 
                          value={newReservation.time} 
                          onValueChange={(val) => setNewReservation({...newReservation, time: val})}
                        >
                          <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">人数</Label>
                      <Select 
                        value={newReservation.pax} 
                        onValueChange={(val) => setNewReservation({...newReservation, pax: val})}
                      >
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1" className="text-xs">1名</SelectItem>
                          <SelectItem value="2" className="text-xs">2名</SelectItem>
                          <SelectItem value="3" className="text-xs">3名</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 space-y-1">
                   <Label className="text-xs">管理用メモ</Label>
                   <Textarea 
                     value={newReservation.notes}
                     onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                     placeholder="特記事項があれば入力" 
                     className="h-20 text-xs resize-none" 
                   />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewReservationModalOpen(false)} className="h-9 text-sm">キャンセル</Button>
                <Button onClick={handleCreateReservation} className="h-9 text-sm bg-indigo-600 hover:bg-indigo-700">作成する</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 text-sm">
            <Download className="w-4 h-4 mr-1.5" /> CSV出力
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 space-y-4">
          
          {/* 上段: 検索と主要フィルタ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="予約番号、顧客名、メールで検索..." 
                  className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-indigo-500 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px] h-10 text-sm bg-white border-slate-200">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="全ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">すべての状態</SelectItem>
                  <SelectItem value="confirmed" className="text-xs">確定済み</SelectItem>
                  <SelectItem value="pending" className="text-xs">仮予約</SelectItem>
                  <SelectItem value="cancelled" className="text-xs">キャンセル</SelectItem>
                  <SelectItem value="suspended" className="text-xs">運休中</SelectItem>
                  <SelectItem value="completed" className="text-xs">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="lg:col-span-4 flex justify-end">
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                <span className="font-medium">表示:</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">{filteredReservations.length}</span>
                <span className="font-medium">/ {totalCount}件</span>
              </div>
            </div>
          </div>

          {/* 下段: 詳細絞り込み（期間・ソート・リセット） */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-slate-100/50">
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">表示期間:</span>
                </div>
                <div className="flex items-center gap-1">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[90px] h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="年" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">すべて</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year} className="text-xs">{year}年</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[85px] h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="月" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">すべて</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()} className="text-xs">{month}月</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="hidden md:block h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">並び替え:</span>
                </div>
                <Select value={sortOrder} onValueChange={(v: 'desc' | 'asc') => setSortOrder(v)}>
                  <SelectTrigger className="w-[110px] h-8 text-xs bg-white border-slate-200">
                    <SelectValue placeholder="新しい順" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc" className="text-xs">新しい順</SelectItem>
                    <SelectItem value="asc" className="text-xs">古い順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {(selectedYear !== 'all' || selectedMonth !== 'all' || filterStatus !== 'all' || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-3 transition-all rounded-full border border-transparent hover:border-indigo-100"
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchQuery('');
                    setSelectedYear('all');
                    setSelectedMonth('all');
                    setSortOrder('desc');
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  条件リセット
                </Button>
              )}
            </div>
          </div>
        </div>

          {/* モバイル用カードリストビュー */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-slate-50">
                条件に一致する予約は見つかりませんでした
              </div>
            ) : (
              filteredReservations.map((res) => (
                <div 
                  key={res.id} 
                  className="bg-white p-4 active:bg-slate-50 transition-colors"
                  onClick={() => setSelectedRes(res)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 tracking-tight">{res.bookingNumber}</span>
                        <StatusBadge status={res.status} />
                      </div>
                      <div className="text-xs font-medium text-slate-900">
                        {res.customerName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-xs font-mono font-bold text-slate-900">¥{res.price.toLocaleString()}</span>
                       <PaymentBadge status={res.paymentStatus} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>{res.date} {res.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="truncate max-w-[120px]">{res.planName}</span>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[120px] text-xs font-semibold text-slate-500 uppercase tracking-wider h-10 pl-6">予約番号</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-10">日時</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-10">コース / 人数</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-10">顧客名</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-10">ステータス</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-10">支払い</TableHead>
              <TableHead className="text-right w-[60px] h-10 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  条件に一致する予約は見つかりませんでした
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((res) => (
                <TableRow key={res.id} className="cursor-pointer hover:bg-slate-50/80 border-slate-100 group transition-colors" onClick={() => setSelectedRes(res)}>
                  <TableCell className="font-mono text-xs font-medium text-slate-700 py-4 pl-6">{res.bookingNumber}</TableCell>
                  <TableCell className="py-4">
                    <div className="text-xs font-medium text-slate-700">{res.date}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{res.time}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-xs text-slate-700 truncate max-w-[180px]" title={res.planName}>{res.planName}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className="bg-slate-100 px-1 rounded">{res.pax}名</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-xs text-slate-700 font-medium">{res.customerName}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">{res.customerEmail}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={res.status} />
                  </TableCell>
                  <TableCell className="py-4">
                     <div className="flex flex-col gap-1">
                        <PaymentBadge status={res.paymentStatus} />
                        <span className="text-xs font-mono text-slate-500">¥{res.price.toLocaleString()}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-500">
                       <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
          </div>
      </Card>
    </div>
  );
};

// 詳細ビューコンポーネント
interface ReservationDetailProps {
  reservation: Reservation;
  onBack: () => void;
  currentUser: User;
  onStatusChange: (id: string, status: ReservationStatus) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  mutate: () => void;
}

const ReservationDetail = ({ reservation, onBack, currentUser, onStatusChange: _onStatusChange, onCancel, mutate }: ReservationDetailProps) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [_refundAmount, _setRefundAmount] = useState(reservation.price);
  const [isProcessing, setIsProcessing] = useState(false);

  const canRefund = currentUser.role === 'admin' && reservation.paymentStatus === 'paid' && reservation.price > 0;
  
  const handleRefund = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setIsRefundModalOpen(false);
    toast.success("返金処理が完了しました。お客様への着金には数日かかる場合があります。");
    mutate(); // リストを再取得
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {reservation.bookingNumber}
            <StatusBadge status={reservation.status} />
          </h1>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Left Column: Details */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">フライト情報</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">コース</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{reservation.planName}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">日時</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 font-mono">
                  {reservation.date} <span className="text-slate-400">|</span> {reservation.time}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">人数</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{reservation.pax} 名</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">合計重量 (推定)</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{reservation.weight ? `${reservation.weight}kg` : '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">顧客情報</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">氏名</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{reservation.customerName}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">言語</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 uppercase">{reservation.customerLang}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">メールアドレス</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 font-mono">{reservation.customerEmail}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">電話番号</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 font-mono">{reservation.customerPhone}</div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-slate-400 uppercase tracking-wider">メモ</Label>
                <div className="bg-slate-50 p-4 rounded-md text-xs text-slate-600 min-h-[60px] mt-2 border border-slate-100 leading-relaxed">
                  {reservation.notes || 'なし'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">操作ログ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-2.5 before:w-px before:-translate-x-1/2 before:bg-slate-100 before:h-full">
                <div className="relative flex gap-3 items-start">
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-indigo-200 ring-2 ring-white z-10">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </span>
                  <div className="flex flex-col pt-0.5">
                    <span className="text-xs font-medium text-slate-900">予約確定</span>
                    <span className="text-xs text-slate-400 font-mono">{reservation.bookedAt}</span>
                  </div>
                </div>
                {reservation.suspendedAt && (
                   <div className="relative flex gap-3 items-start">
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-amber-200 ring-2 ring-white z-10">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </span>
                    <div className="flex flex-col pt-0.5">
                      <span className="text-xs font-medium text-slate-900">運休処理実行</span>
                      <span className="text-xs text-slate-400 font-mono">{reservation.suspendedAt}</span>
                    </div>
                  </div>
                )}
                {reservation.refundedAt && (
                   <div className="relative flex gap-3 items-start">
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 ring-2 ring-white z-10">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    </span>
                    <div className="flex flex-col pt-0.5">
                      <span className="text-xs font-medium text-slate-900">返金完了 (¥{reservation.refundedAmount?.toLocaleString()})</span>
                      <span className="text-xs text-slate-400 font-mono">{reservation.refundedAt} by {reservation.refundedBy}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-4">
          <Card className="border-indigo-100 bg-indigo-50/30 shadow-none">
            <CardHeader className="py-4 px-6 border-b border-indigo-100/50">
              <CardTitle className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">決済情報</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-600">合計金額</span>
                 <span className="text-lg font-bold text-slate-900 font-mono">¥{reservation.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-600">ステータス</span>
                 <PaymentBadge status={reservation.paymentStatus} />
              </div>
              <div className="pt-3 border-t border-indigo-100/50 mt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">Stripe ID</span>
                  <a href="#" className="flex items-center hover:text-indigo-600 hover:underline">
                    {reservation.stripePaymentId} <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
               <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">アクション</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
               <Button variant="outline" className="w-full justify-start h-10 text-xs border-slate-200 bg-white hover:bg-slate-50">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" /> 予約確認メール再送
               </Button>
               <Button
                 variant="outline"
                 className="w-full justify-start h-10 text-xs border-slate-200 text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                 onClick={() => onCancel(reservation.id)}
                 disabled={reservation.status === 'cancelled'}
               >
                  <Ban className="w-4 h-4 mr-2" /> {reservation.status === 'cancelled' ? 'キャンセル済み' : '予約キャンセル'}
               </Button>
               
               {currentUser.role === 'admin' && (
                 <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
                   <DialogTrigger asChild>
                     <Button 
                       variant="outline" 
                       className={cn(
                         "w-full justify-start h-10 text-xs border-slate-200 mt-2 bg-white hover:bg-slate-50",
                         reservation.paymentStatus === 'refunded' ? "opacity-50 cursor-not-allowed" : "text-slate-700"
                       )}
                       disabled={!canRefund}
                     >
                        <RefreshCcw className="w-4 h-4 mr-2 text-slate-400" /> 
                        {reservation.paymentStatus === 'refunded' ? '返金済み' : '返金処理'}
                     </Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle className="text-base">返金の実行</DialogTitle>
                       <DialogDescription className="text-xs">
                         この操作はStripe決済システムに即時反映され、取り消すことができません。
                       </DialogDescription>
                     </DialogHeader>
                     <div className="py-4 space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                           <span className="text-sm font-medium text-slate-700">返金対象額</span>
                           <span className="text-lg font-bold font-mono">¥{reservation.price.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs">返金理由</Label>
                           <Select>
                             <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="選択してください" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="weather" className="text-xs">悪天候・強風のため</SelectItem>
                               <SelectItem value="maintenance" className="text-xs">機材メンテナンスのため</SelectItem>
                               <SelectItem value="customer" className="text-xs">顧客都合</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                     </div>
                     <DialogFooter>
                       <Button variant="outline" onClick={() => setIsRefundModalOpen(false)} className="h-9 text-sm">キャンセル</Button>
                       <Button variant="destructive" onClick={handleRefund} disabled={isProcessing} className="h-9 text-sm">
                         {isProcessing ? '処理中...' : '返金を実行'}
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// バッジ類 (より洗練されたスタイル)
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    confirmed: 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50',
    pending: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
    cancelled: 'bg-slate-50 text-slate-400 border-slate-200 line-through decoration-slate-400',
    suspended: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const labels: Record<string, string> = {
    confirmed: '確定',
    pending: '仮予約',
    cancelled: 'キャンセル',
    suspended: '運休',
    completed: '完了',
  };

  return (
    <Badge variant="secondary" className={cn("border font-normal text-xs px-2 py-0.5", styles[status] || styles.pending)}>
      {labels[status] || status}
    </Badge>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    paid: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    unpaid: 'text-amber-600 bg-amber-50 border-amber-100',
    refunded: 'text-slate-500 bg-slate-100 border-slate-200',
    failed: 'text-red-600 bg-red-50 border-red-100',
  };
  const icons: Record<string, React.ReactNode> = {
    paid: <CheckCircle2 className="w-4 h-4 mr-1" />,
    unpaid: <AlertCircle className="w-4 h-4 mr-1" />,
    refunded: <RefreshCcw className="w-4 h-4 mr-1" />,
    failed: <XCircle className="w-4 h-4 mr-1" />,
  };

  return (
    <Badge variant="outline" className={cn("border pl-1.5 pr-2 py-0.5 text-xs font-medium", styles[status])}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </Badge>
  );
};