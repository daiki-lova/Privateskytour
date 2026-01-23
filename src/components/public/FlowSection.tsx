"use client";

import { ClipboardList, CalendarCheck, CreditCard, Plane } from "lucide-react";
import { motion } from "motion/react";

export function FlowSection() {
  const steps = [
    {
      icon: <ClipboardList className="h-10 w-10" />,
      title: "予約申し込み",
      description: "ウェブの予約フォームから希望日時・コース・人数などを入力・送信いただきます。お支払いはクレジットカード決済となります。",
      step: "01"
    },
    {
      icon: <CalendarCheck className="h-10 w-10" />,
      title: "確定とパイロットの確保",
      description: "空席があるか確認後パイロットの確保を行い、確定完了メールをお送りし、予約完了となります。",
      step: "02"
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "事前決済",
      description: "クレジットカード決済の案内が届きますので、事前決済をお願い致します。決済確認後、予約確定となります。",
      step: "03"
    },
    {
      icon: <Plane className="h-10 w-10" />,
      title: "ご搭乗",
      description: "当日は、指定時刻の20分前に所定の場所にお越しいただき、身分証の確認後フライトをお楽しみください。",
      step: "04"
    }
  ];

  return (
    <section id="flow" className="py-24 bg-white relative">
      <div className="max-w-[1080px] w-[93%] md:w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            ご利用の流れ
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-slate-200 -z-10">
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-300 rounded-full"></div>
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-vivid-blue shadow-sm group-hover:border-vivid-blue group-hover:shadow-md transition-all duration-300 z-10 relative">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -left-2 bg-vivid-blue text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-md z-20">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4 h-12 flex items-center justify-center">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed text-left lg:text-center">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
