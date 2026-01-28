"use client";

import React, { useState } from 'react';
import {
  Users, Search, Calendar, CheckCircle2, AlertCircle, Clock,
  ArrowLeft, Edit2, Trash2, Copy, RefreshCcw, Loader2,
  Plus, Image as ImageIcon, MapPin, Tag, X, ChevronRight, Save, Upload
} from 'lucide-react';
import { Course, Heliport } from '@/lib/data/types';
import { useCourses, useHeliports } from '@/lib/api/hooks';
import { createCourse, updateCourse, deleteCourse, CreateCourseInput, UpdateCourseInput } from '@/lib/api/mutations/courses';
import { CardGridSkeleton, ErrorAlert } from '@/components/admin/shared';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const CoursesView = () => {
  const { data, error, isLoading, mutate } = useCourses();
  const { data: heliportsData } = useHeliports();
  const courses = data?.data ?? [];
  const heliports = heliportsData?.data ?? [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Course>>({});

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData(JSON.parse(JSON.stringify(course)));
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        durationMinutes: 0,
        price: 0,
        maxPax: 3,
        heliportId: '',
        tags: [],
        images: [],
        flightSchedule: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (editingCourse) {
        const updateData: UpdateCourseInput = {
          name: formData.title,
          description: formData.description,
          durationMinutes: formData.durationMinutes ?? formData.duration,
          basePrice: formData.price,
          maxPassengers: formData.maxPax,
          isActive: formData.isActive,
        };
        await updateCourse(editingCourse.id, updateData);
        toast.success("コース情報を正常に更新いたしました。");
      } else {
        if (!formData.title || !formData.heliportId) {
          toast.error("コース名と出発ヘリポートは必須です。");
          setIsSaving(false);
          return;
        }
        const createData: CreateCourseInput = {
          name: formData.title,
          description: formData.description,
          durationMinutes: formData.durationMinutes ?? formData.duration ?? 0,
          basePrice: formData.price ?? 0,
          maxPassengers: formData.maxPax ?? 3,
          heliportId: formData.heliportId,
          isActive: true,
        };
        await createCourse(createData);
        toast.success("新しいコースを正常に作成いたしました。");
      }
      mutate();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(editingCourse ? "更新に失敗しました。" : "作成に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('このコースを削除してもよろしいですか？関連する予約がある場合はご注意ください。')) {
      try {
        await deleteCourse(id);
        toast.success("コース情報を削除いたしました。");
        mutate();
      } catch (err) {
        toast.error("削除に失敗しました。");
      }
    }
  };

  if (isLoading) {
    return <CardGridSkeleton cards={8} columns={4} />;
  }

  if (error) {
    return <ErrorAlert message={error.message} onRetry={() => mutate()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">コース管理</h1>
          <p className="text-lg font-medium text-slate-500 mt-2">Webサイト掲載用の遊覧プランの編集・管理 (CMS)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-14 px-8 text-base font-bold bg-vivid-blue hover:bg-vivid-blue/90 text-white shadow-xl shadow-vivid-blue/20 rounded-xl">
          <Plus className="w-5 h-5 mr-3" /> 新規コース作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            heliports={heliports}
            onEdit={() => handleOpenDialog(course)}
            onDelete={() => handleDelete(course.id)}
          />
        ))}
      </div>

      <CourseEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingCourse}
        isSaving={isSaving}
        heliports={heliports}
        onSave={handleSave}
      />
    </div>
  );
};

