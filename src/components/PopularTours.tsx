"use client";

import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { PLANS, Plan } from "./booking/constants";
import { MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface PopularToursProps {
  onPlanSelect?: (planId: string) => void;
}

export function PopularTours({ onPlanSelect }: PopularToursProps) {
  const sightseeingPlans = PLANS.filter(plan => plan.category === "sightseeing");
  const transferPlans = PLANS.filter(plan => plan.category === "transfer");

  const PlanGrid = ({ title, subtitle, plans, className }: { title: string, subtitle: string, plans: Plan[], className?: string }) => (
    <div className={cn("mb-20", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 max-w-2xl mx-auto">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group cursor-pointer"
            onClick={() => onPlanSelect?.(tour.id)}
          >
            <div className="flex flex-col h-full bg-white transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-5">
                <ImageWithFallback
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-vivid-blue transition-colors line-clamp-2">
                  {tour.title}
                </h3>
                
                {/* Price and Duration */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="font-bold text-vivid-blue">
                    ¥{tour.price.toLocaleString()}
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1">
                  {tour.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="plans" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1280px] w-full mx-auto relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            選べる2つのフライトスタイル
          </h2>
          <p className="text-slate-500 max-w-3xl mx-auto leading-loose text-lg">
            都内の名所を優雅に巡る「遊覧フライト」と、目的地へ快適に移動する「ヘリ送迎」。<br className="hidden md:inline"/>
            洗練された移動体験を、すべてのお客様へ。
          </p>
        </motion.div>

        <PlanGrid 
          title="遊覧フライト" 
          subtitle="東京の空を独り占めする、特別なひととき" 
          plans={sightseeingPlans} 
        />
        
        <PlanGrid 
          title="移動・送迎" 
          subtitle="渋滞知らずの空の旅で、目的地へ快適に" 
          plans={transferPlans} 
          className="mb-0"
        />
      </div>
    </section>
  );
}
