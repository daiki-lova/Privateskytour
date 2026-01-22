"use client";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

export function NationwideTours() {
  const areas = [
    {
      name: "横浜",
      price: "¥51,000〜",
      unit: "/回 (貸切)",
      image: "https://images.unsplash.com/photo-1543932950-76d6b4a4d557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb2tvaGFtYSUyME1pbmF0byUyME1pcmFpJTIwbmlnaHQlMjBhZXJpYWx8ZW58MXx8fHwxNzY2MzY3ODU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "大阪",
      price: "¥38,000〜",
      unit: "/回 (貸切)",
      image: "https://images.unsplash.com/photo-1706053519616-1944acf8a3c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxPc2FrYSUyMGNpdHklMjBhZXJpYWwlMjB2aWV3JTIwZGF5fGVufDF8fHx8MTc2NjM2Nzg2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "京都内",
      price: "¥34,000〜",
      unit: "/回 (貸切)",
      image: "https://images.unsplash.com/photo-1574236170890-b7c8f6555734?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLeW90byUyMGFlcmlhbCUyMHZpZXclMjB0ZW1wbGV8ZW58MXx8fHwxNzY2MzY3ODY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "その他/広島など",
      price: "¥79,800〜",
      unit: "/回 (貸切)",
      image: "https://images.unsplash.com/photo-1740982947768-90d7dd011d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIaXJvc2hpbWElMjBNaXlhamltYSUyMGFlcmlhbHxlbnwxfHx8fDE3NjYzNjc4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="w-[93%] max-w-[1080px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            全国各地でお楽しみ頂けます
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            観光スポットや美しい夜景、自然あふれる絶景や歴史ある街並みなど、<br/>
            全国各地の空からしか見られない景色をお楽しみ頂けます。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg h-64 md:h-80"
            >
              <ImageWithFallback
                src={area.image}
                alt={area.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
              
              <div className="absolute bottom-6 left-6 text-white text-shadow-lg">
                <h3 className="text-2xl font-bold mb-1">{area.name}</h3>
                <div className="text-xl font-bold">
                  {area.price}
                  <span className="text-sm font-normal ml-1">{area.unit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
