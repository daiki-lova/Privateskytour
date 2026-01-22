"use client";

import { useState } from "react";
import { BookingData } from "./BookingWizard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Car, Info } from "lucide-react";
import { PLANS } from "./constants";

interface Step2Props {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export function Step2PassengerDetails({ data, updateData, onNext }: Step2Props) {
  const [formData, setFormData] = useState({
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    contactPhone: data.contactPhone || "",
    passengers: data.passengers?.toString() || "2",
    requestTransfer: data.requestTransfer || false,
    pickupAddress: data.pickupAddress || "",
    dropoffAddress: data.dropoffAddress || "",
    notes: data.notes || ""
  });

  const selectedPlan = PLANS.find(p => p.id === data.planId);
  const isEligibleForTransfer = selectedPlan ? parseInt(selectedPlan.duration) >= 30 : false;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Basic validation
    if (!formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      alert("必須項目を入力してください");
      return;
    }

    if (formData.requestTransfer) {
        if (!formData.pickupAddress) {
            alert("送迎をご希望の場合は、お迎え先住所を入力してください");
            return;
        }
    }

    updateData({
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      passengers: parseInt(formData.passengers),
      requestTransfer: formData.requestTransfer,
      pickupAddress: formData.pickupAddress,
      dropoffAddress: formData.dropoffAddress,
      options: [],
      notes: formData.notes
    });
    onNext();
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">お客様情報の入力</h2>
        <p className="text-slate-500">ご予約に必要な情報を入力してください</p>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold flex items-center justify-between">
                お名前 (カタカナ)
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
              </Label>
              <Input 
                id="name" 
                placeholder="オオゾラ タロウ" 
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold flex items-center justify-between">
                    メールアドレス
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                </Label>
                <Input 
                    id="email" 
                    type="email"
                    placeholder="skyview@example.com" 
                    value={formData.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold flex items-center justify-between">
                    電話番号
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
                </Label>
                <Input 
                    id="phone" 
                    placeholder="09012345678" 
                    value={formData.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg"
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers" className="text-sm font-bold flex items-center justify-between">
                搭乗人数
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] py-0 px-1.5 border-0">必須</Badge>
              </Label>
              <Select value={formData.passengers} onValueChange={(val) => handleChange("passengers", val)}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-vivid-blue rounded-lg">
                  <SelectValue placeholder="人数を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1名</SelectItem>
                  <SelectItem value="2">2名</SelectItem>
                  <SelectItem value="3">3名</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 mt-1">
                ※搭乗者様の合計体重制限は220kgまでとなります。
              </p>
            </div>
          </div>
        </div>

        {/* Free Transfer Option (Conditional) */}
        {isEligibleForTransfer && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-vivid-blue p-2 rounded-xl">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">無料ハイヤー送迎のご案内</h3>
                        <p className="text-[10px] text-vivid-blue font-bold tracking-wider uppercase">Alphard Transfer Service</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100">
                    <Checkbox 
                        id="transfer" 
                        checked={formData.requestTransfer}
                        onCheckedChange={(checked) => handleChange("requestTransfer", checked === true)}
                        className="w-5 h-5"
                    />
                    <label
                        htmlFor="transfer"
                        className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                    >
                        無料送迎（アルファード）を利用する
                    </label>
                </div>

                {formData.requestTransfer && (
                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                         <div className="space-y-2">
                            <Label htmlFor="pickup" className="text-xs font-bold text-slate-500">お迎え先住所</Label>
                            <Input 
                                id="pickup" 
                                placeholder="例：東京都港区六本木 ◯-◯-◯" 
                                value={formData.pickupAddress}
                                onChange={(e) => handleChange("pickupAddress", e.target.value)}
                                className="bg-white border-slate-200 focus:border-vivid-blue rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dropoff" className="text-xs font-bold text-slate-500">お送り先住所（省略可）</Label>
                            <Input 
                                id="dropoff" 
                                placeholder="例：東京都港区六本木 ◯-◯-◯" 
                                value={formData.dropoffAddress}
                                onChange={(e) => handleChange("dropoffAddress", e.target.value)}
                                className="bg-white border-slate-200 focus:border-vivid-blue rounded-lg"
                            />
                            <div className="flex items-start gap-1.5 mt-2">
                                <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">※対象エリア：東京23区内・横浜市内・舞浜エリア等</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Notes */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-bold flex items-center justify-between">
                    備考欄
                    <Badge variant="outline" className="text-slate-400 text-[10px] py-0 px-1.5 border-slate-200 font-normal">任意</Badge>
                </Label>
                <Textarea 
                id="notes" 
                placeholder="特別なご要望や、記念日でのご利用などございましたらご自由にご記入ください"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="min-h-[120px] border-slate-200 focus:border-vivid-blue rounded-xl resize-none"
                />
            </div>
        </div>

        <Button 
          onClick={handleNext} 
          className="w-full h-14 text-lg bg-vivid-blue hover:bg-vivid-blue/90 text-white mt-8 rounded-xl font-bold shadow-lg shadow-vivid-blue/10 transition-all active:scale-[0.98]"
        >
          予約内容を確認する
        </Button>
      </div>
    </div>
  );
}
