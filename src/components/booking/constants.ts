// Route map placeholder images (replace with actual assets later)
const imgSightseeingCommon = "/images/route-maps/sightseeing-common.png";
const imgRouteHakone = "/images/route-maps/hakone.png";
const imgRouteYamanakako = "/images/route-maps/yamanakako.png";
const imgRouteIzu = "/images/route-maps/izu.png";
const imgRouteIse = "/images/route-maps/ise.png";

export interface Plan {
  id: string;
  heliportId: string;
  title: string;
  subtitle?: string;
  capacity?: number;
  duration: string;
  price: number;
  image: string;
  description: string;
  category: "sightseeing" | "transfer";
  area: string;
  rating: number;
  popular: boolean;
  highlights: string[];
  itinerary: { time: string; activity: string }[];
  longDescription: string;
  routeMapUrl?: string;
  returnPrice?: number; // Optional return price for same-day return
}

export const PLANS: Plan[] = [
  // --- Sightseeing Plans ---
  {
    id: "sightseeing-1",
    heliportId: "tokyo",
    title: "東京ショートツアー",
    subtitle: "Tokyo Twin Icons Helicopter Tour",
    capacity: 3,
    duration: "15分",
    price: 109500,
    image: "https://images.unsplash.com/photo-1668563966338-38394330adf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGhlbGljb3B0ZXIlMjB2aWV3JTIwc2t5dHJlZXxlbnwxfHx8fDE3Njg1MjM4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "東京スカイツリー、東京タワー、レインボーブリッジなど、東京の有名な観光名所を眺めることが出来ます。その中でも一番の見所は東京スカイツリーです。低層の建物が密集する中、空に向かって真っすぐ伸びる姿は圧巻です。",
    category: "sightseeing",
    area: "東京",
    rating: 4.8,
    popular: true,
    highlights: ["東京スカイツリー至近", "東京タワー・レインボーブリッジ", "都心ショートクルーズ"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "7分", activity: "スカイツリー周辺" },
      { time: "15分", activity: "東京ヘリポート着陸" }
    ],
    longDescription: "東京の観光名所を気軽に楽しみたい方にお勧めのツアーです。晴れの日はもちろん、曇り空でも幻想的な雰囲気を味わえます。",
    routeMapUrl: imgSightseeingCommon
  },
  {
    id: "sightseeing-2",
    heliportId: "tokyo",
    title: "東京パノラマクルーズ",
    subtitle: "Tokyo Highlight Helicopter Cruise",
    capacity: 3,
    duration: "30分",
    price: 219000,
    image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.1.0&q=80&w=1080&auto=format&fit=crop",
    description: "東京の主要スポットを30分で巡る充実のコース。レインボーブリッジ、お台場、東京タワー、スカイツリー、銀座、東京駅など、東京の魅力を余すことなく堪能できます。",
    category: "sightseeing",
    area: "東京",
    rating: 4.9,
    popular: true,
    highlights: ["東京全域を網羅", "主要ランドマーク一望", "たっぷり30分フライト"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "15分", activity: "都心上空周遊" },
      { time: "30分", activity: "東京ヘリポート着陸" }
    ],
    longDescription: "30分間の空の旅で、東京の地形と都市の美しさを完全に把握できる、満足度の高いプランです。",
    routeMapUrl: imgSightseeingCommon
  },
  {
    id: "sightseeing-3",
    heliportId: "tokyo",
    title: "東京・横浜クルーズ",
    subtitle: "Tokyo & Yokohama Panorama Helicopter Cruise",
    capacity: 3,
    duration: "45分",
    price: 328500,
    image: "https://images.unsplash.com/photo-1543932950-b8cd4d139a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2tvaGFtYSUyMG1pbmF0byUyMG1pcmFpJTIwYWVyaWFsJTIwbmlnaHR8ZW58MXx8fHwxNzY4NTIzODEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "東京のダイナミックな都市景観と、横浜みなとみらいの洗練された港町の風景を両方楽しめる贅沢なロングクルーズ。日中はもちろん、夕暮れや夜景の時間帯もおすすめです。",
    category: "sightseeing",
    area: "東京・横浜",
    rating: 5.0,
    popular: false,
    highlights: ["東京と横浜の2都市周遊", "みなとみらい絶景", "45分のロングフライト"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "20分", activity: "横浜みなとみらい" },
      { time: "45分", activity: "東京ヘリポート着陸" }
    ],
    longDescription: "東京湾を縦断し、二つの大都市の表情を見比べる優雅なひとときをお過ごしください。",
    routeMapUrl: imgSightseeingCommon
  },
  {
    id: "sightseeing-4",
    heliportId: "tokyo",
    title: "富士山プレミアム・ヘリコプタージャーニー",
    subtitle: "Mt. Fuji Premium Helicopter Journey",
    capacity: 3,
    duration: "90分",
    price: 657000,
    image: "https://images.unsplash.com/photo-1582111463839-56a9128b0567?ixlib=rb-4.1.0&q=80&w=1080&auto=format&fit=crop",
    description: "東京ヘリポートから芦ノ湖までは少しストレートに、箱根山の左上で折り返すイメージで、富士山の雄姿を存分に味わうプレミアムな90分コースです。都内と東京ヘリポート間の無料送迎付き。",
    category: "sightseeing",
    area: "富士山",
    rating: 5.0,
    popular: true,
    highlights: ["富士山周遊", "90分のロングジャーニー", "無料送迎付き"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "45分", activity: "富士山・箱根周遊" },
      { time: "90分", activity: "東京ヘリポート着陸" }
    ],
    longDescription: "富士山を味わい尽くす、至高の空の旅。",
    routeMapUrl: imgSightseeingCommon
  },

  // --- Transfer Plans ---
  {
    id: "transfer-1",
    heliportId: "tokyo",
    title: "東京 → 箱根",
    subtitle: "Hakone Helicopter Transfer",
    capacity: 3,
    duration: "30分",
    price: 440000,
    returnPrice: 60000,
    image: "https://images.unsplash.com/photo-1715134588078-4646f828b2ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWtvbmUlMjBsYWtlJTIwYXNoaSUyMGFlcmlhbCUyMHZpZXd8ZW58MXx8fHwxNzY4NTIzODEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "東京から箱根・仙石原へは、ヘリコプターでわずか30分。眼下には箱根山の雄大な稜線と、静かに佇む芦ノ湖の景色が広がります。渋滞知らずの移動で、時間そのものを体験に変える極上の移動手段です。",
    category: "transfer",
    area: "箱根",
    rating: 4.9,
    popular: true,
    highlights: ["芦ノ湖・箱根山", "仙石原直行", "都内・ヘリポート間無料送迎付"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "30分", activity: "箱根仙石原到着" }
    ],
    longDescription: "都会の喧騒から、わずか30分で温泉 and 自然の聖地へ。日帰り往復も可能です。",
    routeMapUrl: imgRouteHakone
  },
  {
    id: "transfer-2",
    heliportId: "tokyo",
    title: "東京 → 富士山 (山中湖)",
    subtitle: "Mt. Fuji Area Helicopter Transfer",
    capacity: 3,
    duration: "30分",
    price: 440000,
    returnPrice: 60000,
    image: "https://images.unsplash.com/photo-1745696271626-9ff95dd69593?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdCUyMGZ1amklMjBoZWxpY29wdGVyJTIwdmlldyUyMGFlcmlhbHxlbnwxfHx8fDE3Njg1MjM4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "東京を離陸してわずか30分。視界いっぱいに現れるのは、空からこそ実感できる富士山の圧倒的なスケールと、その麓に広がる山中湖の穏やかな風景です。澄んだ空気と広大な自然に包まれながら、湖畔の散策や絶景スポット巡りなどをお楽しみください。",
    category: "transfer",
    area: "富士山",
    rating: 5.0,
    popular: true,
    highlights: ["富士山・山中湖", "圧倒的スケール", "都内・ヘリポート間無料送迎付"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "30分", activity: "山中湖到着" }
    ],
    longDescription: "日本一の山を、特等席から眺める贅沢なアプローチ。",
    routeMapUrl: imgRouteYamanakako
  },
  {
    id: "transfer-3",
    heliportId: "tokyo",
    title: "東京 → 伊豆湯ヶ島・修善寺",
    subtitle: "Izu Area Helicopter Transfer",
    capacity: 3,
    duration: "45分",
    price: 690000,
    image: "https://images.unsplash.com/photo-1653047016021-2c3f8e95ab41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpenUlMjBwZW5pbnN1bGElMjBqYXBhbiUyMGFlcmlhbCUyMGNvYXN0bGluZXxlbnwxfHx8fDE3Njg1MjM4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "向かう先は、山々と清流に囲まれた伊豆湯ヶ島と、歴史ある温泉地修善寺です。古くから人々が心身を休めるために訪れてきたこの地へ、ヘリコプターなら約45分。渋滞や人混みから解放され、移動そのものも快適な体験に。",
    category: "transfer",
    area: "伊豆",
    rating: 4.8,
    popular: false,
    highlights: ["伊豆の山々と海岸線", "歴史ある温泉地へ直行", "1泊2日は片道料金×2"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "45分", activity: "伊豆・修善寺到着" }
    ],
    longDescription: "日本の自然と穏やかな日常に触める、シンプルで贅沢なひとときを。",
    routeMapUrl: imgRouteIzu
  },
  {
    id: "transfer-4",
    heliportId: "tokyo",
    title: "東京 → 伊勢志摩",
    subtitle: "Iseshima Helicopter Transfer",
    capacity: 3,
    duration: "100分",
    price: 980000,
    image: "https://images.unsplash.com/photo-1593179807637-504c0232179f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZ28lMjBCYXklMjBTaGltYSUyMEphcGFuJTIwYWVyaWFsfGVufDF8fHx8MTc2OTA1MjU1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "東京を離陸し、ヘリコプターで伊勢志摩へ。東京から1時間40分のフライト旅行。眼下には、穏やかな海と入り組んだ海岸線が美しい英虞湾の風景が広がります。伊勢神宮やアマネムなど、静かな自然に身を委ねる上質な滞在を。",
    category: "transfer",
    area: "伊勢志摩",
    rating: 5.0,
    popular: false,
    highlights: ["英虞湾のリアス式海岸", "伊勢神宮・アマネム", "ロングフライト"],
    itinerary: [
      { time: "0分", activity: "東京ヘリポート離陸" },
      { time: "100分", activity: "伊勢志摩到着" }
    ],
    longDescription: "日本の精神文化の中心へ、最も優雅な巡礼の旅。",
    routeMapUrl: imgRouteIse
  }
];

export const TIME_SLOTS = [
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];
