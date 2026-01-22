"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { motion } from "motion/react";
import { useState } from "react";

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("helicopter");

  const categories = [
    { id: "helicopter", name: "ヘリコプターについて" },
    { id: "booking", name: "ご予約について" },
    { id: "boarding", name: "ご搭乗に際して" }
  ];

  const faqs = {
    helicopter: [
      {
        question: "機体は貸し切りですか？",
        answer: "はい、貸し切りとなります。その為、2名様でご搭乗頂いた場合でも3名様でご搭乗頂いた場合でもトータルの金額は変わりません。"
      },
      {
        question: "ヘリコプターは何人乗りですか？",
        answer: "3人乗りです。パイロットを除いて最大3名のお客様がご搭乗いただけます。"
      },
      {
        question: "欠航する場合はどのような時ですか？",
        answer: "雨天や、相当な強風時など、ヘリコプターの安全な運航に支障をきたす可能性がある場合、欠航となります。その場合、フライトができないと判断された時点で、速やかにお客様にご連絡差し上げます。"
      },
      {
        question: "揺れはありますか？",
        answer: "当日の気流の状態によりますが、大型旅客機と比較すると揺れを感じやすい場合があります。ただし、安全運航に支障のある揺れが予想される場合は欠航となりますのでご安心ください。"
      },
      {
        question: "飛行高度はどのくらいですか？",
        answer: "通常、高度400m〜600m程度を飛行します。東京タワーやスカイツリーを間近に感じられる迫力ある高さです。"
      },
      {
        question: "安全性について教えてください。",
        answer: "国土交通省の認可を受けた航空運送事業者が運航を行います。ベテランのパイロットと整備士が、法令に基づいた厳格な安全管理体制のもと運航しております。"
      }
    ],
    booking: [
      {
        question: "空き状況はどこで確認できますか？",
        answer: "お問合わせフォームや各ツアーの予約フォームからお問合わせ下さい。お電話（03-4446-6125）からでもお問い合わせ頂けます。"
      },
      {
        question: "予約はどのように行えばいいですか？",
        answer: "ご予約の際は、予約フォームを通じてお申し込み下さい。お申込み頂いた後、弊社がヘリコプターの空き状況を確認し、お客様へご連絡差し上げます。"
      },
      {
        question: "いつ予約が完了するのですか？",
        answer: "お振込み又はカードの決済が確認できた時点で最終確定となります。お申込み頂いた時点では仮予約です。"
      },
      {
        question: "カード決済は可能ですか？",
        answer: "はい、可能です。主要なクレジットカード（VISA, MasterCard, AMEX, JCB, Diners）をご利用いただけます。"
      },
      {
        question: "キャンセル料は発生しますか？",
        answer: "天候不良等により、フライトができないと判断された場合、お支払い頂いた金額につきましては全額払い戻し致します。ただし、お客様都合によるキャンセルの場合は、4日前までにキャンセルのご連絡を頂かないとキャンセル料が発生します。（3日前～前日：50%、当日：100%）"
      },
      {
        question: "当日の予約は可能ですか？",
        answer: "空き状況によりますが、可能です。お急ぎの場合はお電話にてお問い合わせください。"
      },
      {
        question: "サプライズやプロポーズで利用したいのですが。",
        answer: "大歓迎です。花束の手配（有料）や、機内での演出などのご相談も承っております。特別な日を演出できるようスタッフ一同サポートさせていただきます。"
      }
    ],
    boarding: [
      {
        question: "集合時間はフライトの何分前ですか？",
        answer: "集合時間は、フライト予定時刻の20分前までにお願いしております。保安検査や搭乗説明のお時間が必要となります。"
      },
      {
        question: "機内で会話はできますか？",
        answer: "ヘッドセットを通じて会話することが可能です。パイロットからの案内も聞こえますし、お客様同士でお話しいただけます。"
      },
      {
        question: "機内で飲食はできますか？",
        answer: "機内でのご飲食はご遠慮頂いております。また、酒気帯び状態でのご搭乗はお断りさせていただく場合がございます。"
      },
      {
        question: "カメラの持ち込みは可能ですか？",
        answer: "はい、可能です。ただし、フラッシュ撮影はパイロットの操縦の妨げになるため禁止されております。また、自撮り棒の使用も安全上の理由からご遠慮ください。"
      },
      {
        question: "どのような服装が良いですか？",
        answer: "普段着で問題ありませんが、ヒールの高い靴やサンダルは安全上好ましくありません。動きやすい靴でのご搭乗をおすすめします。"
      },
      {
        question: "子供も搭乗できますか？",
        answer: "3歳以上のお子様からご搭乗いただけます。12歳未満のお子様には保護者の同伴が必要です。"
      },
      {
        question: "大きな荷物は持ち込めますか？",
        answer: "ヘリコプター内のスペースには限りがあるため、大きなお荷物はヘリポートのロッカーまたは受付にてお預かりさせていただきます。貴重品のみお持ち込みください。"
      },
      {
        question: "妊娠中でも搭乗できますか？",
        answer: "お身体への負担を考慮し、安定期に入っていない方や出産予定日間近の方のご搭乗はご遠慮いただいております。また、念のため事前にかかりつけのお医者様にご相談されることをおすすめします。"
      }
    ]
  };

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="max-w-[1080px] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            よくあるご質問
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
                    className={`pb-4 px-6 text-lg font-medium transition-colors relative ${
                        activeCategory === cat.id 
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
            {faqs[activeCategory as keyof typeof faqs].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-slate-200 last:border-0">
                <AccordionTrigger className="text-left font-bold text-slate-800 hover:text-vivid-blue hover:no-underline py-4 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-base pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
