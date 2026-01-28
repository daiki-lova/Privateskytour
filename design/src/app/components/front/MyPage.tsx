import React from 'react';
import { FrontHeader, FrontFooter } from './FrontLayout';
import { User, Calendar, Settings, Clock, LogOut, MapPin, ChevronRight, FileText } from 'lucide-react';

const USER = {
  name: "山田 太郎",
  id: "SKY-882349",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

const UPCOMING = {
  id: "RES-20241225",
  title: "東京ナイトクルーズ",
  date: "2024-12-25",
  time: "18:00",
  pax: 2,
  location: "東京ヘリポート",
  img: "https://images.unsplash.com/photo-1743409349492-a5f3e3aa4ae0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMG5pZ2h0JTIwdmlldyUyMGFlcmlhbCUyMHNreWxpbmV8ZW58MXx8fHwxNzY2MzczMzEzfDA&ixlib=rb-4.1.0&q=80&w=800"
};

const PAST = [
  {
    id: "RES-20241015",
    title: "横浜・みなとみらいコース",
    date: "2024-10-15 • 14:00",
    img: "https://images.unsplash.com/photo-1688636761616-fe7a83d1b5b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb2tvaGFtYSUyMGNpdHklMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=800"
  }
];

export default function MyPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen flex flex-col">
      <FrontHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center mb-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden">
               <img src={USER.avatar} alt={USER.name} className="w-full h-full object-cover" />
             </div>
             <h2 className="text-lg font-bold text-slate-900">{USER.name}</h2>
             <p className="text-xs text-slate-500 font-mono mt-1">{USER.id}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <nav className="flex flex-col">
               <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm font-medium">
                 <Calendar className="w-4 h-4" /> 予約履歴
               </a>
               <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 text-sm font-medium border-t border-slate-100 transition-colors">
                 <Settings className="w-4 h-4" /> 会員情報設定
               </a>
               <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 text-sm font-medium border-t border-slate-100 transition-colors">
                 <Clock className="w-4 h-4" /> 決済履歴・領収書
               </a>
               <button onClick={() => onNavigate('home')} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium border-t border-slate-100 transition-colors w-full text-left">
                 <LogOut className="w-4 h-4" /> ログアウト
               </button>
             </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 mb-6">予約履歴</h1>
          
          {/* Upcoming */}
          <section className="mb-10">
            <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-4">
              <Clock className="w-4 h-4" /> これからのフライト
            </h3>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
               <div className="md:w-1/3 aspect-video md:aspect-auto relative">
                 <img src={UPCOMING.img} alt={UPCOMING.title} className="w-full h-full object-cover" />
                 <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
               </div>
               <div className="flex-1 p-6">
                 <div className="flex justify-between items-start mb-4">
                   <h2 className="text-lg font-bold text-slate-900">{UPCOMING.title}</h2>
                   <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">予約確定</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-6 text-sm">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Calendar className="w-4 h-4 text-slate-400" /> {UPCOMING.date}
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <Clock className="w-4 h-4 text-slate-400" /> {UPCOMING.time}
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <User className="w-4 h-4 text-slate-400" /> {UPCOMING.pax}名
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <MapPin className="w-4 h-4 text-slate-400" /> {UPCOMING.location}
                   </div>
                 </div>
                 
                 <div className="flex gap-3 justify-end">
                   <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => onNavigate('detail')}>詳細を見る</button>
                   <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">予約変更・相談</button>
                 </div>
               </div>
            </div>
          </section>

          {/* Past */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-4">
              <Clock className="w-4 h-4" /> 過去のフライト
            </h3>
            
            <div className="space-y-4">
              {PAST.map(flight => (
                <div key={flight.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={flight.img} alt={flight.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{flight.title}</h4>
                    <p className="text-xs text-slate-500">{flight.date}</p>
                  </div>
                  <button className="flex-shrink-0 px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    領収書発行
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <FrontFooter />
    </div>
  );
}
