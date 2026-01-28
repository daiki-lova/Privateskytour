"use client";

import { motion } from "motion/react";
import { MapPin, Train, Car, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export interface AccessPoint {
  id: string;
  name: string;
  nameEn?: string;
  address: string;
  addressEn?: string;
  trainAccess: string;
  trainAccessEn?: string;
  carAccess: string;
  carAccessEn?: string;
  mapUrl: string;
}

export const TOKYO_HELIPORT: AccessPoint = {
  id: "tokyo",
  name: "東京ヘリポート",
  nameEn: "Tokyo Heliport",
  address: "東京都江東区新木場4-7-25",
  addressEn: "4-7-25 Shinkiba, Koto-ku, Tokyo",
  trainAccess: "JR京葉線・りんかい線・東京メトロ有楽町線「新木場駅」よりバスで約5分",
  trainAccessEn: "Approx. 5 min by bus from Shinkiba Station (JR Keiyo Line, Rinkai Line, Tokyo Metro Yurakucho Line)",
  carAccess: "首都高速湾岸線「新木場IC」より約5分（無料駐車場あり）",
  carAccessEn: "Approx. 5 min from Shinkiba IC (Shuto Expressway Bayshore Route). Free parking available.",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3242.188289456748!2d139.8402513763787!3d35.64771597259806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601887eeb5555555%3A0x296415444634356e!2z5p2x5Lqs44OY44Oq44Od44O844OI!5e0!3m2!1sja!2sjp!4v1703056123456!5m2!1sja!2sjp"
};

export function AccessSection() {
  const { t, language } = useTranslation();

  const displayName = language === 'en' ? TOKYO_HELIPORT.nameEn : TOKYO_HELIPORT.name;
  const displayAddress = language === 'en' ? TOKYO_HELIPORT.addressEn : TOKYO_HELIPORT.address;
  const displayTrain = language === 'en' ? TOKYO_HELIPORT.trainAccessEn : TOKYO_HELIPORT.trainAccess;
  const displayCar = language === 'en' ? TOKYO_HELIPORT.carAccessEn : TOKYO_HELIPORT.carAccess;

  return (
    <section id="access" className="py-24 bg-white relative">
      <div className="max-w-[1280px] w-[93%] md:w-full mx-auto md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {t('access.title')}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-loose whitespace-pre-line">
            {t('access.description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden shadow-sm max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Google Map Embed */}
            <div className="h-64 sm:h-72 md:h-80 md:h-auto w-full relative">
              <iframe
                src={TOKYO_HELIPORT.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${displayName} Map`}
                className="absolute inset-0"
              ></iframe>
            </div>

            <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-white p-3 rounded-2xl text-vivid-blue shadow-sm flex-shrink-0 mt-1 border border-slate-100">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-2">{displayName}</h3>
                  <p className="text-slate-600">{displayAddress}</p>
                </div>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg text-slate-400 mt-0.5 border border-slate-100 shadow-sm">
                    <Train className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs mb-1 uppercase tracking-wider">{t('access.trainBus')}</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{displayTrain}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg text-slate-400 mt-0.5 border border-slate-100 shadow-sm">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs mb-1 uppercase tracking-wider">{t('access.car')}</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{displayCar}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Button
                  className="w-full bg-vivid-blue text-white hover:bg-vivid-blue/90 font-bold py-6 rounded-xl group"
                  asChild
                >
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((displayName || "") + " " + (displayAddress || ""))}`} target="_blank" rel="noopener noreferrer">
                    {t('access.viewMap')}
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
