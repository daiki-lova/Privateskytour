"use client";

import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  Globe, Mail, Plus, Search,
  MoreHorizontal, CheckCircle2, Clock,
  ArrowLeft, Edit2, Trash2, Copy, RefreshCcw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { TableSkeleton, ErrorAlert } from '@/components/admin/shared';

// Type definitions
interface Announcement {
  id: string;
  type: 'reservation' | 'public';
  title: string;
  content: string;
  target: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'published';
  scheduledAt: string | null;
  sentAt: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Fetcher for SWR
const fetcher = async (url: string): Promise<AnnouncementsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

// Format date for display
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(/\//g, '-');
};

export const NotificationsView = () => {
  const [activeTab, setActiveTab] = useState<'reservation' | 'public'>('reservation');
  const [selectedNotification, setSelectedNotification] = useState<Announcement | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for create/edit
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeliveryType, setFormDeliveryType] = useState<'now' | 'scheduled' | 'draft'>('now');

  // Fetch announcements
  const { data, error, isLoading, mutate } = useSWR<AnnouncementsResponse>(
    `/api/admin/announcements?type=${activeTab}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`,
    fetcher
  );

  const notifications = data?.data ?? [];

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormContent('');
    setFormTarget('');
    setFormDeliveryType('now');
  }, []);

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      toast.error('件名を入力してください');
      return;
    }
    if (!formContent.trim()) {
      toast.error('本文を入力してください');
      return;
    }

    setIsProcessing(true);
    try {
      // Determine status based on delivery type and tab
      let status: 'draft' | 'scheduled' | 'sent' | 'published';
      if (formDeliveryType === 'draft') {
        status = 'draft';
      } else if (formDeliveryType === 'scheduled') {
        status = 'scheduled';
      } else {
        // 'now' - immediate delivery
        status = activeTab === 'reservation' ? 'sent' : 'published';
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          title: formTitle,
          content: formContent,
          target: formTarget || (activeTab === 'reservation' ? '選択された予約者' : 'ホームページ (News)'),
          status,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create announcement');
      }

      toast.success("お知らせを正常に作成しました。");
      setIsCreateOpen(false);
      resetForm();
      mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : '作成に失敗しました';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete announcement');
      }

      toast.success("お知らせを削除しました。");
      setSelectedNotification(null);
      mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      toast.error(message);
    }
  };

  const handleDuplicate = async (notification: Announcement) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notification.type,
          title: `[コピー] ${notification.title}`,
          content: notification.content,
          target: notification.target,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to duplicate announcement');
      }

      toast.success("お知らせをコピーしました。下書きとして保存されています。");
      setSelectedNotification(null);
      mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'コピーに失敗しました';
      toast.error(message);
    }
  };

  if (selectedNotification) {
    return (
      <NotificationDetail
        notification={selectedNotification}
        onBack={() => setSelectedNotification(null)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">お知らせ管理</h1>
          <p className="text-base font-medium text-slate-500 mt-2">予約者へのメッセージ送信とホームページのお知らせ掲載</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={() => mutate()} className="h-14 px-6 text-base font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl">
            <RefreshCcw className="w-5 h-5 mr-3" /> 更新
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="h-14 px-8 text-base font-bold bg-vivid-blue hover:bg-vivid-blue/90 text-white shadow-xl shadow-vivid-blue/20 rounded-xl flex-1 sm:flex-none">
            <Plus className="w-5 h-5 mr-3" /> 新規作成
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reservation' | 'public')} className="w-full">
        <TabsList className="bg-slate-100 p-1 border border-slate-200 h-14">
          <TabsTrigger value="reservation" className="text-sm font-black px-8 h-full data-[state=active]:bg-white data-[state=active]:text-vivid-blue data-[state=active]:shadow-sm rounded-lg">
            <Mail className="w-4 h-4 mr-3" />
            予約者へのメッセージ
          </TabsTrigger>
          <TabsTrigger value="public" className="text-sm font-black px-8 h-full data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg">
            <Globe className="w-4 h-4 mr-3" />
            ホームページ掲載
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {error ? (
            <ErrorAlert
              message="お知らせの取得に失敗しました"
              onRetry={() => mutate()}
            />
          ) : (
            <Card className="shadow-sm border-slate-200 bg-white">
              <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="件名や内容で検索"
                    className="pl-12 h-12 text-base bg-white border-slate-200 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {notifications.length} notifications
                </div>
              </div>

              {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : (
                <>
                  {/* Mobile card list */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-500">
                        お知らせはありません
                      </div>
                    ) : (
                      notifications.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 active:bg-slate-50 transition-colors"
                          onClick={() => setSelectedNotification(note)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <StatusBadge status={note.status} />
                            <span className="text-xs font-mono text-slate-400">
                              {formatDate(note.sentAt || note.scheduledAt || note.createdAt)}
                            </span>
                          </div>

                          <div className="mb-2">
                            <div className="font-semibold text-sm text-slate-900 line-clamp-1">{note.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{note.content}</div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs font-normal bg-slate-50 text-slate-500 border-slate-200">
                              {note.target || '-'}
                            </Badge>
                            <span className="text-xs text-slate-400">by {note.author || '-'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                          <TableHead className="w-[180px] text-xs font-bold text-slate-500 uppercase tracking-widest h-12 pl-6">配信日時/予定</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12">件名 / 内容</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12">対象</TableHead>
                          <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest h-12">ステータス</TableHead>
                          <TableHead className="text-right w-[60px] h-12 pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-xs text-slate-500">
                              お知らせはありません
                            </TableCell>
                          </TableRow>
                        ) : (
                          notifications.map((note) => (
                            <TableRow
                              key={note.id}
                              className="cursor-pointer hover:bg-slate-50/80 border-slate-100 transition-colors"
                              onClick={() => setSelectedNotification(note)}
                            >
                              <TableCell className="py-4 pl-6">
                                <div className="text-xs font-medium text-slate-700 font-mono">
                                  {formatDate(note.sentAt || note.scheduledAt || note.createdAt)}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">by {note.author || '-'}</div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-xs font-semibold text-slate-900">{note.title}</div>
                                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{note.content}</div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-600 border-slate-200">
                                  {note.target || '-'}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <StatusBadge status={note.status} />
                              </TableCell>
                              <TableCell className="text-right py-4 pr-6">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-500">
                                  <MoreHorizontal className="w-4 h-4" />
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
          )}
        </div>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[95vw] lg:max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-none">
          <DialogHeader className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">お知らせの新規作成</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2">
              配信先を選択し、メッセージを作成してください。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">配信タイプ</Label>
              <div className="md:col-span-3">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reservation' | 'public')} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-12 bg-slate-100 p-1 border">
                    <TabsTrigger value="reservation" className="text-sm font-bold">予約者へ通知</TabsTrigger>
                    <TabsTrigger value="public" className="text-sm font-bold">ホームページ公開</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {activeTab === 'reservation' && (
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 animate-in slide-in-from-top-1">
                <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">配信対象</Label>
                <Select value={formTarget} onValueChange={setFormTarget}>
                  <SelectTrigger className="md:col-span-3 h-12 text-base font-medium px-4 bg-white">
                    <SelectValue placeholder="対象を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_today" className="text-sm">本日の予約者全員</SelectItem>
                    <SelectItem value="all_tomorrow" className="text-sm">明日の予約者全員</SelectItem>
                    <SelectItem value="specific_flight" className="text-sm">特定のフライト便</SelectItem>
                    <SelectItem value="manual" className="text-sm">手動で選択</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="title" className="text-left md:text-right text-xs">件名</Label>
              <Input
                id="title"
                placeholder={activeTab === 'reservation' ? "例: 【重要】本日の運航について" : "例: 年末年始の休業のお知らせ"}
                className="md:col-span-3 h-12 text-base font-medium px-4"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
              <Label htmlFor="content" className="text-left md:text-right text-xs mt-2">本文</Label>
              <Textarea
                id="content"
                placeholder="メッセージ内容を入力してください"
                className="md:col-span-3 min-h-[300px] text-base leading-relaxed px-4 py-3 resize-none"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">配信設定</Label>
              <div className="md:col-span-3 flex items-center gap-4">
                <Select value={formDeliveryType} onValueChange={(v) => setFormDeliveryType(v as 'now' | 'scheduled' | 'draft')}>
                  <SelectTrigger className="w-full md:w-[240px] h-12 text-base font-medium px-4 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now" className="text-sm">即時配信 / 公開</SelectItem>
                    <SelectItem value="scheduled" className="text-sm">日時を指定して予約</SelectItem>
                    <SelectItem value="draft" className="text-sm">下書きとして保存</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="btn-secondary border-none">
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={isProcessing} className="btn-primary">
              {isProcessing ? (
                <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> 処理中...</>
              ) : (
                activeTab === 'reservation' ? '送信する' : '公開する'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Detail view component
interface NotificationDetailProps {
  notification: Announcement;
  onBack: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (notification: Announcement) => void;
}

const NotificationDetail = ({ notification, onBack, onDelete, onDuplicate }: NotificationDetailProps) => {
  return (
    <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 p-0 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            お知らせ詳細
            <StatusBadge status={notification.status} />
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">配信内容と統計の確認</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Left Column: Content */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">メッセージ内容</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">件名</Label>
                <div className="text-xl font-black text-slate-900 mt-1">{notification.title}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">本文</Label>
                <div className="mt-2 p-4 bg-slate-50 rounded-md text-sm text-slate-700 leading-relaxed border border-slate-100 min-h-[120px] whitespace-pre-wrap">
                  {notification.content}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">配信統計 (推計)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 mb-1">配信数</div>
                  <div className="text-xl font-bold text-slate-900">-<span className="text-xs font-normal text-slate-400 ml-1">通</span></div>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 mb-1">既読率</div>
                  <div className="text-xl font-bold text-vivid-blue">-<span className="text-xs font-normal text-slate-400 ml-1">%</span></div>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 mb-1">クリック数</div>
                  <div className="text-xl font-bold text-emerald-600">-<span className="text-xs font-normal text-slate-400 ml-1">回</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="space-y-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">配信情報</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">配信タイプ</Label>
                <div className="flex items-center gap-2 mt-1">
                  {notification.type === 'reservation' ? <Mail className="w-3.5 h-3.5 text-vivid-blue" /> : <Globe className="w-3.5 h-3.5 text-emerald-500" />}
                  <span className="text-sm font-medium text-slate-700">
                    {notification.type === 'reservation' ? '予約者へのメッセージ' : 'ホームページ掲載'}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">配信対象</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{notification.target || '-'}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">配信日時</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 font-mono">
                  {formatDate(notification.sentAt || notification.scheduledAt || notification.createdAt)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider">作成者</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{notification.author || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">アクション</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {(notification.status === 'draft' || notification.status === 'scheduled') ? (
                <>
                  <Button className="btn-secondary w-full justify-start">
                    <Edit2 className="w-4 h-4 mr-3 text-slate-400" /> 編集する
                  </Button>
                  <Button
                    className="btn-danger w-full justify-start bg-white text-red-600 border border-red-200 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(notification.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-3" /> 削除する
                  </Button>
                </>
              ) : (
                <Button
                  className="btn-secondary w-full justify-start"
                  onClick={() => onDuplicate(notification)}
                >
                  <Copy className="w-4 h-4 mr-3 text-slate-400" /> コピーして新規作成
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    sent: 'bg-vivid-blue/10 text-vivid-blue border-vivid-blue/200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
    draft: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  const labels: Record<string, string> = {
    sent: '送信済み',
    published: '公開中',
    scheduled: '送信予約',
    draft: '下書き',
  };

  const icons: Record<string, React.ReactNode> = {
    sent: <CheckCircle2 className="w-3 h-3 mr-1" />,
    published: <Globe className="w-3 h-3 mr-1" />,
    scheduled: <Clock className="w-3 h-3 mr-1" />,
    draft: <MoreHorizontal className="w-3 h-3 mr-1" />,
  };

  return (
    <Badge variant="secondary" className={cn("border font-medium text-xs px-2 py-0.5", styles[status])}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};
