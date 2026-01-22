"use client";

import { Award, Globe, Users, ShieldCheck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

export function AboutSection() {
  const stats = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      number: "100%",
      label: "安全運航率"
    },
    {
      icon: <Users className="h-6 w-6" />,
      number: "50,000+",
      label: "年間搭乗者数"
    },
    {
      icon: <Award className="h-6 w-6" />,
      number: "4.9",
      label: "顧客満足度"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      number: "30+",
      label: "飛行コース数"
    }
  ];

  return (
    <section id="about" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1080px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1729205747621-b12ed268e7e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxpY29wdGVyJTIwZmx5aW5nJTIwYmx1ZSUyMHNreSUyMGNpdHklMjBhZXJpYWwlMjBsdXh1cnl8ZW58MXx8fHwxNzY2MDI0MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="SkyView Helicopter"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-vivid-blue/10 mix-blend-multiply" />
            </div>
            
            <div className="absolute -bottom-12 -right-12 bg-vivid-blue text-white p-12 hidden md:block">
                <p className="text-4xl font-light tracking-widest mb-2">No.1</p>
                <p className="text-xs uppercase tracking-[0.3em] opacity-80 font-bold">Market Share</p>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xs font-bold text-vivid-blue uppercase tracking-[0.5em] mb-8">About SkyView</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                上質な空の旅を、<br/>もっと身近に。
              </h3>
              <p className="text-slate-500 leading-loose text-lg font-medium">
                SkyViewは、洗練された移動体験を提供する日本最大級のヘリコプタープラットフォームです。
                厳格な安全基準をクリアした運航会社との提携により、都心の遊覧から地方への送迎まで、
                圧倒的な信頼と実績でお応えします。
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-3 text-vivid-blue mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
