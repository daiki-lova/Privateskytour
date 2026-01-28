"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function FAQSection() {
  const { t, language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("helicopter");

  const categories = [
    { id: "helicopter", name: t('faq.categories.helicopter') },
    { id: "booking", name: t('faq.categories.booking') },
    { id: "boarding", name: t('faq.categories.boarding') }
  ];

  const faqsData = {
    helicopter: [
      {
        question: { ja: "機体は貸し切りですか？", en: "Is the flight private?" },
        answer: { ja: "はい、貸し切りとなります。その為、2名様でご搭乗頂いた場合でも3名様でご搭乗頂いた場合でもトータルの金額は変わりません。", en: "Yes, all flights are private. The total price remains the same whether you fly with 2 or 3 passengers." }
      },
      {
        question: { ja: "ヘリコプターは何人乗りですか？", en: "How many people can ride in the helicopter?" },
        answer: { ja: "3人乗りです。パイロットを除いて最大3名のお客様がご搭乗いただけます。", en: "The helicopter seats up to 3 passengers excluding the pilot." }
      },
      {
        question: { ja: "欠航する場合はどのような時ですか？", en: "Under what conditions are flights cancelled?" },
        answer: { ja: "雨天や、相当な強風時など、ヘリコプターの安全な運航に支障をきたす可能性がある場合、欠航となります。その場合、フライトができないと判断された時点で、速やかにお客様にご連絡差し上げます。", en: "Flights are cancelled when weather conditions such as rain or strong winds pose a risk to safe operation. We will notify you promptly as soon as a cancellation is decided." }
      },
      {
        question: { ja: "揺れはありますか？", en: "Is there much vibration or turbulence?" },
        answer: { ja: "当日の気流の状態によりますが、大型旅客機と比較すると揺れを感じやすい場合があります。ただし、安全運航に支障のある揺れが予想される場合は欠航となりますのでご安心ください。", en: "Depending on air currents, you may feel more movement than in a large airliner. Rest assured that flights are cancelled if turbulence beyond safety standards is expected." }
      },
      {
        question: { ja: "飛行高度はどのくらいですか？", en: "At what altitude do we fly?" },
        answer: { ja: "通常、高度400m〜600m程度を飛行します。東京タワーやスカイツリーを間近に感じられる迫力ある高さです。", en: "We typically fly at an altitude of 400m to 600m. This provides a stunning and powerful view of landmarks like Tokyo Tower and Skytree up close." }
      },
      {
        question: { ja: "安全性について教えてください。", en: "What about flight safety?" },
        answer: { ja: "国土交通省の認可を受けた航空運送事業者が運航を行います。ベテランのパイロットと整備士が、法令に基づいた厳格な安全管理体制のもと運航しております。", en: "Flights are operated by air transport businesses authorized by the MLIT. Experienced pilots and mechanics operate under strict safety management systems in accordance with laws." }
      }
    ],
    booking: [
      {
        question: { ja: "空き状況はどこで確認できますか？", en: "Where can I check availability?" },
        answer: { ja: "お問合わせフォームや各ツアーの予約フォームからお問合わせ下さい。お電話（03-4446-6125）からでもお問い合わせ頂けます。", en: "Please inquire via our contact form or the booking form for each tour. You can also call us at 03-4446-6125." }
      },
      {
        question: { ja: "予約はどのように行えばいいですか？", en: "How do I make a booking?" },
        answer: { ja: "ご予約の際は、予約フォームを通じてお申し込み下さい。お申込み頂いた後、弊社がヘリコプターの空き状況を確認し、お客様へご連絡差し上げます。", en: "Please apply via the booking form. After submission, we will check helicopter availability and contact you." }
      },
      {
        question: { ja: "いつ予約が完了するのですか？", en: "When is my booking officially confirmed?" },
        answer: { ja: "お振込み又はカードの決済が確認できた時点で最終確定となります。お申込み頂いた時点では仮予約です。", en: "Booking is finalized once your transfer or credit card payment is confirmed. The initial request is considered a provisional booking." }
      },
      {
        question: { ja: "カード決済は可能ですか？", en: "Are credit card payments accepted?" },
        answer: { ja: "はい、可能です。主要なクレジットカード（VISA, MasterCard, AMEX, JCB, Diners）をご利用いただけます。", en: "Yes. Major credit cards (VISA, MasterCard, AMEX, JCB, Diners) are accepted." }
      },
      {
        question: { ja: "キャンセル料は発生しますか？", en: "Are there cancellation fees?" },
        answer: { ja: "天候不良等により、フライトができないと判断された場合、お支払い頂いた金額につきましては全額払い戻し致します。ただし、お客様都合によるキャンセルの場合は、7日前までにキャンセルのご連絡を頂かないとキャンセル料が発生します。（4日前まで：30%、2日前まで：50%、前日〜当日：100%）", en: "If we cancel due to weather, you will receive a full refund. For customer-initiated cancellations, fees apply unless notified 7 days in advance: 30% (up to 4 days), 50% (up to 2 days), 100% (day before or same day)." }
      },
      {
        question: { ja: "当日の予約は可能ですか？", en: "Can I book for the same day?" },
        answer: { ja: "空き状況によりますが、可能です。お急ぎの場合はお電話にてお問い合わせください。", en: "Depending on availability, same-day bookings may be possible. Please call us for urgent requests." }
      },
      {
        question: { ja: "サプライズやプロポーズで利用したいのですが。", en: "I'd like to use it for a surprise or proposal." },
        answer: { ja: "大歓迎です。花束の手配（有料）や、機内での演出などのご相談も承っております。特別な日を演出できるようスタッフ一同サポートさせていただきます。", en: "We would be delighted! We can arrange bouquets (fees apply) and support special in-flight surprises. Our staff are happy to help make your special day perfect." }
      }
    ],
    boarding: [
      {
        question: { ja: "集合時間はフライトの何分前ですか？", en: "What time should I arrive?" },
        answer: { ja: "集合時間は、フライト予定時刻の20分前までにお願いしております。保安検査や搭乗説明のお時間が必要となります。", en: "Please arrive 20 minutes before your scheduled flight time for security checks and boarding instructions." }
      },
      {
        question: { ja: "機内で会話はできますか？", en: "Can we talk during the flight?" },
        answer: { ja: "ヘッドセットを通じて会話することが可能です。パイロットからの案内も聞こえますし、お客様同士でお話しいただけます。", en: "Yes, you can talk via headsets. You will also hear announcements from the pilot and can converse with fellow passengers." }
      },
      {
        question: { ja: "機内で飲食はできますか？", en: "Can we eat or drink on board?" },
        answer: { ja: "機内でのご飲食はご遠慮頂いております。また、酒気帯び状態でのご搭乗はお断りさせていただく場合がございます。", en: "Eating and drinking are not permitted on board. We may also refuse boarding to passengers under the influence of alcohol." }
      },
      {
        question: { ja: "カメラの持ち込みは可能ですか？", en: "Can I bring a camera?" },
        answer: { ja: "はい、可能です。ただし、フラッシュ撮影はパイロットの操縦の妨げになるため禁止されております。また、自撮り棒の使用も安全上の理由からご遠慮ください。", en: "Yes. However, flash photography is prohibited as it interferes with piloting. Selfie sticks are also restricted for safety reasons." }
      },
      {
        question: { ja: "どのような服装が良いですか？", en: "What kind of clothing is recommended?" },
        answer: { ja: "普段着で問題ありませんが、ヒールの高い靴やサンダルは安全上好ましくありません。動きやすい靴でのご搭乗をおすすめします。", en: "Casual clothes are fine, but high heels or sandals are discouraged for safety. We recommend comfortable footwear." }
      },
      {
        question: { ja: "子供も搭乗できますか？", en: "Can children fly?" },
        answer: { ja: "3歳以上のお子様からご搭乗いただけます。12歳未満のお子様には保護者の同伴が必要です。", en: "Children ages 3 and up can fly. Children under 12 must be accompanied by a guardian." }
      },
      {
        question: { ja: "大きな荷物は持ち込めますか？", en: "Can I bring large luggage?" },
        answer: { ja: "ヘリコプター内のスペースには限りがあるため、大きなお荷物はヘリポートのロッカーまたは受付にてお預かりさせていただきます。貴重品のみお持ち込みください。", en: "Space is limited on the helicopter. Large luggage can be stored in lockers or at reception. Please only bring valuables on board." }
      },
      {
        question: { ja: "妊娠中でも搭乗できますか？", en: "Can I fly while pregnant?" },
        answer: { ja: "お身体への負担を考慮し、安定期に入っていない方や出産予定日間近の方のご搭乗はご遠慮いただいております。また、念のため事前にかかりつけのお医者様にご相談されることをおすすめします。", en: "For health reasons, we discourage boarding for those not in their stable period or nearing their due date. We recommend consulting your doctor beforehand." }
      }
    ]
  };

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="max-w-[1080px] w-[93%] md:w-full mx-auto md:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {t('faq.title')}
          </h2>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-center gap-4 mb-12 border-b border-slate-200 pb-4 md:pb-0"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pb-4 px-6 text-lg font-medium transition-colors relative ${activeCategory === cat.id
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {cat.name}
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-vivid-blue"
                />
              )}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-50 rounded-2xl p-6 md:p-10"
        >
          <h3 className="text-xl font-bold mb-6 text-slate-900 border-l-4 border-vivid-blue pl-4">
            {categories.find(c => c.id === activeCategory)?.name}
          </h3>

          <Accordion type="single" collapsible className="w-full">
            {faqsData[activeCategory as keyof typeof faqsData].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-slate-200 last:border-0">
                <AccordionTrigger className="text-left font-bold text-slate-800 hover:text-vivid-blue hover:no-underline py-4 text-base">
                  {language === 'en' ? faq.question.en : faq.question.ja}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-base pb-4">
                  {language === 'en' ? faq.answer.en : faq.answer.ja}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
