"use client";

import { ShieldCheck, MessageSquareText, PiggyBank } from "lucide-react";
import { motion } from "motion/react";

export function ServicesSection() {
  const services = [
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "安心と安全",
      description: "国土交通省の認可を受けた航空運送事業者及び航空機使用事業者が運航を担当します。機体や運航の管理体制も厳重な基準をクリアしたパイロットが安全な空の旅へとご案内いたします。",
    },
    {
      icon: <MessageSquareText className="h-10 w-10" />,
      title: "自由なサービス・スタッフ",
      description: "経験豊富でフレンドリーなスタッフがお客様のご要望にお応えします。また、撮影スタッフ、現地案内係などもオプションで手配、花束・演出なども相談可能です。",
    },
    {
      icon: <PiggyBank className="h-10 w-10" />,
      title: "リーズナブルな料金",
      description: "業界最安値を目指し、納得価格でご案内。季節ごとのキャンペーンも実施しております。リーズナブルな価格で感動の体験を！記念日デートやサプライズにも4万円台とお手頃です。",
    }
  ];

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-[1080px] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-wide">
            選ばれる理由
          </h2>
          <div className="w-16 h-[1px] bg-slate-300 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-6 rounded-full bg-slate-50 text-vivid-blue shadow-sm border border-slate-100/50">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-wide">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
