import React, { useState } from 'react';
import { 
  Bell, Globe, Mail, Plus, Search, Calendar, 
  MoreHorizontal, CheckCircle2, AlertCircle, Clock,
  ArrowLeft, Edit2, Trash2, Copy
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { cn } from "../ui/utils";

// Mock Data
const MOCK_NOTIFICATIONS = [
  {
    id: 14,
    type: 'reservation',
    title: '【重要】12/25 強風による運航見合わせについて',
    content: '本日の16:00以降のフライトは強風のため全便欠航となりました。振替手続きについては...',
    target: '12/25 予約者全員',
    status: 'sent',
    sentAt: '2025-12-25 14:30',
    author: 'Admin'
  },
  {
    id: 15,
    type: 'reservation',
    title: 'ご搭乗の前日確認',
    content: '明日のフライトのご案内です。集合時間はフライト時刻の20分前となっております...',
    target: '12/26 予約者',
    status: 'scheduled',
    sentAt: '2025-12-25 18:00 (予定)',
    author: 'System'
  },
  {
    id: 13,
    type: 'public',
    title: '年末年始の営業について',
    content: '誠に勝手ながら、12/31〜1/3は休業とさせていただきます。年始は1/4より通常営業...',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-12-20 10:00',
    author: 'Staff'
  },
  {
    id: 12,
    type: 'public',
    title: '機材メンテナンスのお知らせ (1/15)',
    content: '安全運航のため、1月15日は終日機材メンテナンスを行います。ご迷惑をおかけしますが...',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-12-10 09:00',
    author: 'Admin'
  },
  {
    id: 11,
    type: 'public',
    title: 'クリスマス期間の予約受付開始',
    content: '本日より12/24, 25のクリスマス特別フライトの予約受付を開始いたしました。',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-11-01 10:00',
    author: 'Staff'
  },
  {
    id: 10,
    type: 'public',
    title: '【秋の遊覧キャンペーン】10月限定割引',
    content: '深まる秋の景色を空から楽しみませんか？10月中の平日フライトが10%OFFになるクーポン...',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-09-20 11:00',
    author: 'Marketing'
  },
  {
    id: 9,
    type: 'reservation',
    title: '【重要】台風接近に伴う運航中止のお知らせ',
    content: '台風の接近に伴い、8/15の全フライトを中止いたします。返金手続きについては順次ご連絡...',
    target: '8/15 予約者全員',
    status: 'sent',
    sentAt: '2025-08-14 15:00',
    author: 'Admin'
  },
  {
    id: 8,
    type: 'public',
    title: '夏季限定「横浜ナイトクルーズ」増便決定',
    content: 'ご好評につき、7月〜8月の金・土曜日は横浜ナイトクルーズを増便いたします。',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-07-01 10:00',
    author: 'Staff'
  },
  {
    id: 7,
    type: 'reservation',
    title: '【運航情報】6/10 梅雨前線による天候不良について',
    content: '明日のフライトですが、天候不良が予想されるため、条件付き運航となる可能性があります...',
    target: '6/10 予約者',
    status: 'sent',
    sentAt: '2025-06-09 16:00',
    author: 'Admin'
  },
  {
    id: 6,
    type: 'public',
    title: 'ゴールデンウィーク期間中の混雑について',
    content: 'GW期間中は周辺道路の混雑が予想されます。お時間には余裕を持ってお越しください。',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-04-20 09:00',
    author: 'Staff'
  },
  {
    id: 5,
    type: 'reservation',
    title: '【重要】強風による運休のお知らせ',
    content: '本日14:00以降のフライトは、突風のため安全を考慮し運休とさせていただきます。',
    target: '3/15 午後予約者',
    status: 'sent',
    sentAt: '2025-03-15 12:30',
    author: 'Admin'
  },
  {
    id: 4,
    type: 'public',
    title: 'バレンタイン特別プランのご案内',
    content: '大切な方と空の上で過ごすバレンタイン。期間限定のシャンパンサービス付きプランをご用意...',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-02-10 10:00',
    author: 'Marketing'
  },
  {
    id: 3,
    type: 'public',
    title: '新年のご挨拶',
    content: '新年あけましておめでとうございます。本年も安全第一で皆様に感動をお届けしてまいります。',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2025-01-01 00:00',
    author: 'CEO'
  },
  {
    id: 2,
    type: 'public',
    title: '年末年始の休業日について',
    content: '12/30〜1/3は休業とさせていただきます。年始は1/4より営業開始となります。',
    target: 'ホームページ (News)',
    status: 'published',
    sentAt: '2024-12-20 10:00',
    author: 'Staff'
  },
  {
    id: 1,
    type: 'reservation',
    title: '【システム】予約システムメンテナンスのお知らせ',
    content: '11/15 深夜2:00〜4:00の間、システムメンテナンスを実施します。この間予約ができなくなります。',
    target: '全会員',
    status: 'sent',
    sentAt: '2024-11-10 10:00',
    author: 'System'
  }
];

export const NotificationsView = () => {
  const [activeTab, setActiveTab] = useState('reservation');
  const [selectedNotification, setSelectedNotification] = useState<typeof MOCK_NOTIFICATIONS[0] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(n => n.type === activeTab);

  const handleCreate = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setIsCreateOpen(false);
    toast.success("お知らせを正常に作成・配信いたしました。");
  };

  if (selectedNotification) {
    return (
      <NotificationDetail 
        notification={selectedNotification} 
        onBack={() => setSelectedNotification(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">お知らせ管理</h1>
          <p className="text-xs text-slate-500 mt-1">予約者へのメッセージ送信とホームページのお知らせ掲載</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto h-9 text-xs bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-3.5 h-3.5 mr-2" /> 新規作成
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-0.5 border border-slate-200">
          <TabsTrigger value="reservation" className="text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
            <Mail className="w-3.5 h-3.5 mr-2" />
            予約者へのメッセージ
          </TabsTrigger>
          <TabsTrigger value="public" className="text-xs px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
            <Globe className="w-3.5 h-3.5 mr-2" />
            ホームページ掲載
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="件名や内容で検索" 
                  className="pl-9 h-9 text-xs bg-white" 
                />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {filteredNotifications.length} notifications
              </div>
            </div>

            {/* モバイル用カードリスト */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  お知らせはありません
                </div>
              ) : (
                filteredNotifications.map((note) => (
                  <div 
                    key={note.id} 
                    className="p-4 active:bg-slate-50 transition-colors"
                    onClick={() => setSelectedNotification(note)}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <StatusBadge status={note.status} />
                       <span className="text-[10px] font-mono text-slate-400">{note.sentAt}</span>
                    </div>
                    
                    <div className="mb-2">
                       <div className="font-semibold text-sm text-slate-900 line-clamp-1">{note.title}</div>
                       <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{note.content}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                       <Badge variant="outline" className="text-[10px] font-normal bg-slate-50 text-slate-500 border-slate-200">
                         {note.target}
                       </Badge>
                       <span className="text-[10px] text-slate-400">by {note.author}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[180px] text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-10 pl-6">配信日時/予定</TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-10">件名 / 内容</TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-10">対象</TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-10">ステータス</TableHead>
                  <TableHead className="text-right w-[60px] h-10 pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-slate-500">
                      お知らせはありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((note) => (
                    <TableRow key={note.id} className="cursor-pointer hover:bg-slate-50/80 border-slate-100 transition-colors" onClick={() => setSelectedNotification(note)}>
                      <TableCell className="py-4 pl-6">
                        <div className="text-xs font-medium text-slate-700 font-mono">{note.sentAt}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">by {note.author}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs font-semibold text-slate-900">{note.title}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{note.content}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="font-normal text-[10px] bg-slate-100 text-slate-600 border-slate-200">
                          {note.target}
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
          </Card>
        </div>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>お知らせの新規作成</DialogTitle>
            <DialogDescription>
              配信先を選択し、メッセージを作成してください。
            </DialogDescription>
          </DialogHeader>
          
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label className="text-left md:text-right text-xs">配信タイプ</Label>
              <div className="md:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-9">
                    <TabsTrigger value="reservation" className="text-xs">予約者へ通知</TabsTrigger>
                    <TabsTrigger value="public" className="text-xs">ホームページ公開</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {activeTab === 'reservation' && (
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 animate-in slide-in-from-top-1">
                <Label className="text-left md:text-right text-xs">配信対象</Label>
                <Select>
                  <SelectTrigger className="md:col-span-3 h-9 text-xs">
                    <SelectValue placeholder="対象を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_today" className="text-xs">本日の予約者全員</SelectItem>
                    <SelectItem value="all_tomorrow" className="text-xs">明日の予約者全員</SelectItem>
                    <SelectItem value="specific_flight" className="text-xs">特定のフライト便</SelectItem>
                    <SelectItem value="manual" className="text-xs">手動で選択</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="title" className="text-left md:text-right text-xs">件名</Label>
              <Input id="title" placeholder={activeTab === 'reservation' ? "例: 【重要】本日の運航について" : "例: 年末年始の休業のお知らせ"} className="md:col-span-3 h-9 text-xs" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
              <Label htmlFor="content" className="text-left md:text-right text-xs mt-2">本文</Label>
              <Textarea 
                id="content" 
                placeholder="メッセージ内容を入力してください" 
                className="md:col-span-3 h-32 text-xs resize-none" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label className="text-left md:text-right text-xs">配信設定</Label>
              <div className="md:col-span-3 flex items-center gap-4">
                 <Select defaultValue="now">
                  <SelectTrigger className="w-full md:w-[180px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now" className="text-xs">即時配信 / 公開</SelectItem>
                    <SelectItem value="scheduled" className="text-xs">日時を指定して予約</SelectItem>
                    <SelectItem value="draft" className="text-xs">下書きとして保存</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="h-9 text-xs">キャンセル</Button>
            <Button onClick={handleCreate} disabled={isProcessing} className="h-9 text-xs">
              {isProcessing ? '処理中...' : (activeTab === 'reservation' ? '送信する' : '公開する')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 詳細表示コンポーネント
const NotificationDetail = ({ notification, onBack }: { notification: typeof MOCK_NOTIFICATIONS[0], onBack: () => void }) => {
  return (
    <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-3">
            お知らせ詳細
            <StatusBadge status={notification.status} />
          </h1>
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
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">件名</Label>
                <div className="text-base font-bold text-slate-900 mt-1">{notification.title}</div>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">本文</Label>
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
                  <div className="text-xl font-bold text-slate-900">128<span className="text-xs font-normal text-slate-400 ml-1">通</span></div>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 mb-1">既読率</div>
                  <div className="text-xl font-bold text-indigo-600">84<span className="text-xs font-normal text-slate-400 ml-1">%</span></div>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 mb-1">クリック数</div>
                  <div className="text-xl font-bold text-emerald-600">42<span className="text-xs font-normal text-slate-400 ml-1">回</span></div>
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
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">配信タイプ</Label>
                <div className="flex items-center gap-2 mt-1">
                   {notification.type === 'reservation' ? <Mail className="w-3.5 h-3.5 text-indigo-500" /> : <Globe className="w-3.5 h-3.5 text-emerald-500" />}
                   <span className="text-sm font-medium text-slate-700">
                     {notification.type === 'reservation' ? '予約者へのメッセージ' : 'ホームページ掲載'}
                   </span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">配信対象</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{notification.target}</div>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">配信日時</Label>
                <div className="text-sm font-medium text-slate-900 mt-1 font-mono">{notification.sentAt}</div>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase tracking-wider">作成者</Label>
                <div className="text-sm font-medium text-slate-900 mt-1">{notification.author}</div>
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
                   <Button variant="outline" className="w-full justify-start h-10 text-xs border-slate-200 bg-white hover:bg-slate-50">
                      <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-400" /> 編集する
                   </Button>
                   <Button variant="outline" className="w-full justify-start h-10 text-xs border-slate-200 text-red-600 bg-white hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> 削除する
                   </Button>
                 </>
              ) : (
                 <Button variant="outline" className="w-full justify-start h-10 text-xs border-slate-200 bg-white hover:bg-slate-50">
                    <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" /> コピーして新規作成
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
    sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
    <Badge variant="secondary" className={cn("border font-medium text-[10px] px-2 py-0.5", styles[status])}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};