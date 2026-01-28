import React from 'react';
import { FrontHeader, FrontFooter } from './FrontLayout';
import { Search, MapPin, Clock, Users, ChevronRight, ShieldCheck, Award, Wallet, Star, CalendarCheck, UserCheck, CreditCard, Send, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

// Images
const HERO_IMG = "https://images.unsplash.com/photo-1533474034618-3118b91f2826?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMGNpdHklMjBhZXJpYWwlMjB2aWV3JTIwaGVsaWNvcHRlciUyMHN1bm55fGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=1920";
const IMG_FUJI = "https://images.unsplash.com/photo-1542686174-e2da165f1062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNdCUyMEZ1amklMjBhZXJpYWwlMjB2aWV3JTIwYmVhdXRpZnVsfGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=800";
const IMG_TOKYO = "https://images.unsplash.com/photo-1743409349492-a5f3e3aa4ae0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMG5pZ2h0JTIwdmlldyUyMGFlcmlhbCUyMHNreWxpbmV8ZW58MXx8fHwxNzY2MzczMzEzfDA&ixlib=rb-4.1.0&q=80&w=800";
const IMG_YOKOHAMA = "https://images.unsplash.com/photo-1688636761616-fe7a83d1b5b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb2tvaGFtYSUyMGNpdHklMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc2NjM3MzMxM3ww&ixlib=rb-4.1.0&q=80&w=800";

const PLANS = [
  {
    id: 1,
    title: "富士山絶景周遊クルージング",
    desc: "世界遺産・富士山を上空から独り占め。四季折々の表情を見せる雄大な姿は一生の思い出に。",
    img: IMG_FUJI,
    time: "60分",
    price: 157200,
    tags: ["人気", "貸切"]
  },
  {
    id: 2,
    title: "東京ナイトクルーズ - SKY TREK 360",
    desc: "東京タワー、スカイツリー、レインボーブリッジ。宝石箱のような夜景を堪能する特別なプラン。",
    img: IMG_TOKYO,
    time: "20分",
    price: 47300,
    tags: ["夜景", "カップル"]
  },
  {
    id: 3,
    title: "横浜・みなとみらいコース",
    desc: "異国情緒あふれる港町・横浜。昼は爽快に、夜はロマンチックに。手軽に楽しめる人気コース。",
    img: IMG_YOKOHAMA,
    time: "10分",
    price: 19800,
    tags: ["手軽", "ファミリー"]
  }
];

const REASONS = [
  { icon: ShieldCheck, title: "安心と安全", desc: "国土交通省の認可を受けた航空運送事業者が運航。経験豊富なパイロットが安全第一でフライトを実施します。" },
  { icon: Award, title: "自由なサービス・スタッフ", desc: "サプライズ演出やプロポーズのお手伝いも。経験豊富なスタッフが、特別な一日をフルサポートします。" },
  { icon: Wallet, title: "リーズナブルな料金", desc: "業務効率化を徹底し、他社には真似できない価格を実現。もっと身近に空の旅を楽しんでいただけます。" },
];

const REVIEWS = [
  { title: "彼女へのプレゼントに", user: "20代男性", rating: 5, comment: "初めてのヘリコプターで不安でしたが、丁寧な対応で安心して楽しめました。夜景が本当に綺麗で、彼女も大喜びでした。" },
  { title: "プロポーズに", user: "30代男性", rating: 5, comment: "一生の思い出になりました。事前の打ち合わせもスムーズで、スタッフの方々の協力のおかげで無事成功しました。" },
  { title: "最高の体験でした", user: "40代女性", rating: 5, comment: "普段は見ることのできない角度からの東京は圧巻でした。パイロットの方のガイドも楽しく、家族全員大満足です。" },
  { title: "感動しました", user: "50代男性", rating: 5, comment: "人生で一度は乗ってみたいと思っていたヘリコプター。夕暮れ時のフライトは言葉を失う美しさでした。" },
];

const FLOW = [
  { icon: CalendarCheck, title: "予約申し込み", desc: "ウェブサイトの予約フォームから希望日時・コース・人数を選択して予約申し込み。最短当日のご予約も可能です。" },
  { icon: UserCheck, title: "確定とパイロットの確保", desc: "空き状況と運航機材・パイロットの調整を行い、確定メールをお送りします。手配完了となります。" },
  { icon: CreditCard, title: "事前決済", desc: "クレジットカードでの事前決済が可能です。当日は手ぶらでお越しいただけます。分割払いも可能です。" },
  { icon: Send, title: "ご搭乗", desc: "当日、指定時間の20分前までにヘリポートへお越しください。安全説明の後フライトへ出発します。" },
];

export default function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="font-sans text-slate-800 bg-white">
      <FrontHeader transparent={true} />
      
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-4 text-center mt-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg">
            空からの<br className="md:hidden"/>非日常体験をあなたに
          </h1>
          <p className="text-lg md:text-xl mb-10 opacity-90 drop-shadow-md">
            東京の絶景パノラマ。大切な人と特別なひとときを。
          </p>

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto text-left">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">プラン・場所</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none">
                    <option>東京 (Tokyo)</option>
                    <option>横浜 (Yokohama)</option>
                    <option>富士山 (Mt. Fuji)</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">搭乗日</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">人数</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none">
                    <option>2名</option>
                    <option>3名</option>
                    <option>1名</option>
                    <option>4名以上</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2" onClick={() => onNavigate('search')}>
                  <Search className="w-4 h-4" /> 検索
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 px-4 text-center bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">東京を空から眺めよう</h2>
          <p className="text-slate-600 leading-loose">
            普段は歩いて見上げる景色も、空から眺めれば全く違った表情を見せてくれます。<br/>
            記念日のお祝い、友人との特別な体験、外国からのゲストのおもてなしなど様々なシーンで利用できるプランをご用意。
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map(plan => (
            <div key={plan.id} className="group cursor-pointer" onClick={() => onNavigate('detail')}>
              <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3]">
                <img src={plan.img} alt={plan.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {plan.tags.map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{plan.title}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{plan.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                 <div className="text-xs font-medium text-slate-500">所要時間 <span className="text-blue-600 font-bold ml-1">{plan.time}</span></div>
                 <div className="text-right">
                   <span className="text-xs text-slate-400 mr-1">1機あたり</span>
                   <span className="text-lg font-bold text-slate-900">¥{plan.price.toLocaleString()}~</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
           <button className="inline-flex items-center text-blue-600 font-bold hover:underline" onClick={() => onNavigate('search')}>
             ヘリポートへのアクセスを確認する <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </div>
      </section>

      {/* REASONS */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-16">選ばれる理由</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {REASONS.map((reason, i) => (
              <div key={i} className="text-center px-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <reason.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{reason.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-16">お客様の声</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 mb-1">{review.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{review.user}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FLOW */}
      <section className="py-20 px-4 bg-white">
         <div className="max-w-7xl mx-auto">
           <h2 className="text-2xl font-bold text-center text-slate-900 mb-16">ご利用の流れ</h2>
           <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-blue-100 -z-10" />
              
              {FLOW.map((step, i) => (
                <div key={i} className="text-center relative bg-white md:bg-transparent pt-4 md:pt-0">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 border-4 border-white relative z-10">
                    <step.icon className="w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">{i + 1}</div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">{step.desc}</p>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20 px-4 text-center">
         <h2 className="text-2xl font-bold text-slate-900 mb-8">よくあるご質問</h2>
         <div className="flex justify-center gap-8 mb-10 text-sm font-medium text-slate-400 border-b border-slate-100 w-fit mx-auto pb-4">
            <span className="text-slate-900 border-b-2 border-slate-900 pb-4">ヘリコプターについて</span>
            <span>ご予約について</span>
            <span>ご搭乗に関して</span>
         </div>
         <div className="max-w-2xl mx-auto text-left space-y-4">
            {['機体は貸し切りですか？', 'ヘリコプターは何人乗りですか？', '天候が悪化した場合はどうなりますか？', '揺れはありますか？', '特別な記念日に使いたいのですが。'].map((q, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 flex justify-between items-center cursor-pointer group">
                 <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{q}</span>
                 <Plus className="w-4 h-4 text-slate-400" />
              </div>
            ))}
         </div>
      </section>

      <FrontFooter />
    </div>
  );
}