const CourseCard = ({ course, heliports, onEdit, onDelete }: { course: Course, heliports: Heliport[], onEdit: () => void, onDelete: () => void }) => {
  const mainImage = course.images && course.images.length > 0 ? course.images[0] : null;
  const heliportName = heliports.find(h => h.id === course.heliportId)?.name || course.heliport?.name || '未設定';
  const duration = course.durationMinutes ?? course.duration ?? 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:border-vivid-blue/300 transition-colors shadow-sm bg-white">
      <div className="relative h-32 bg-slate-100 overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 p-0.5 rounded border border-slate-100 shadow-sm">
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-100 hover:text-vivid-blue" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-100 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex flex-wrap gap-1">
            {course.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="bg-white/90 text-slate-900 text-xs h-4 px-1.5 py-0 backdrop-blur-sm border-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <CardHeader className="p-4 pb-2 space-y-1.5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-tight">{course.title}</h3>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
            {duration}min
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 line-clamp-1 font-sans">{course.subtitle || 'No subtitle'}</p>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-100 pt-3 mt-1">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{heliportName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>定員 {course.maxPax}名</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 border-t bg-slate-50/50 flex justify-between items-baseline">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">販売価格</span>
        <span className="text-lg font-black text-slate-900 font-mono">¥{course.price.toLocaleString()}</span>
      </CardFooter>
    </Card>
  );
};

const CourseEditDialog = ({
  open, onOpenChange, formData, setFormData, isEditing, isSaving, heliports, onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Partial<Course>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Course>>>;
  isEditing: boolean;
  isSaving: boolean;
  heliports: Heliport[];
  onSave: () => void;
}) => {

  const addScheduleStep = () => {
    const currentSchedule = formData.flightSchedule || [];
    setFormData({
      ...formData,
      flightSchedule: [...currentSchedule, { time: '', title: '', description: '' }]
    });
  };

  const updateScheduleStep = (index: number, field: string, value: string) => {
    const currentSchedule = [...(formData.flightSchedule || [])];
    currentSchedule[index] = { ...currentSchedule[index], [field]: value };
    setFormData({ ...formData, flightSchedule: currentSchedule });
  };

  const removeScheduleStep = (index: number) => {
    const currentSchedule = [...(formData.flightSchedule || [])];
    currentSchedule.splice(index, 1);
    setFormData({ ...formData, flightSchedule: currentSchedule });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] lg:max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-none">
        <DialogHeader className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'コース編集' : '新規コース作成'}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 mt-2">
            遊覧フライトの販売情報、コンテンツ、スケジュールを管理します。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-10 py-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">

            {/* Left Column: Basic Info */}
            <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <Tag className="w-5 h-5 text-vivid-blue" />
                <h4 className="text-xl font-black text-slate-900 tracking-tight">基本設定</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">コース名称 <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 text-base font-medium px-4"
                    placeholder="例: 東京ベイ・トワイライトクルーズ"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">キャッチコピー</Label>
                  <Input
                    value={formData.subtitle || ''}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="都市と自然のコントラストを楽しむ"
                    className="h-12 text-base px-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">所要時間 (分)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.durationMinutes ?? formData.duration ?? ''}
                        onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                        className="h-12 text-base pr-12 font-mono font-bold"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">min</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">定員 (名)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.maxPax || ''}
                        onChange={e => setFormData({ ...formData, maxPax: Number(e.target.value) })}
                        className="h-12 text-base pr-12 font-mono font-bold"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">pax</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">販売価格 (税込)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-500 font-sans">¥</span>
                    <Input
                      type="number"
                      className="h-12 pl-10 text-lg font-mono font-black"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">出発ヘリポート</Label>
                  <Select
                    value={formData.heliportId}
                    onValueChange={val => setFormData({ ...formData, heliportId: val })}
                  >
                    <SelectTrigger className="h-12 text-base px-4">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {heliports.map(h => (
                        <SelectItem key={h.id} value={h.id} className="text-xs">{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">タグ (カンマ区切り)</Label>
                  <Input
                    value={formData.tags?.join(',') || ''}
                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="夜景, デート, 富士山"
                    className="h-12 text-base px-4 font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5 min-h-[20px]">
                    {formData.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs h-5 px-1.5 font-normal text-slate-600 bg-slate-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Content */}
            <div className="col-span-1 md:col-span-12 lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <ImageIcon className="w-5 h-5 text-vivid-blue" />
                <h4 className="text-xl font-black text-slate-900 tracking-tight">コンテンツ詳細 & スケジュール</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">メイン画像</Label>
                  <div className="mt-2">
                    <div className="relative group cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormData({ ...formData, images: [url] });
                          }
                        }}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`
                          flex flex-col items-center justify-center w-full h-40 rounded-md border-2 border-dashed 
                          transition-colors cursor-pointer
                          ${formData.images?.[0] ? 'border-vivid-blue/200 bg-vivid-blue/10/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
                        `}
                      >
                        {formData.images?.[0] ? (
                          <div className="relative w-full h-full p-2">
                            <img
                              src={formData.images[0]}
                              alt="Preview"
                              className="w-full h-full object-cover rounded shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <div className="flex gap-2">
                                <span className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center">
                                  <Edit2 className="w-3.5 h-3.5 mr-1.5" /> 画像を変更
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 gap-2">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                              <Upload className="w-5 h-5 text-vivid-blue" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-slate-600">クリックして画像をアップロード</p>
                              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, GIF (Max 5MB)</p>
                            </div>
                          </div>
                        )}
                      </label>
                      {formData.images?.[0] && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, images: [] });
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <Label className="text-base text-slate-600 uppercase tracking-widest font-black mb-1.5 block">コース説明文</Label>
                  <Textarea
                    className="min-h-[220px] text-base leading-relaxed px-4 py-3 resize-none"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="コースの魅力や特徴を記述してください..."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> タイムライン
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleStep} className="h-6 text-xs px-2">
                    <Plus className="w-3 h-3 mr-1" /> 追加
                  </Button>
                </div>

                <div className="space-y-2 bg-slate-50/50 p-3 rounded-md border border-slate-100 min-h-[100px]">
                  {formData.flightSchedule?.map((step, index) => (
                    <div key={index} className="flex gap-2 items-start group">
                      <div className="w-16 shrink-0 pt-0.5">
                        <Input
                          placeholder="0分"
                          className="h-7 text-xs text-center font-mono"
                          value={step.time}
                          onChange={e => updateScheduleStep(index, 'time', e.target.value)}
                        />
                      </div>
                      <div className="mt-2 text-slate-300">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="タイトル (例: 離陸)"
                          className="h-10 text-sm font-bold text-slate-700 px-3"
                          value={step.title || ''}
                          onChange={e => updateScheduleStep(index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="詳細説明"
                          className="h-10 text-sm text-slate-600 px-3"
                          value={step.description}
                          onChange={e => updateScheduleStep(index, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeScheduleStep(index)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {(!formData.flightSchedule || formData.flightSchedule.length === 0) && (
                    <div className="text-center py-6 text-xs text-slate-400 italic">
                      スケジュールが設定されていません
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <DialogFooter className="px-10 py-8 border-t bg-slate-50/50 flex gap-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving} className="h-14 text-base font-bold bg-white hover:bg-slate-50 border border-slate-200 flex-1">
            キャンセル
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="h-14 text-base font-bold bg-vivid-blue hover:bg-vivid-blue/90 text-white shadow-lg shadow-vivid-blue/20 flex-1">
            {isSaving ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> 保存中...</>
            ) : (
              <><Save className="w-5 h-5 mr-3" /> 変更を保存する</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};