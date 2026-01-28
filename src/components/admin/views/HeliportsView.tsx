"use client";

import React, { useState } from 'react';
import {
  Plus, MapPin, Edit2, Trash2,
  ExternalLink, Image as ImageIcon, Save, Upload
} from 'lucide-react';
import { Heliport } from '@/lib/data/types';
import { useHeliports } from '@/lib/api/hooks';
import { CardGridSkeleton, ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const HeliportsView = () => {
  const { data, error, isLoading, mutate } = useHeliports();
  const heliports = data?.data ?? [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHeliport, setEditingHeliport] = useState<Heliport | null>(null);

  // フォーム状態
  const [formData, setFormData] = useState<Partial<Heliport>>({});

  const handleOpenDialog = (heliport?: Heliport) => {
    if (heliport) {
      setEditingHeliport(heliport);
      setFormData(heliport);
    } else {
      setEditingHeliport(null);
      setFormData({
        name: '',
        postalCode: '',
        address: '',
        accessRail: '',
        accessTaxi: '',
        accessCar: '',
        googleMapUrl: '',
        imageUrl: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingHeliport) {
        // PUT /api/admin/heliports/[id]
        const response = await fetch(`/api/admin/heliports/${editingHeliport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Update failed');
        }
        toast.success("ヘリポート情報を正常に更新いたしました。");
      } else {
        // POST /api/admin/heliports
        const response = await fetch('/api/admin/heliports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Create failed');
        }
        toast.success("新しいヘリポートを正常に登録いたしました。");
      }
      setIsDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ヘリポート情報を削除してもよろしいですか？この操作は取り消せません。')) return;

    try {
      const response = await fetch(`/api/admin/heliports/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }
      toast.success("対象のヘリポート情報を削除いたしました。");
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">ヘリポート管理</h1>
            <p className="text-xs text-slate-500 mt-1">フライト発着地のロケーション管理 (CMS)</p>
          </div>
        </div>
        <ErrorAlert
          message="ヘリポートデータの取得に失敗しました"
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">ヘリポート管理</h1>
            <p className="text-xs text-slate-500 mt-1">フライト発着地のロケーション管理 (CMS)</p>
          </div>
          <Button disabled className="w-full sm:w-auto h-9 text-xs bg-indigo-600">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> 新規ヘリポート
          </Button>
        </div>
        <CardGridSkeleton cards={3} columns={3} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-indigo-950">ヘリポート管理</h1>
          <p className="text-base font-medium text-slate-500 mt-2">フライト発着地のロケーション管理 (CMS)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-14 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 rounded-xl">
          <Plus className="w-5 h-5 mr-3" /> 新規ヘリポート登録
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {heliports.map((heliport) => (
          <HeliportCard
            key={heliport.id}
            heliport={heliport}
            onEdit={() => handleOpenDialog(heliport)}
            onDelete={() => handleDelete(heliport.id)}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] lg:max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-none">
          <DialogHeader className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{editingHeliport ? 'ヘリポート編集' : '新規ヘリポート登録'}</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2">
              Webサイトの「アクセス」ページに表示される情報を管理します。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-white">
            <div className="space-y-1">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">ヘリポート名称</Label>
              <Input
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 東京ヘリポート"
                className="h-12 text-base font-medium px-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">郵便番号</Label>
                <Input
                  value={formData.postalCode || ''}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="123-4567"
                  className="h-12 text-base font-mono font-bold px-4"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">住所</Label>
                <Input
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="東京都..."
                  className="h-12 text-base px-4"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">最寄り駅（電車）</Label>
              <Input
                value={formData.accessRail || ''}
                onChange={e => setFormData({ ...formData, accessRail: e.target.value })}
                placeholder="例: 新木場駅"
                className="h-12 text-base px-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">タクシーアクセス</Label>
                <Textarea
                  value={formData.accessTaxi || ''}
                  onChange={e => setFormData({ ...formData, accessTaxi: e.target.value })}
                  placeholder="例: 新木場駅より約5分"
                  className="min-h-[140px] text-base leading-relaxed px-4 py-3 resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">車アクセス（任意）</Label>
                <Textarea
                  value={formData.accessCar || ''}
                  onChange={e => setFormData({ ...formData, accessCar: e.target.value })}
                  placeholder="ICからの所要時間など"
                  className="min-h-[140px] text-base leading-relaxed px-4 py-3 resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">Google Map URL</Label>
              <div className="flex gap-3">
                <Input
                  value={formData.googleMapUrl || ''}
                  onChange={e => setFormData({ ...formData, googleMapUrl: e.target.value })}
                  placeholder="https://goo.gl/maps/..."
                  className="h-12 text-base font-mono text-slate-500 px-4"
                />
                <Button variant="outline" size="icon" title="確認" className="h-12 w-12 shrink-0 border-slate-200 hover:bg-slate-50">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">ヘリポート画像</Label>

              {formData.imageUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 group bg-slate-50">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <div className="bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> 変更
                      </div>
                    </label>
                    <button
                      onClick={handleRemoveImage}
                      className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 削除
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors bg-white">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-2 bg-indigo-50 rounded-full mb-2">
                      <Upload className="w-5 h-5 text-indigo-500" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">クリックして画像をアップロード</p>
                    <p className="text-xs text-slate-400 mt-1">またはドラッグ＆ドロップ (PNG, JPG)</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="px-10 py-8 border-t bg-slate-50/50 flex gap-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 text-base font-bold bg-white hover:bg-slate-50 border border-slate-200 flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 flex-1">
              <Save className="w-5 h-5 mr-3" /> 変更を保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const HeliportCard = ({ heliport, onEdit, onDelete }: { heliport: Heliport, onEdit: () => void, onDelete: () => void }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full group hover:border-indigo-300 transition-colors shadow-sm bg-white">
      <div className="relative h-28 bg-slate-100">
        {heliport.imageUrl ? (
          <img src={heliport.imageUrl} alt={heliport.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 p-0.5 rounded border border-slate-100 shadow-sm">
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-100 hover:text-indigo-600" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-100 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-bold text-slate-900">{heliport.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs font-medium mt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> 〒{heliport.postalCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0 space-y-3">
        <p className="text-xs font-medium text-slate-600 line-clamp-1">{heliport.address}</p>
        <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
          <div className="flex gap-2 text-xs font-medium text-slate-500">
            <span className="font-bold w-12 shrink-0 text-slate-400">電車</span>
            <span className="truncate text-slate-700">{heliport.accessRail || '-'}</span>
          </div>
          <div className="flex gap-2 text-xs font-medium text-slate-500">
            <span className="font-bold w-12 shrink-0 text-slate-400">Taxi</span>
            <span className="truncate text-slate-700">{heliport.accessTaxi || '-'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50/50 p-3 border-t">
        <a
          href={heliport.googleMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center justify-center gap-2 w-full font-bold"
        >
          <ExternalLink className="w-4 h-4" /> Mapで位置を確認
        </a>
      </CardFooter>
    </Card>
  );
};