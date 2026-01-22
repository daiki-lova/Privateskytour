"use client";

import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "./ui/carousel";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";

export function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const testimonials = [
    {
      title: "両親の記念日に",
      user: "30代女性",
      comment: "私の両親のヘリコプター体験を誕生日プレゼントとして予約させて頂きましたが、私にとっても忘れられない素敵な時間を共有できました。",
      rating: 5
    },
    {
      title: "彼女へのプレゼントに",
      user: "20代男性",
      comment: "初めての誕生日プレゼントで空の旅をお願いしました。サプライズ演出にもスタッフの皆様が快く協力してくれたおかげで、彼女も涙を流して喜んでくれました。",
      rating: 5
    },
    {
      title: "プロポーズに",
      user: "30代男性",
      comment: "一生の思い出になりました。夜景の美しさはもちろんですが、スタッフの方の事前の段取りや協力のおかげでプロポーズも成功し、最高の瞬間でした。",
      rating: 5
    },
    {
      title: "最高の夜景でした",
      user: "40代男性",
      comment: "東京の夜景がこれほど綺麗だとは思いませんでした。パイロットの方のガイドも素晴らしく、安心して楽しめました。",
      rating: 5
    },
    {
        title: "感動しました",
        user: "20代女性",
        comment: "人生で一度は乗ってみたかったヘリコプター。夢が叶いました！スタッフの方もとても親切で、また絶対に利用したいです。",
        rating: 5
    }
  ];

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-[1080px] w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            お客様の声
          </h2>
        </motion.div>

        <div className="w-full">
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-4 pb-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/4">
                  <div className="h-full p-2">
                    <Card className="h-full border-none shadow-lg bg-white">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex flex-col mb-3 border-b pb-3">
                            <h3 className="font-bold text-base text-slate-900 mb-1">
                                {testimonial.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-500">
                                  {testimonial.user}
                                </p>
                                <div className="flex text-yellow-400">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={12} fill="currentColor" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-slate-600 text-xs leading-relaxed text-left">
                          {testimonial.comment}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === current ? "w-8 bg-vivid-blue" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
