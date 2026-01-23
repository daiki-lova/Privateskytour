import { User, Customer, Reservation, Slot, LogEntry, Course, NewsTemplate, Heliport, Lang } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: '管理者 太郎',
  role: 'admin',
  email: 'admin@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

export const MOCK_HELIPORTS: Heliport[] = [
  {
    id: 'h1',
    name: '東京ヘリポート',
    postalCode: '136-0082',
    address: '東京都江東区新木場4-7-25',
    accessRail: '新木場駅',
    accessTaxi: '新木場駅より約5分',
    googleMapUrl: 'https://goo.gl/maps/example',
    imageUrl: 'https://images.unsplash.com/photo-1766284808358-8d47ef5b509d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'h2',
    name: '横浜西ヘリポート',
    postalCode: '240-0035',
    address: '神奈川県横浜市保土ヶ谷区今井町 1221',
    accessRail: '東戸塚駅',
    accessTaxi: '東戸塚駅より約5分',
    accessCar: '横浜新道 今井インターチェンジから車で1分',
    googleMapUrl: 'https://goo.gl/maps/example2',
    imageUrl: 'https://images.unsplash.com/photo-1572506471378-08502f6760df?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'h3',
    name: 'JPD京都ヘリポート',
    postalCode: '612-0000',
    address: '京都府京都市伏見区...',
    accessRail: '京都駅',
    accessTaxi: '京都駅より約15分',
    googleMapUrl: 'https://goo.gl/maps/example3',
    imageUrl: 'https://images.unsplash.com/photo-1722578808802-6edb08f97c1d?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_COURSES: Course[] = [
  { 
    id: 'c1', 
    title: '東京ベイコース', 
    subtitle: '東京の主要名所を空から一望',
    duration: 15, 
    price: 25000,
    maxPax: 3,
    heliportId: 'h1',
    tags: ['人気No.1', '東京観光'],
    images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800'],
    description: '東京タワー、レインボーブリッジ、東京駅など、東京の主要なランドマークを15分で周遊する贅沢なコースです。',
    flightSchedule: [
      { time: '0分', title: '離陸', description: '東京ヘリポートを離陸' },
      { time: '5分', title: 'レインボーブリッジ', description: '上空からの絶景をお楽しみください' },
      { time: '15分', title: '着陸', description: '東京ヘリポートへ帰投' }
    ]
  },
  { 
    id: 'c2', 
    title: '東京タワーコース', 
    subtitle: '夕暮れ時のマジックアワーを楽しむ',
    duration: 20, 
    price: 35000,
    maxPax: 3,
    heliportId: 'h1',
    tags: ['夕景', 'デート'],
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800'],
    description: '夕日に染まる東京の街並みを眺めるロマンチックなフライト。記念日やプロポーズに最適です。',
    flightSchedule: []
  },
  { 
    id: 'c3', 
    title: '富士山トワイライト', 
    subtitle: '都市と自然のコントラストを楽しむ',
    duration: 45, 
    price: 120000, 
    maxPax: 3,
    heliportId: 'h1',
    tags: ['絶景', '富士山'],
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'],
    description: '東京（新木場）から芦ノ湖をヘリコプターで往復するプランです。レインボーブリッジ、お台場、多摩川、みなとみらい、箱根、芦ノ湖上空を遊覧し、遠くには富士山を臨みます。都市と自然のコントラストをお楽しみいただきます。',
    flightSchedule: [
      { time: '0分', title: '東京ヘリポート 離陸', description: '' },
      { time: '30分', title: '芦ノ湖・箱根上空', description: '' },
      { time: '75分', title: '東京ヘリポート 着陸', description: '' }
    ]
  },
  { 
    id: 'c4', 
    title: '横浜ナイトクルーズ', 
    duration: 30, 
    price: 50000, 
    maxPax: 3, 
    heliportId: 'h2', 
    tags: ['夜景'], 
    images: ['https://images.unsplash.com/photo-1543932950-b8cd4d139a2d?auto=format&fit=crop&q=80&w=800'], 
    description: '横浜のみなとみらい地区を上空から見下ろす、宝石箱のような夜景を楽しむコースです。' 
  },
  { 
    id: 'c5', 
    title: '東京スカイツリー周遊', 
    duration: 20, 
    price: 38000, 
    maxPax: 3, 
    heliportId: 'h1', 
    tags: [], 
    images: ['https://images.unsplash.com/photo-1739536017060-6e4fbd4be3a4?auto=format&fit=crop&q=80&w=800'], 
    description: '高さ634mの東京スカイツリーを間近に望む迫力のフライト。' 
  },
  { 
    id: 'c6', 
    title: 'プレミアム東京一周', 
    duration: 60, 
    price: 150000, 
    maxPax: 3, 
    heliportId: 'h1', 
    tags: ['VIP'], 
    images: ['https://images.unsplash.com/photo-1700811476779-86c34521206e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1668563966338-38394330adf0?auto=format&fit=crop&q=80&w=800'], 
    description: '東京の隅々まで堪能する60分のロングクルーズ。大切なゲストのおもてなしに最適です。' 
  },
];

export const MOCK_TEMPLATES: NewsTemplate[] = [
  { id: 't1', name: '運休のお知らせ (強風)', lang: 'ja', subject: '【重要】ヘリコプター遊覧 運休のお知らせ', body: '{{name}} 様\n\n平素よりヘリコプター遊覧サービスをご利用いただきありがとうございます。\n\n誠に残念ながら、{{date}} {{time}} に予定しておりました遊覧飛行は、強風のため運休とさせていただくことになりました。\n\nつきましては、代金の全額返金手続きを進めさせていただきます。\n返金処理の完了まで数日かかる場合がございます。\n\nご迷惑をおかけし申し訳ございませんが、何卒ご理解のほどよろしくお願いいたします。' },
  { id: 't2', name: 'Refund Notification (Wind)', lang: 'en', subject: 'Flight Cancellation Notice', body: 'Dear {{name}},\n\nWe regret to inform you that your flight scheduled for {{date}} at {{time}} has been cancelled due to strong winds.\n\nA full refund will be processed shortly.\n\nThank you for your understanding.' },
];

// --- Large Mock Data Generation ---

const customerBase: { id: string; name: string; email: string; phone: string; lang: Lang; tags: string[] }[] = [
  { id: 'c1', name: '山田 太郎', email: 'taro.y@example.com', phone: '090-1111-1111', lang: 'ja', tags: ['VIP'] },
  { id: 'c2', name: '鈴木 一郎', email: 'suzuki.i@example.com', phone: '090-2222-2222', lang: 'ja', tags: [] },
  { id: 'c3', name: '佐藤 花子', email: 'sato.h@example.com', phone: '090-3333-3333', lang: 'ja', tags: [] },
  { id: 'c4', name: 'John Smith', email: 'john.smith@example.com', phone: '080-1234-5678', lang: 'en', tags: [] },
  { id: 'c5', name: '田中 美咲', email: 'tanaka.m@example.com', phone: '090-4444-4444', lang: 'ja', tags: [] },
  { id: 'c6', name: 'Wang Li', email: 'wang.l@example.com', phone: '090-5555-5555', lang: 'zh', tags: ['VIP'] },
  { id: 'c7', name: '伊藤 健太', email: 'ito.k@example.com', phone: '090-6666-6666', lang: 'ja', tags: ['要注意'] },
  { id: 'c8', name: 'Sarah Jones', email: 'sarah.j@example.com', phone: '080-9876-5432', lang: 'en', tags: [] },
  { id: 'c9', name: '高橋 優子', email: 'takahashi.y@example.com', phone: '090-7777-7777', lang: 'ja', tags: [] },
  { id: 'c10', name: '中村 剛', email: 'nakamura.t@example.com', phone: '090-8888-8888', lang: 'ja', tags: [] },
  { id: 'c11', name: '小林 誠', email: 'kobayashi.m@example.com', phone: '090-9999-9999', lang: 'ja', tags: [] },
  { id: 'c12', name: 'Emily White', email: 'emily.w@example.com', phone: '080-1111-2222', lang: 'en', tags: ['VIP'] },
  { id: 'c13', name: '加藤 浩', email: 'kato.h@example.com', phone: '090-1212-3434', lang: 'ja', tags: [] },
  { id: 'c14', name: '吉田 さくら', email: 'yoshida.s@example.com', phone: '090-5656-7878', lang: 'ja', tags: [] },
  { id: 'c15', name: 'Kim Min-jun', email: 'kim.m@example.com', phone: '090-9090-1212', lang: 'en', tags: [] },
  { id: 'c16', name: '松本 潤', email: 'matsumoto.j@example.com', phone: '090-3434-5656', lang: 'ja', tags: [] },
  { id: 'c17', name: '井上 真央', email: 'inoue.m@example.com', phone: '090-7878-9090', lang: 'ja', tags: [] },
  { id: 'c18', name: 'David Brown', email: 'david.b@example.com', phone: '080-2222-3333', lang: 'en', tags: [] },
  { id: 'c19', name: '木村 拓哉', email: 'kimura.t@example.com', phone: '090-4545-6767', lang: 'ja', tags: ['VIP'] },
  { id: 'c20', name: '斎藤 飛鳥', email: 'saito.a@example.com', phone: '090-2323-4545', lang: 'ja', tags: [] },
];

const reservationsList: Reservation[] = [
  // 2025 Jan
  { id: 'r1', bookingNumber: 'RES-2501-001', customerId: 'c1', planId: 'c1', date: '2025-01-05', time: '14:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r2', bookingNumber: 'RES-2501-002', customerId: 'c4', planId: 'c2', date: '2025-01-10', time: '16:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r3', bookingNumber: 'RES-2501-003', customerId: 'c2', planId: 'c1', date: '2025-01-15', time: '11:00', pax: 3, price: 75000, status: 'completed', paymentStatus: 'paid' },
  
  // 2025 Feb
  { id: 'r4', bookingNumber: 'RES-2502-001', customerId: 'c8', planId: 'c3', date: '2025-02-14', time: '15:00', pax: 2, price: 240000, status: 'completed', paymentStatus: 'paid' }, // Valentine
  { id: 'r5', bookingNumber: 'RES-2502-002', customerId: 'c10', planId: 'c1', date: '2025-02-20', time: '13:00', pax: 2, price: 50000, status: 'cancelled', paymentStatus: 'refunded', refundedAmount: 50000 },

  // 2025 Mar
  { id: 'r6', bookingNumber: 'RES-2503-001', customerId: 'c3', planId: 'c1', date: '2025-03-03', time: '12:00', pax: 3, price: 75000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r7', bookingNumber: 'RES-2503-002', customerId: 'c5', planId: 'c2', date: '2025-03-15', time: '17:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r8', bookingNumber: 'RES-2503-003', customerId: 'c6', planId: 'c6', date: '2025-03-25', time: '14:00', pax: 2, price: 300000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r9', bookingNumber: 'RES-2503-004', customerId: 'c1', planId: 'c4', date: '2025-03-30', time: '18:30', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },

  // 2025 Apr
  { id: 'r10', bookingNumber: 'RES-2504-001', customerId: 'c12', planId: 'c1', date: '2025-04-05', time: '13:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r11', bookingNumber: 'RES-2504-002', customerId: 'c7', planId: 'c1', date: '2025-04-10', time: '15:00', pax: 1, price: 25000, status: 'cancelled', paymentStatus: 'refunded', refundedAmount: 25000 },
  { id: 'r12', bookingNumber: 'RES-2504-003', customerId: 'c9', planId: 'c2', date: '2025-04-15', time: '17:30', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  
  // 2025 May - GW
  { id: 'r13', bookingNumber: 'RES-2505-001', customerId: 'c15', planId: 'c3', date: '2025-05-03', time: '11:00', pax: 3, price: 360000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r14', bookingNumber: 'RES-2505-002', customerId: 'c18', planId: 'c1', date: '2025-05-04', time: '14:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r15', bookingNumber: 'RES-2505-003', customerId: 'c11', planId: 'c4', date: '2025-05-05', time: '19:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  
  // 2025 Jun
  { id: 'r16', bookingNumber: 'RES-2506-001', customerId: 'c13', planId: 'c1', date: '2025-06-10', time: '12:00', pax: 2, price: 50000, status: 'suspended', paymentStatus: 'refunded', suspendedAt: '2025-06-09 10:00:00' }, // Rain
  { id: 'r17', bookingNumber: 'RES-2506-002', customerId: 'c14', planId: 'c1', date: '2025-06-20', time: '15:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  
  // 2025 Jul
  { id: 'r18', bookingNumber: 'RES-2507-001', customerId: 'c16', planId: 'c2', date: '2025-07-07', time: '18:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r19', bookingNumber: 'RES-2507-002', customerId: 'c19', planId: 'c6', date: '2025-07-20', time: '16:00', pax: 3, price: 450000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r20', bookingNumber: 'RES-2507-003', customerId: 'c1', planId: 'c5', date: '2025-07-25', time: '10:00', pax: 2, price: 76000, status: 'completed', paymentStatus: 'paid' },

  // 2025 Aug
  { id: 'r21', bookingNumber: 'RES-2508-001', customerId: 'c2', planId: 'c1', date: '2025-08-01', time: '14:00', pax: 3, price: 75000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r22', bookingNumber: 'RES-2508-002', customerId: 'c4', planId: 'c2', date: '2025-08-10', time: '18:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r23', bookingNumber: 'RES-2508-003', customerId: 'c8', planId: 'c3', date: '2025-08-15', time: '11:00', pax: 2, price: 240000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r24', bookingNumber: 'RES-2508-004', customerId: 'c12', planId: 'c4', date: '2025-08-20', time: '19:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },

  // 2025 Sep
  { id: 'r25', bookingNumber: 'RES-2509-001', customerId: 'c17', planId: 'c1', date: '2025-09-10', time: '13:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r26', bookingNumber: 'RES-2509-002', customerId: 'c20', planId: 'c2', date: '2025-09-22', time: '17:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  
  // 2025 Oct
  { id: 'r27', bookingNumber: 'RES-2510-001', customerId: 'c3', planId: 'c1', date: '2025-10-05', time: '15:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r28', bookingNumber: 'RES-2510-002', customerId: 'c5', planId: 'c1', date: '2025-10-12', time: '14:00', pax: 2, price: 50000, status: 'cancelled', paymentStatus: 'refunded', refundedAmount: 50000 },
  { id: 'r29', bookingNumber: 'RES-2510-003', customerId: 'c9', planId: 'c5', date: '2025-10-20', time: '11:00', pax: 3, price: 114000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r30', bookingNumber: 'RES-2510-004', customerId: 'c15', planId: 'c4', date: '2025-10-26', time: '19:00', pax: 1, price: 50000, status: 'completed', paymentStatus: 'paid' }, // Li Wei相当

  // 2025 Nov
  { id: 'r31', bookingNumber: 'RES-2511-001', customerId: 'c1', planId: 'c1', date: '2025-11-03', time: '13:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r32', bookingNumber: 'RES-2511-002', customerId: 'c1', planId: 'c1', date: '2025-11-10', time: '14:30', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r33', bookingNumber: 'RES-2511-003', customerId: 'c3', planId: 'c2', date: '2025-11-10', time: '15:00', pax: 3, price: 105000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r34', bookingNumber: 'RES-2511-004', customerId: 'c6', planId: 'c6', date: '2025-11-20', time: '12:00', pax: 2, price: 300000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r35', bookingNumber: 'RES-2511-005', customerId: 'c11', planId: 'c3', date: '2025-11-25', time: '10:00', pax: 2, price: 240000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r36', bookingNumber: 'RES-2511-006', customerId: 'c13', planId: 'c1', date: '2025-11-28', time: '15:00', pax: 2, price: 50000, status: 'pending', paymentStatus: 'unpaid' },

  // 2025 Dec - Busy season
  { id: 'r37', bookingNumber: 'RES-2512-001', customerId: 'c1', planId: 'c1', date: '2025-12-01', time: '14:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r38', bookingNumber: 'RES-2512-002', customerId: 'c16', planId: 'c2', date: '2025-12-05', time: '16:00', pax: 2, price: 70000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r39', bookingNumber: 'RES-2512-003', customerId: 'c18', planId: 'c5', date: '2025-12-10', time: '11:00', pax: 2, price: 76000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r40', bookingNumber: 'RES-2512-004', customerId: 'c20', planId: 'c4', date: '2025-12-15', time: '18:00', pax: 2, price: 50000, status: 'completed', paymentStatus: 'paid' },
  { id: 'r41', bookingNumber: 'RES-2512-005', customerId: 'c2', planId: 'c2', date: '2025-12-20', time: '16:30', pax: 2, price: 70000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'r42', bookingNumber: 'RES-2512-006', customerId: 'c4', planId: 'c1', date: '2025-12-22', time: '15:00', pax: 2, price: 50000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'r43', bookingNumber: 'RES-2512-007', customerId: 'c19', planId: 'c6', date: '2025-12-24', time: '17:00', pax: 2, price: 300000, status: 'confirmed', paymentStatus: 'paid' }, // Xmas Eve
  { id: 'r44', bookingNumber: 'RES-2512-008', customerId: 'c1', planId: 'c1', date: '2025-12-25', time: '16:30', pax: 2, price: 50000, status: 'confirmed', paymentStatus: 'paid' }, // Xmas
  { id: 'r45', bookingNumber: 'RES-2512-009', customerId: 'c4', planId: 'c3', date: '2025-12-25', time: '17:00', pax: 3, price: 120000, status: 'confirmed', paymentStatus: 'paid' }, // Xmas
  { id: 'r46', bookingNumber: 'RES-2512-010', customerId: 'c1', planId: 'c2', date: '2025-12-27', time: '16:30', pax: 2, price: 70000, status: 'pending', paymentStatus: 'unpaid' },
  { id: 'r47', bookingNumber: 'RES-2512-011', customerId: 'c4', planId: 'c1', date: '2025-12-28', time: '16:30', pax: 1, price: 25000, status: 'suspended', paymentStatus: 'paid', suspendedAt: '2025-12-26 09:00:00' },
  { id: 'r48', bookingNumber: 'RES-2512-012', customerId: 'c12', planId: 'c2', date: '2025-12-30', time: '16:00', pax: 2, price: 70000, status: 'confirmed', paymentStatus: 'paid' },

  // 2026 Jan
  { id: 'r49', bookingNumber: 'RES-2601-001', customerId: 'c10', planId: 'c1', date: '2026-01-05', time: '14:00', pax: 2, price: 50000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'r50', bookingNumber: 'RES-2601-002', customerId: 'c4', planId: 'c3', date: '2026-01-15', time: '16:00', pax: 2, price: 240000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'r51', bookingNumber: 'RES-2601-003', customerId: 'c6', planId: 'c5', date: '2026-01-20', time: '11:00', pax: 3, price: 114000, status: 'pending', paymentStatus: 'unpaid' },
  { id: 'r52', bookingNumber: 'RES-2601-004', customerId: 'c8', planId: 'c2', date: '2026-01-25', time: '16:30', pax: 2, price: 70000, status: 'confirmed', paymentStatus: 'paid' },
];

// Helper to fill data details
export const MOCK_RESERVATIONS: Reservation[] = reservationsList.map(res => {
  const customer = customerBase.find(c => c.id === res.customerId)!;
  const plan = MOCK_COURSES.find(p => p.id === res.planId)!;
  return {
    ...res,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerLang: customer.lang,
    planName: plan.title,
    bookedAt: new Date(new Date(res.date).getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().replace('T', ' ').slice(0, 19), // 2 weeks before
  } as Reservation;
});

// Calculate Customer stats
export const MOCK_CUSTOMERS: Customer[] = customerBase.map(c => {
  const userReservations = MOCK_RESERVATIONS.filter(r => r.customerId === c.id && r.status !== 'cancelled' && r.status !== 'suspended');
  const bookingCount = userReservations.length;
  const totalSpent = userReservations.reduce((sum, r) => sum + (r.paymentStatus === 'paid' ? r.price : 0), 0);
  
  // Sort by date desc
  userReservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const lastBookingDate = userReservations.length > 0 ? userReservations[0].date : '-';
  const firstBookingDate = userReservations.length > 0 ? userReservations[userReservations.length - 1].date : '-';

  return {
    ...c,
    bookingCount,
    totalSpent,
    lastBookingDate,
    firstBookingDate,
    notes: c.tags.includes('VIP') ? '重要顧客' : '',
  };
});

// Generate Slots
const slots: Slot[] = [];
// 予約データをMap化して検索しやすくする
const reservationMap = new Map<string, Reservation[]>();
MOCK_RESERVATIONS.forEach(res => {
  if (res.status !== 'cancelled') {
    const key = `${res.date}_${res.time}`;
    if (!reservationMap.has(key)) {
      reservationMap.set(key, []);
    }
    reservationMap.get(key)!.push(res);
  }
});

// Time slots from 09:00 to 19:00 with 30-min intervals
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00'
];

// Generate dates range: 2025-12-01 to 2026-01-31 (for demo)
const startDate = new Date('2025-12-01');
const endDate = new Date('2026-01-31');
const dates: string[] = [];
for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  dates.push(d.toISOString().split('T')[0]);
}

// Map to track created slots to avoid duplicates if any logic changes
const createdSlots = new Set<string>();

dates.forEach(date => {
  timeSlots.forEach(time => {
    const key = `${date}_${time}`;
    if (createdSlots.has(key)) return;
    
    const reservations = reservationMap.get(key) || [];
    
    if (reservations.length > 0) {
      const res = reservations[0];
       slots.push({
        id: `s_${res.id}`,
        date: res.date,
        time: res.time,
        maxPax: 3,
        currentPax: res.pax,
        status: res.status === 'suspended' ? 'suspended' : 'open',
        reservations: reservations.map(r => r.id),
        reason: res.status === 'suspended' ? '強風予報のため' : undefined
      });
    } else {
      slots.push({
         id: `s_empty_${date}_${time}`,
         date,
         time,
         maxPax: 3,
         currentPax: 0,
         status: 'open',
         reservations: []
       });
    }
    createdSlots.add(key);
  });
});

// Add remaining reservations that might be outside of the generated date range
MOCK_RESERVATIONS.forEach(res => {
  if (res.status !== 'cancelled') {
    const key = `${res.date}_${res.time}`;
    if (!createdSlots.has(key)) {
       slots.push({
        id: `s_${res.id}`,
        date: res.date,
        time: res.time,
        maxPax: 3,
        currentPax: res.pax,
        status: res.status === 'suspended' ? 'suspended' : 'open',
        reservations: [res.id],
        reason: res.status === 'suspended' ? '強風予報のため' : undefined
      });
      createdSlots.add(key);
    }
  }
});

export const MOCK_SLOTS = slots;

export const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', type: 'operation', action: '運休処理', status: 'success', message: '2025-12-28 16:30枠を運休に設定しました', timestamp: '2025-12-26 09:00:00', user: '管理者 太郎' },
  { id: 'l2', type: 'stripe', action: 'Webhook受信', status: 'success', message: 'payment_intent.succeeded (RES-2512-008)', timestamp: '2025-12-11 10:05:00' },
  { id: 'l3', type: 'crm', action: '顧客同期', status: 'failure', message: '同期失敗: John Smith (接続タイムアウト)', timestamp: '2025-12-02 14:31:00', targetId: 'c4' },
  { id: 'l4', type: 'stripe', action: '返金処理', status: 'success', message: 'RES-2502-002 全額返金完了', timestamp: '2025-02-21 10:00:00', user: '管理者 太郎' },
  { id: 'l5', type: 'system', action: 'バックアップ', status: 'success', message: '日次バックアップ完了', timestamp: '2025-12-26 04:00:00' },
];
