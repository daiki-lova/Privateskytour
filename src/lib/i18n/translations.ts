export type Language = 'ja' | 'en';

export interface Translations {
  common: {
    login: string;
    logout: string;
    myPage: string;
    bookNow: string;
    search: string;
    select: string;
    close: string;
    back: string;
  };
  navigation: {
    plans: string;
    flow: string;
    faq: string;
    access: string;
    company: string;
    contact: string;
    terms: string;
    privacy: string;
    legal: string;
    menu: string;
    information: string;
  };
  hero: {
    catchphrase: string;
    subCatchphrase: string;
    searchTitle: string;
    searchDate: string;
    searchPassengers: string;
    searchButton: string;
  };
  sections: {
    popularTours: string;
    services: string;
    testimonials: string;
    flow: string;
    faq: string;
    access: string;
  };
}

export const translations: Record<Language, Translations> = {
  ja: {
    common: {
      login: "ログイン",
      logout: "ログアウト",
      myPage: "マイページ",
      bookNow: "予約する",
      search: "検索",
      select: "選択",
      close: "閉じる",
      back: "戻る",
    },
    navigation: {
      plans: "プラン一覧",
      flow: "ご利用の流れ",
      faq: "よくあるご質問",
      access: "ヘリポート",
      company: "運営会社",
      contact: "お問い合わせ",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      legal: "特定商取引法に基づく表記",
      menu: "Menu",
      information: "Information",
    },
    hero: {
      catchphrase: "東京の空で、\nあなたのものに。",
      subCatchphrase: "高度600mから見下ろす、宝石箱のような夜景。\n大切な人と過ごす、一生に一度の特別なひとときを。",
      searchTitle: "空の旅を予約する",
      searchDate: "日付を選択",
      searchPassengers: "人数",
      searchButton: "プランを検索",
    },
    sections: {
      popularTours: "人気の遊覧プラン",
      services: "選ばれる理由",
      testimonials: "お客様の声",
      flow: "ご利用の流れ",
      faq: "よくあるご質問",
      access: "アクセス",
    },
  },
  en: {
    common: {
      login: "Login",
      logout: "Logout",
      myPage: "My Page",
      bookNow: "Book Now",
      search: "Search",
      select: "Select",
      close: "Close",
      back: "Back",
    },
    navigation: {
      plans: "Plans",
      flow: "How it Works",
      faq: "FAQ",
      access: "Access",
      company: "Company",
      contact: "Contact",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      legal: "Legal Notice",
      menu: "Menu",
      information: "Information",
    },
    hero: {
      catchphrase: "Make Tokyo's Sky\nYours.",
      subCatchphrase: "A jewel-box night view from 600 meters above.\nSpend a once-in-a-lifetime special moment with your loved ones.",
      searchTitle: "Book Your Flight",
      searchDate: "Select Date",
      searchPassengers: "Passengers",
      searchButton: "Search Plans",
    },
    sections: {
      popularTours: "Popular Tours",
      services: "Why Choose Us",
      testimonials: "Testimonials",
      flow: "How it Works",
      faq: "FAQ",
      access: "Access",
    },
  },
};

export type TranslationKey = string; // Simply use string for dot notation