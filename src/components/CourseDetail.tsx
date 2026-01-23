"use client";

import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Clock, Users, MapPin, ArrowLeft, CheckCircle2, Map, ExternalLink } from "lucide-react";
import { Plan } from "./booking/constants";
import { FAQSection } from "./public/FAQSection";

interface CourseDetailProps {
  plan: Plan;
  onBack: () => void;
  onBook: (planId: string) => void;
  accessPoint: {
      name: string;
      address: string;
      mapUrl: string;
  };
}

export function CourseDetail({ plan, onBack, onBook, accessPoint }: CourseDetailProps) {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">プラン一覧に戻る</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Main Image (16:9 ratio) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-100"
            >
              <ImageWithFallback
                src={plan.image}
                alt={plan.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Title & Description */}
            <section className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                {plan.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {plan.description}
              </p>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                <Clock className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">所要時間</span>
                <span className="text-lg font-bold text-slate-900">{plan.duration}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                <Users className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">定員</span>
                <span className="text-lg font-bold text-slate-900">最大 {plan.capacity || 3} 名</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100 hidden md:flex">
                <MapPin className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">出発地</span>
                <span className="text-lg font-bold text-slate-900">東京ヘリポート</span>
              </div>
            </div>

            {/* Route Map Section */}
            {plan.routeMapUrl && (
              <section className="bg-white p-8 rounded-3xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <span className="w-10 h-10 bg-vivid-blue text-white rounded-xl flex items-center justify-center mr-4">
                    <Map className="h-5 w-5" />
                  </span>
                  ルート案内
                </h2>
                <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 mb-8">
                  <ImageWithFallback
                    src={plan.routeMapUrl}
                    alt={`${plan.title} Route Map`}
                    className="w-full h-auto object-contain bg-white"
                  />
                </div>
                
                <div className="relative pl-8 border-l-2 border-slate-100 ml-4 space-y-8">
                  {plan.itinerary.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white border-4 border-vivid-blue" />
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-400">{item.time}</span>
                        <p className="text-slate-900 font-bold text-lg">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights */}
            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                 <span className="w-1.5 h-8 bg-vivid-blue rounded-full mr-4" />
                 プランの魅力
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <CheckCircle2 className="h-6 w-6 text-vivid-blue flex-shrink-0" />
                    <p className="text-slate-700 font-medium leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Detailed Description */}
            <section className="space-y-6">
               <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                 <span className="w-1.5 h-8 bg-vivid-blue rounded-full mr-4" />
                 コース詳細
              </h2>
              <p className="text-slate-600 leading-loose text-lg whitespace-pre-wrap">
                {plan.longDescription}
              </p>
            </section>
            
            {/* Access */}
            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <span className="w-10 h-10 bg-vivid-blue text-white rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="h-5 w-5" />
                </span>
                集合場所
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-lg font-bold text-slate-900">{accessPoint.name}</p>
                  <p className="text-slate-600 leading-relaxed">{accessPoint.address}</p>
                  <Button variant="outline" className="rounded-full border-slate-200" asChild>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accessPoint.name + " " + accessPoint.address)}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Mapsで開く
                    </a>
                  </Button>
                </div>
                <div className="rounded-2xl overflow-hidden h-64 border border-slate-200">
                  <iframe
                    src={accessPoint.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title={`${accessPoint.name} Map`}
                  ></iframe>
                </div>
              </div>
            </section>

            <FAQSection />
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-vivid-blue text-white p-8 rounded-3xl shadow-2xl">
                <div className="mb-8">
                  <p className="text-white/70 text-sm font-bold tracking-widest uppercase mb-2">一機あたり（税込）</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">¥{plan.price.toLocaleString()}</span>
                  </div>
                  {plan.returnPrice && (
                    <p className="text-white/70 text-sm mt-4 leading-relaxed">
                      ※日帰り往復の場合は +¥{plan.returnPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4 mb-8 text-sm text-white/80">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>最大定員</span>
                    <span className="text-white font-bold">{plan.capacity || 3}名</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>所要時間</span>
                    <span className="text-white font-bold">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>キャンセル料</span>
                    <span className="text-white font-bold">前日 50% / 当日 100%</span>
                  </div>
                </div>

                {parseInt(plan.duration) >= 30 && (
                  <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/20">
                    <p className="text-amber-300 text-xs font-bold tracking-wider mb-1 flex items-center">
                      <span className="w-2 h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></span>
                      SPECIAL OFFER
                    </p>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      30分以上のフライトをご予約の方は、<br/>
                      <span className="text-amber-300 font-bold">アルファードでの無料送迎</span>をご利用いただけます。
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => onBook(plan.id)}
                  className="w-full bg-white text-vivid-blue hover:bg-slate-100 py-8 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-[0.98]"
                >
                  このプランを予約する
                </Button>
                
                <p className="text-center text-xs text-white/50 mt-6">
                  ※天候によりフライトが中止となる場合がございます
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  団体・法人のお客様へ
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  定員を超える人数や、特別なチャーター、撮影のご相談も承っております。お気軽にお問い合わせください。
                </p>
                <Button variant="link" className="p-0 h-auto text-slate-900 font-bold hover:text-vivid-blue">
                  お問い合わせはこちら
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
