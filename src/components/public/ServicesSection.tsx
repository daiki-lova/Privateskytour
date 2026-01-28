"use client";

import { ShieldCheck, MessageSquareText, PiggyBank } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function ServicesSection() {
  const { t } = useTranslation();

  const services = [
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: t('services.safety.title'),
      description: t('services.safety.desc'),
    },
    {
      icon: <MessageSquareText className="h-10 w-10" />,
      title: t('services.flexibility.title'),
      description: t('services.flexibility.desc'),
    },
    {
      icon: <PiggyBank className="h-10 w-10" />,
      title: t('services.reasonable.title'),
      description: t('services.reasonable.desc'),
    }
  ];

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-[1080px] w-[93%] md:w-full mx-auto md:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-wide">
            {t('services.title')}
          </h2>
          <div className="w-16 h-[1px] bg-slate-300 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-x-8 lg:gap-x-12 gap-y-8 md:gap-y-12 lg:gap-y-16">
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
