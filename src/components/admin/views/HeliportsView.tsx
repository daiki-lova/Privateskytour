"use client";

import React, { useState } from 'react';
import { 
  Plus, MapPin, Edit2, Trash2, 
  ExternalLink, Image as ImageIcon, Save, Upload, X
} from 'lucide-react';
import { Heliport } from '@/lib/data/types';
import { MOCK_HELIPORTS } from '@/lib/data/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const HeliportsView = () => {
  const [heliports, setHeliports] = useState<Heliport[]>(MOCK_HELIPORTS);
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

  const handleSave = () => {
    if (editingHeliport) {
      // Update
      setHeliports(prev => prev.map(h => h.id === editingHeliport.id ? { ...h, ...formData } as Heliport : h));
      toast.success("ヘリポート情報を正常に更新いたしました。");
    } else {
      // Create
      const newHeliport = {
        ...formData,
        id: `h${Date.now()}`,
      } as Heliport;
      setHeliports(prev => [...prev, newHeliport]);
      toast.success("新しいヘリポートを正常に登録いたしました。");
    }
    setIsDialogOpen(false);
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

  const handleDelete = (id: string) => {
    if (window.confirm('ヘリポート情報を削除してもよろしいですか？この操作は取り消せません。')) {
      setHeliports(prev => prev.filter(h => h.id !== id));
      toast.success("対象のヘリポート情報を完全に削除いたしました。");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">ヘリポート管理</h1>
          <p className="text-xs text-slate-500 mt-1">フライト発着地のロケーション管理 (CMS)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto h-9 text-xs bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> 新規ヘリポート
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-base font-bold text-slate-800">{editingHeliport ? 'ヘリポート編集' : '新規ヘリポート登録'}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Webサイトの「アクセス」ページに表示される情報を管理します。
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">ヘリポート名称</Label>
              <Input 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="例: 東京ヘリポート" 
                className="h-8 text-sm font-medium"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">郵便番号</Label>
                <Input 
                  value={formData.postalCode || ''} 
                  onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  placeholder="123-4567" 
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">住所</Label>
                <Input 
                  value={formData.address || ''} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="東京都..." 
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">最寄り駅（電車）</Label>
              <Input 
                value={formData.accessRail || ''} 
                onChange={e => setFormData({...formData, accessRail: e.target.value})}
                placeholder="例: 新木場駅" 
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">タクシーアクセス</Label>
                <Textarea 
                  value={formData.accessTaxi || ''} 
                  onChange={e => setFormData({...formData, accessTaxi: e.target.value})}
                  placeholder="例: 新木場駅より約5分" 
                  className="h-16 text-xs resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">車アクセス（任意）</Label>
                <Textarea 
                  value={formData.accessCar || ''} 
                  onChange={e => setFormData({...formData, accessCar: e.target.value})}
                  placeholder="ICからの所要時間など" 
                  className="h-16 text-xs resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Google Map URL</Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.googleMapUrl || ''} 
                  onChange={e => setFormData({...formData, googleMapUrl: e.target.value})}
                  placeholder="https://goo.gl/maps/..." 
                  className="h-8 text-xs font-mono text-slate-600"
                />
                <Button variant="outline" size="icon" title="確認" className="h-8 w-8 shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">ヘリポート画像</Label>
              
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

          <DialogFooter className="p-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 text-xs">キャンセル</Button>
            <Button onClick={handleSave} className="h-8 text-xs min-w-[100px] gap-2">
              <Save className="w-3.5 h-3.5" /> 保存する
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
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-bold text-slate-900">{heliport.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-[10px] mt-0.5">
          <MapPin className="w-2.5 h-2.5" /> 〒{heliport.postalCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0 space-y-2">
        <p className="text-[10px] text-slate-600 line-clamp-1">{heliport.address}</p>
        <div className="space-y-1 pt-1 border-t border-slate-50">
          <div className="flex gap-2 text-[10px] text-slate-500">
            <span className="font-semibold w-10 shrink-0 text-slate-400">電車</span>
            <span className="truncate">{heliport.accessRail || '-'}</span>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-500">
             <span className="font-semibold w-10 shrink-0 text-slate-400">Taxi</span>
             <span className="truncate">{heliport.accessTaxi || '-'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50/50 p-2 border-t">
        <a 
          href={heliport.googleMapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 w-full justify-center font-medium"
        >
          <ExternalLink className="w-2.5 h-2.5" /> Mapを開く
        </a>
      </CardFooter>
    </Card>
  );
};