import React, { useState } from 'react';
import { FrontHeader, FrontFooter } from './FrontLayout';
import { ChevronLeft, ChevronRight, MapPin, Clock, Star, CheckCircle2, Home } from 'lucide-react';
import { motion } from 'motion/react';

const PLAN = {
  title: "東京1周！パノラマツアー",
  rating: 4.9,
  reviews: 124,
  duration: "30分",
  price: 75000,
  desc: "渋谷・新宿・浅草など、東京の主要観光スポットを一度に巡る贅沢な周遊プラン。スクランブル交差点や新宿副都心のビル群、浅草寺などを空から一望できます。初めての東京観光にも最適です。",
  img: "https://images.unsplash.com/photo-1591550444398-21f6df1f1d40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEltcGVyaWFsJTIwUGFsYWNlJTIwYWVyaWFsfGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=800"
};

const TIME_SLOTS = [
  "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00", "19:30"
];

const StepIndicator = ({ step }: { step: number }) => {
  return (
    <div className="flex justify-center items-center gap-4 mb-12">
      <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-slate-900' : 'text-slate-300'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
          1
        </div>
        <span className="text-xs font-medium">日時選択</span>
      </div>
      <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-slate-900' : 'text-slate-300'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
          2
        </div>
        <span className="text-xs font-medium">お客様情報</span>
      </div>
      <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-slate-900' : 'text-slate-300'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
          3
        </div>
        <span className="text-xs font-medium">完了</span>
      </div>
    </div>
  );
};

const Calendar = ({ selectedDate, onSelectDate }: { selectedDate: number | null, onSelectDate: (d: number) => void }) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  // Mock December 2025
  const offset = 1; // Starts on Monday
  const totalDays = 31;
  const today = 23; // Assume today is 23rd

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6 px-2">
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-lg font-bold text-slate-900">12月 2025</span>
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronRight className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {days.map((d, i) => (
          <div key={i} className={`text-xs font-medium py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(offset)].map((_, i) => <div key={`empty-${i}`} />)}
        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate === day;
          const isPast = day < today;
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelectDate(day)}
              className={`
                h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all
                ${isSelected ? 'bg-blue-600 text-white shadow-md scale-110' : ''}
                ${!isSelected && !isPast ? 'text-slate-700 hover:bg-slate-100' : ''}
                ${isPast ? 'text-slate-300 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function ReservationFlow({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedDate, setSelectedDate] = useState<number | null>(24);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <FrontHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb-ish / Back */}
        <button onClick={() => onNavigate('detail')} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <Home className="w-4 h-4" /> トップへ戻る
        </button>

        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">日時の選択</h1>
        <p className="text-center text-slate-500 text-sm mb-10">ご希望のフライト日時を選択してください</p>

        <StepIndicator step={1} />

        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* LEFT: Plan Card */}
          <div className="lg:col-span-5">
             <h2 className="text-lg font-bold text-slate-900 mb-4">選択中のプラン</h2>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
               <div className="relative h-48">
                 <img src={PLAN.img} alt={PLAN.title} className="w-full h-full object-cover" />
                 <div className="absolute top-3 left-3 flex items-center gap-2">
                   <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">東京</span>
                   <span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                     <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {PLAN.rating}
                   </span>
                 </div>
                 <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                   <h3 className="text-white font-bold text-xl shadow-sm">{PLAN.title}</h3>
                 </div>
               </div>
               
               <div className="p-6">
                 <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Clock className="w-4 h-4" /> 所要時間: {PLAN.duration}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ¥{PLAN.price.toLocaleString()}
                    </div>
                 </div>
                 
                 <p className="text-sm text-slate-600 leading-relaxed mb-6">
                   {PLAN.desc}
                 </p>

                 <div className="bg-slate-50 rounded-lg p-3 flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-slate-600 font-medium">プランは選択済みです。日時をお選びください。</p>
                 </div>
               </div>
             </div>
          </div>

          {/* RIGHT: Selectors */}
          <div className="lg:col-span-7">
            <h2 className="text-lg font-bold text-slate-900 mb-4">日時を選択</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">フライト日</div>
              <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">出発時間 (30分間隔)</span>
                </div>
                
                {selectedDate ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-3 rounded-lg text-sm font-medium border transition-all
                          ${selectedTime === time 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl text-slate-400 text-sm">
                    まずはフライト日を選択してください
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-3">※ まずはフライト日を選択してください</p>
              </div>

              <div className="mt-8 bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                   <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                   <div className="text-xs font-bold text-slate-500 mb-0.5">集合場所: 東京ヘリポート</div>
                   <div className="text-xs text-slate-400">東京都江東区新木場4-7-25</div>
                 </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                disabled={!selectedDate || !selectedTime}
                className="w-full md:w-auto px-12 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                次へ進む
              </button>
            </div>
          </div>
        </div>
      </div>

      <FrontFooter />
    </div>
  );
}
