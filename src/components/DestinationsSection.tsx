"use client";

import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState } from "react";
import { PLANS } from "./booking/constants";

interface DestinationsSectionProps {
  onPlanSelect?: (planId: string) => void;
}

export function DestinationsSection({ onPlanSelect }: DestinationsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "すべてのプラン" },
    { id: "tokyo", name: "東京" },
    { id: "yokohama", name: "横浜" },
    { id: "fuji", name: "富士山・その他" }
  ];

  const filteredDestinations = selectedCategory === "all" 
    ? PLANS 
    : PLANS.filter(dest => {
        if (selectedCategory === "fuji") {
            return dest.title.includes("富士") || dest.description.includes("富士") || dest.area.includes("富士") || dest.area.includes("箱根") || dest.area.includes("伊豆");
        }
        return dest.area.toLowerCase().includes(selectedCategory) || (selectedCategory === "tokyo" && dest.area === "東京");
    });

  return (
    <section id="destinations" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            人気の遊覧プラン
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            東京発を中心に、洗練された空の旅をご提案いたします。<br/>
            心に残る特別な時間をお過ごしください。
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-8 py-2.5 rounded-full transition-all duration-300 text-sm font-medium border ${
                selectedCategory === category.id
                  ? "bg-vivid-blue text-white border-vivid-blue shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => onPlanSelect?.(destination.id)}
            >
              <Card className="h-full overflow-hidden border-0 bg-white group-hover:-translate-y-1 transition-all duration-500 shadow-none hover:shadow-none">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6">
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-vivid-blue transition-colors">
                    {destination.title}
                  </h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-2">
                    {destination.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
