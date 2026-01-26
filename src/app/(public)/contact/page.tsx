"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export default function ContactPage() {
  const { language } = useTranslation();

  const contactInfo = [
    {
      icon: Mail,
      labelJa: "メール",
      labelEn: "Email",
      value: "info@privatesky.co.jp",
      href: "mailto:info@privatesky.co.jp",
    },
    {
      icon: Phone,
      labelJa: "電話",
      labelEn: "Phone",
      value: "03-4446-6125",
      href: "tel:03-4446-6125",
    },
    {
      icon: MapPin,
      labelJa: "所在地",
      labelEn: "Address",
      valueJa: "〒104-0061\n東京都中央区銀座1丁目15-4\n銀座一丁目ビル 7階",
      valueEn: "Ginza 1-Chome Building 7F\n1-15-4 Ginza, Chuo-ku\nTokyo 104-0061, Japan",
    },
    {
      icon: Clock,
      labelJa: "営業時間",
      labelEn: "Business Hours",
      valueJa: "10:00 - 18:00（土日祝休み）",
      valueEn: "10:00 - 18:00 (Closed on weekends & holidays)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ja" ? "お問い合わせ" : "Contact Us"}
          </h1>
          <p className="text-slate-300 text-lg">
            {language === "ja"
              ? "ご質問・ご相談など、お気軽にお問い合わせください"
              : "Please feel free to contact us with any questions"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                {language === "ja" ? "連絡先情報" : "Contact Information"}
              </h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">
                        {language === "ja" ? item.labelJa : item.labelEn}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-slate-900 hover:text-vivid-blue transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-900 whitespace-pre-line">
                          {language === "ja"
                            ? item.valueJa || item.value
                            : item.valueEn || item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-sm text-blue-800">
                {language === "ja"
                  ? "お問い合わせ内容によっては、回答までにお時間をいただく場合がございます。予めご了承ください。"
                  : "Depending on the nature of your inquiry, it may take some time to respond. Thank you for your understanding."}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
