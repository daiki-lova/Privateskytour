import React from 'react';
import { FrontHeader, FrontFooter } from './FrontLayout';
import { MapPin, Clock, Users, Check, ChevronDown } from 'lucide-react';

const PLAN = {
  title: "東京1周！パノラマツアー",
  tags: ["東京", "人気プラン"],
  duration: "30分",
  maxPax: "3名",
  location: "東京ヘリポート発着",
  description: "東京の全てをこの目に。主要スポットを効率よく巡る、欲張りなあなたのためのプラン。",
  price: 75000,
  features: ["渋谷・新宿・浅草を網羅", "東京ドーム上空", "皇居周辺"],
  img: "https://images.unsplash.com/photo-1591550444398-21f6df1f1d40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEltcGVyaWFsJTIwUGFsYWNlJTIwYWVyaWFsfGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=1200"
};

const SCHEDULE = [
  { time: "0分", title: "東京ヘリポート離陸", desc: "" },
  { time: "15分", title: "渋谷・新宿エリア", desc: "スクランブル交差点や高層ビル群を眼下に。" },
  { time: "30分", title: "東京ヘリポート着陸", desc: "お疲れ様でした。" },
];

const FAQS = [
  { q: "機体は貸し切りですか？", a: "はい、当社のプランはすべて貸切運航となっております。プライベートな空間をお楽しみください。" },
  { q: "ヘリコプターは何人乗りですか？", a: "主に3名様乗り（パイロット除く）の機体を使用しております。4名様以上の場合は複数機での編隊飛行も可能です。" },
  { q: "欠航する場合はどのような時ですか？", a: "強風、低雲、視界不良などの悪天候時は運航を中止いたします。前日夕方までに判断しご連絡いたします。" },
  { q: "揺れはありますか？", a: "大型機と比較すると揺れを感じやすいですが、当日の気流が安定している高度を選んで飛行しますので、ひどく酔うような揺れは稀です。" },
  { q: "飛行高度はどのくらいですか？", a: "通常、東京上空では高度600m前後を飛行します。スカイツリーの展望台よりも高い位置からの眺めとなります。" },
  { q: "安全性について教えてください。", a: "国土交通省の厳しい基準をクリアした運航会社と提携しており、熟練のパイロットが操縦を担当します。機体整備も万全の体制で行っております。" },
];

export default function PlanDetailPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="font-sans text-slate-800 bg-white">
      <FrontHeader transparent={true} />
      
      {/* HERO */}
      <div className="relative h-[60vh] min-h-[500px]">
        <img src={PLAN.img} alt={PLAN.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 text-white max-w-7xl mx-auto">
          <div className="flex gap-2 mb-4">
            {PLAN.tags.map(tag => (
              <span key={tag} className={`text-xs font-bold px-3 py-1 rounded-full ${tag === '人気プラン' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{PLAN.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm md:text-base font-medium">
             <div className="flex items-center gap-2"><Clock className="w-5 h-5 opacity-80" /> 所要時間: {PLAN.duration}</div>
             <div className="flex items-center gap-2"><Users className="w-5 h-5 opacity-80" /> 最大{PLAN.maxPax}まで</div>
             <div className="flex items-center gap-2"><MapPin className="w-5 h-5 opacity-80" /> {PLAN.location}</div>
          </div>
        </div>
        
        <button onClick={() => onNavigate('home')} className="absolute top-24 left-4 md:left-10 bg-white/20 backdrop-blur hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          ← 戻る
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16">
        {/* LEFT CONTENT */}
        <div className="flex-1">
          <section className="mb-16">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
               <span className="w-1.5 h-6 bg-blue-600 rounded-full" /> コース詳細
            </h2>
            <p className="text-slate-600 leading-loose mb-8">{PLAN.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {PLAN.features.map((feat, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4 flex items-center gap-3 text-sm font-bold text-slate-700">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" /> {feat}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
             <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-8 pb-2 border-b border-slate-100">
               <span className="w-1.5 h-6 bg-blue-600 rounded-full" /> フライトスケジュール
            </h2>
            <div className="space-y-8 relative pl-4">
              <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-blue-100 -z-10" />
              {SCHEDULE.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                   <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0 z-10">
                     {i + 1}
                   </div>
                   <div className="pt-1">
                     <span className="text-blue-600 font-bold text-sm block mb-1">{item.time}</span>
                     <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                     {item.desc && <p className="text-sm text-slate-500 mt-1">{item.desc}</p>}
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-8 pb-2 border-b border-slate-100 text-center justify-center">
               よくあるご質問
            </h2>
             <div className="flex justify-center gap-8 mb-10 text-sm font-medium text-slate-400 border-b border-slate-100 w-fit mx-auto pb-4">
                <span className="text-slate-900 border-b-2 border-slate-900 pb-4">ヘリコプターについて</span>
                <span>ご予約について</span>
                <span>ご搭乗に際して</span>
             </div>

             <div className="space-y-4">
               {FAQS.map((faq, i) => (
                 <div key={i} className="bg-slate-50 rounded-lg overflow-hidden">
                    <button className="w-full text-left p-4 md:p-5 flex justify-between items-center font-bold text-slate-800 text-sm hover:bg-slate-100 transition-colors">
                      {faq.q}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR (Sticky) */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6 pb-6 border-b border-slate-100">
               <span className="text-xs font-bold text-blue-600 mb-1 block">一個あたりの料金</span>
               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-bold text-slate-900 tracking-tight">¥{PLAN.price.toLocaleString()}</span>
                 <span className="text-xs text-slate-500">(税込)</span>
               </div>
               <div className="mt-2 text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded inline-block">
                 ※燃料サーチャージ等、すべての費用を含みます。
               </div>
            </div>

            <div className="space-y-4 text-sm mb-8">
               <div className="flex justify-between py-2 border-b border-slate-50">
                 <span className="text-slate-500">最大搭乗人数</span>
                 <span className="font-bold text-slate-900">{PLAN.maxPax}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-slate-50">
                 <span className="text-slate-500">飛行時間</span>
                 <span className="font-bold text-slate-900">{PLAN.duration}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-slate-50">
                 <span className="text-slate-500">集合場所</span>
                 <span className="font-bold text-slate-900">東京ヘリポート</span>
               </div>
            </div>

            <button onClick={() => onNavigate('reservation')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-lg shadow-slate-200">
              このプランを予約する
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4">
              ご不明点は公式LINEにお問い合わせください
            </p>
          </div>
        </div>
      </main>

      <FrontFooter />
    </div>
  );
}
