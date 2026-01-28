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
    viewDetails: string;
    taxIncl: string;
    currency: string;
    min: string;
    required: string;
    optional: string;
    person: string;
    duration: string;
    terms: string;
    privacy: string;
    processing: string;
  };
  validation: {
    required: string;
    emailInvalid: string;
    romajiOnly: string;
    guestNameRequired: string;
    guestNameRomajiRequired: string;
    nameRequired: string;
    emailRequired: string;
    phoneRequired: string;
    phoneInvalid: string;
    pickupAddressRequired: string;
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
    tagline: string;
    viewPlans: string;
    scroll: string;
  };
  popularTours: {
    title: string;
    subtitle: string;
    sightseeingTitle: string;
    sightseeingSubtitle: string;
    transferTitle: string;
    transferSubtitle: string;
  };
  services: {
    title: string;
    safety: {
      title: string;
      desc: string;
    };
    flexibility: {
      title: string;
      desc: string;
    };
    reasonable: {
      title: string;
      desc: string;
    };
  };
  tourDetail: {
    duration: string;
    capacity: string;
    departure: string;
    routeMap: string;
    highlights: string;
    detailTitle: string;
    meetingPlace: string;
    viewMap: string;
    pricePerHeli: string;
    roundTripOption: string;
    maxCapacity: string;
    cancellation: string;
    cancellationPolicy: string;
    specialOffer: string;
    specialOfferDesc: string;
    bookBtn: string;
    weatherNote: string;
    companyTitle: string;
    companyDesc: string;
    contactBtn: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backToList: string;
    backToTop: string;
  };
  flow: {
    title: string;
    step1: {
      title: string;
      desc: string;
    };
    step2: {
      title: string;
      desc: string;
    };
    step3: {
      title: string;
      desc: string;
    };
    step4: {
      title: string;
      desc: string;
    };
  };
  faq: {
    title: string;
    categories: {
      helicopter: string;
      booking: string;
      boarding: string;
    };
  };
  testimonials: {
    title: string;
    items: {
      title: string;
      user: string;
      comment: string;
    }[];
  };
  access: {
    title: string;
    description: string;
    trainBus: string;
    car: string;
    viewMap: string;
  };
  footer: {
    tagline: string;
    address: string;
  };
  company: {
    title: string;
    name: string;
    business: string;
    address: string;
    representative: string;
    bank: string;
  };
  legal: {
    title: string;
    provider: string;
    manager: string;
    contact: string;
    hours: string;
    contactMethod: string;
    applicationMethod: string;
    price: string;
    additionalFees: string;
    paymentMethod: string;
    paymentTiming: string;
    deliveryTiming: string;
    cancellation: string;
    cancellationNote: string;
    otherBurden: string;
    refundPolicy: string;
  };
  booking: {
    step1: {
      label: string;
      title: string;
      desc: string;
      planSelectTitle: string;
      planSelectDesc: string;
      currentPlan: string;
      changePlan: string;
      dateLabel: string;
      paxLabel: string;
      paxNote: string;
      timeLabel: string;
      timeNote: string;
      location: string;
      nextBtn: string;
      loading: string;
      holiday: string;
      holidayNote: string;
      noSlots: string;
      selectedDate: string;
    };
    step2: {
      label: string;
      title: string;
      desc: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      phoneLabel: string;
      phoneNote: string;
      paxLabel: string;
      paxPlaceholder: string;
      weightLimitNote: string;
      guestTitle: string;
      guestDesc: string;
      guestLabel: string;
      guestNameLabel: string;
      guestNamePlaceholder: string;
      guestRomajiLabel: string;
      guestRomajiNote: string;
      transferTitle: string;
      transferCheckbox: string;
      pickupLabel: string;
      pickupPlaceholder: string;
      dropoffLabel: string;
      addressPlaceholder: string;
      transferAreaNote: string;
      notesLabel: string;
      notesPlaceholder: string;
      nextBtn: string;
      customerInfo: string;
    };
    step3: {
      label: string;
      title: string;
      desc: string;
      flightInfo: string;
      cancelPolicyTitle: string;
      cancel7days: string;
      cancel4days: string;
      cancel2days: string;
      cancelToday: string;
      fullRefund: string;
      refund: string;
      noRefund: string;
      weatherCancelTitle: string;
      weatherCancelDesc: string;
      termsTitle: string;
      agreeTerms: string;
      agreePrivacy: string;
      agreeHealth: string;
      paymentAmount: string;
      planPrice: string;
      paxCount: string;
      subtotal: string;
      tax: string;
      total: string;
      payBtn: string;
      checkAllTerms: string;
      stripeSecure: string;
      acceptTermsError: string;
      incompleteDataError: string;
      reservationCreateError: string;
      reservationConfirmError: string;
      sessionCreateError: string;
      urlError: string;
      paymentError: string;
      confTitle: string;
      confDesc: string;
      backToHome: string;
    };
    success: {
      title: string;
      desc: string;
      homeBtn: string;
    };
  };
  login: {
    title: string;
    description: string;
    emailLabel: string;
    sendLink: string;
    sending: string;
    successTitle: string;
    successDesc: string;
    troubleTitle: string;
    troubleSpam: string;
    troubleEmail: string;
    troubleRetry: string;
    retryButton: string;
    nonUserTitle: string;
    nonUserDesc: string;
    networkError: string;
    unknownError: string;
  };
  contact: {
    title: string;
    successTitle: string;
    successDesc: string;
    newInquiry: string;
    failed: string;
    sending: string;
    send: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      subject: string;
      subjectPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      required: string;
    };
    validation: {
      name: string;
      email: string;
      emailInvalid: string;
      subject: string;
      message: string;
      messageLength: string;
    };
  };
  terms: {
    title: string;
    content: string;
  };
  privacy: {
    title: string;
    content: string;
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
      viewDetails: "詳細を見る",
      taxIncl: "税込",
      currency: "円",
      min: "分",
      required: "必須",
      optional: "任意",
      person: "名",
      duration: "所要時間",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      processing: "処理中...",
    },
    validation: {
      required: "必須項目です",
      emailInvalid: "有効なメールアドレスを入力してください",
      romajiOnly: "半角英字で入力してください",
      guestNameRequired: "搭乗者名を入力してください",
      guestNameRomajiRequired: "搭乗者名（ローマ字）を入力してください",
      nameRequired: "お名前を入力してください",
      emailRequired: "メールアドレスを入力してください",
      phoneRequired: "電話番号を入力してください",
      phoneInvalid: "有効な電話番号を入力してください",
      pickupAddressRequired: "お迎え先住所を入力してください",
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
      tagline: "上質な空の旅を、あなたに。",
      viewPlans: "View Plans",
      scroll: "Scroll",
    },
    popularTours: {
      title: "選べる2つのフライトスタイル",
      subtitle: "都内の名所を優雅に巡る「遊覧フライト」と、目的地へ快適に移動する「ヘリ送迎」。\n洗練された移動体験を、すべてのお客様へ。",
      sightseeingTitle: "遊覧フライト",
      sightseeingSubtitle: "東京の空を独り占めする、特別なひととき",
      transferTitle: "移動・送迎",
      transferSubtitle: "渋滞知らずの空の旅で、目的地へ快適に",
    },
    services: {
      title: "選ばれる理由",
      safety: {
        title: "安心と安全",
        desc: "国土交通省の認可を受けた航空運送事業者及び航空機使用事業者が運航を担当します。機体や運航の管理体制も厳重な基準をクリアしたパイロットが安全な空の旅へとご案内いたします。",
      },
      flexibility: {
        title: "自由なサービス・スタッフ",
        desc: "経験豊富でフレンドリーなスタッフがお客様のご要望にお応えします。また、撮影スタッフ、現地案内係などもオプションで手配、花束・演出なども相談可能です。",
      },
      reasonable: {
        title: "リーズナブルな料金",
        desc: "業界最安値を目指し、納得価格でご案内。季節ごとのキャンペーンも実施しております。リーズナブルな価格で感動の体験を！記念日デートやサプライズにも4万円台とお手頃です。",
      },
    },
    tourDetail: {
      duration: "所要時間",
      capacity: "定員",
      departure: "出発地",
      routeMap: "ルート案内",
      highlights: "プランの魅力",
      detailTitle: "コース詳細",
      meetingPlace: "集合場所",
      viewMap: "Google Mapsで開く",
      pricePerHeli: "一機あたり（税込）",
      roundTripOption: "※日帰り往復の場合は +¥{price}",
      maxCapacity: "最大 {pax} 名",
      cancellation: "キャンセル料",
      cancellationPolicy: "前日 50% / 当日 100%",
      specialOffer: "SPECIAL OFFER",
      specialOfferDesc: "30分以上のフライトをご予約の方は、<br /><strong>アルファードでの無料送迎</strong>をご利用いただけます。",
      bookBtn: "このプランを予約する",
      weatherNote: "※天候によりフライトが中止となる場合がございます",
      companyTitle: "団体・法人のお客様へ",
      companyDesc: "定員を超える人数や、特別なチャーター、撮影のご相談も承っております。お気軽にお問い合わせください。",
      contactBtn: "お問い合わせはこちら",
      notFoundTitle: "プランが見つかりません",
      notFoundDesc: "お探しのプランは存在しないか、削除された可能性があります。",
      backToList: "プラン一覧に戻る",
      backToTop: "トップページへ戻る",
    },
    flow: {
      title: "ご利用の流れ",
      step1: {
        title: "予約申し込み",
        desc: "ウェブの予約フォームから希望日時・コース・人数などを入力・送信いただきます。お支払いはクレジットカード決済となります。",
      },
      step2: {
        title: "確定とパイロットの確保",
        desc: "空席があるか確認後パイロットの確保を行い、確定完了メールをお送りし、予約完了となります。",
      },
      step3: {
        title: "事前決済",
        desc: "クレジットカード決済の案内が届きますので、事前決済をお願い致します。決済確認後、予約確定となります。",
      },
      step4: {
        title: "ご搭乗",
        desc: "当日は、指定時刻の20分前に所定の場所にお越しいただき、身分証の確認後フライトをお楽しみください。",
      },
    },
    faq: {
      title: "よくあるご質問",
      categories: {
        helicopter: "ヘリコプターについて",
        booking: "ご予約について",
        boarding: "ご搭乗に際して",
      },
    },
    testimonials: {
      title: "お客様の声",
      items: [
        {
          title: "両親の記念日に",
          user: "30代女性",
          comment: "私の両親のヘリコプター体験を誕生日プレゼントとして予約させて頂きましたが、私にとっても忘れられない素敵な時間を共有できました。"
        },
        {
          title: "彼女へのプレゼントに",
          user: "20代男性",
          comment: "初めての誕生日プレゼントで空の旅をお願いしました。サプライズ演出にもスタッフの皆様が快く協力してくれたおかげで、彼女も涙を流して喜んでくれました。"
        },
        {
          title: "プロポーズに",
          user: "30代男性",
          comment: "一生の思い出になりました。夜景の美しさはもちろんですが、スタッフの方の事前の段取りや協力のおかげでプロポーズも成功し、最高の瞬間でした。"
        },
        {
          title: "最高の夜景でした",
          user: "40代男性",
          comment: "東京の夜景がこれほど綺麗だとは思いませんでした。パイロットの方のガイドも素晴らしく、安心して楽しめました。"
        },
        {
          title: "感動しました",
          user: "20代女性",
          comment: "人生で一度は乗ってみたかったヘリコプター。夢が叶いました！スタッフの方もとても親切で、また絶対に利用したいです。"
        }
      ]
    },
    access: {
      title: "アクセス",
      description: "すべてのフライトは東京ヘリポートより出発いたします。\n都心からのアクセスも良く、お車でもお越しいただけます。",
      trainBus: "電車・バス",
      car: "お車",
      viewMap: "Google Mapでルートを確認",
    },
    footer: {
      tagline: "特別な日の思い出作りをお手伝いします。",
      address: "東京都江東区新木場4-7-25 東京ヘリポート内",
    },
    company: {
      title: "会社概要",
      name: "会社名",
      business: "事業内容",
      address: "住所",
      representative: "代表取締役",
      bank: "取引銀行",
    },
    legal: {
      title: "特定商取引法に基づく表記",
      provider: "サービス提供事業者",
      manager: "業務責任者",
      contact: "連絡先等",
      hours: "営業時間",
      contactMethod: "お問い合わせ方法",
      applicationMethod: "お申し込み方法",
      price: "料金",
      additionalFees: "料金以外にお客様が負担する金額",
      paymentMethod: "料金の支払方法",
      paymentTiming: "料金の支払時期",
      deliveryTiming: "サービス提供時期",
      cancellation: "キャンセル料について",
      cancellationNote: "契約成立後にお客様の都合（悪天候等によりサービスの提供ができない場合を除く）でサービス提供をキャンセルされる場合は、次のキャンセル料を申し受けます。なお、所定の期限までに料金の支払が確認できない場合及び出発予定時刻までにご連絡がない場合は、キャンセル扱いとさせていただきます。",
      otherBurden: "原則として無し",
      refundPolicy: "上記のほか、運行事業者との間の運送契約でキャンセル料、違約金等が発生する場合は、その負担が発生することがあります。",
    },
    booking: {
      step1: {
        label: "プラン選択",
        title: "プランを選択してください",
        desc: "ご希望のプラン、日時、人数を選択してください。",
        planSelectTitle: "プラン一覧",
        planSelectDesc: "目的に合わせて最適なプランをお選びください。",
        currentPlan: "現在の選択プラン",
        changePlan: "プランを変更",
        dateLabel: "日付",
        paxLabel: "人数",
        paxNote: "※1機あたりの最大積載量は250kgまでです。",
        timeLabel: "時間",
        timeNote: "※天候等の理由により、フライト時間が変更になる場合があります。",
        location: "場所",
        nextBtn: "次へ進む",
        loading: "読み込み中...",
        holiday: "定休日",
        holidayNote: "※選択された日は定休日のため予約できません。",
        noSlots: "予約可能な枠がありません。",
        selectedDate: "選択中の日時",
      },
      step2: {
        label: "お客様情報",
        title: "お客様情報を入力してください",
        desc: "ご予約に必要な情報を入力してください。",
        nameLabel: "お名前 (代表者)",
        namePlaceholder: "山田 太郎",
        emailLabel: "メールアドレス",
        phoneLabel: "電話番号",
        phoneNote: "※当日連絡のつく番号を入力してください。",
        paxLabel: "搭乗人数",
        paxPlaceholder: "人数を選択",
        weightLimitNote: "※体重制限にご注意ください",
        guestTitle: "同乗者情報",
        guestDesc: "同乗される方の情報を入力してください。",
        guestLabel: "同乗者",
        guestNameLabel: "お名前（カナ）",
        guestNamePlaceholder: "オオゾラ ハナコ",
        guestRomajiLabel: "お名前（ローマ字）",
        guestRomajiNote: "※パスポートと同じ表記で入力してください",
        transferTitle: "送迎サービス (無料)",
        transferCheckbox: "ハイヤー送迎を利用する",
        pickupLabel: "お迎え先住所",
        pickupPlaceholder: "東京都千代田区...",
        dropoffLabel: "お送り先住所（任意）",
        addressPlaceholder: "住所を入力してください",
        transferAreaNote: "※送迎エリアは東京23区内となります。",
        notesLabel: "備考・ご要望",
        notesPlaceholder: "特別なご要望がありましたらご記入ください。",
        nextBtn: "確認画面へ進む",
        customerInfo: "お客様情報",
      },
      step3: {
        label: "確認",
        title: "予約内容の確認",
        desc: "ご予約内容をご確認の上、決済へお進みください。",
        flightInfo: "フライト情報",
        cancelPolicyTitle: "キャンセルポリシー",
        cancel7days: "7日前まで",
        cancel4days: "3日前まで",
        cancel2days: "前日まで",
        cancelToday: "当日",
        fullRefund: "全額返金",
        refund: "返金",
        noRefund: "返金なし",
        weatherCancelTitle: "悪天候等による欠航の場合",
        weatherCancelDesc: "天候不良や機材トラブル等により欠航となった場合は、全額返金または日程変更を承ります。",
        termsTitle: "利用規約への同意",
        agreeTerms: "利用規約に同意する",
        agreePrivacy: "プライバシーポリシーに同意する",
        agreeHealth: "健康状態および注意事項を確認しました",
        paymentAmount: "お支払い金額",
        planPrice: "プラン料金",
        paxCount: "人数",
        subtotal: "小計",
        tax: "消費税",
        total: "合計",
        payBtn: "予約・決済する",
        checkAllTerms: "全ての項目に同意してください",
        stripeSecure: "情報は暗号化され安全に送信されます",
        acceptTermsError: "利用規約等への同意が必要です。",
        incompleteDataError: "予約情報が不足しています。",
        reservationCreateError: "予約の作成に失敗しました。",
        reservationConfirmError: "予約の確定に失敗しました。",
        sessionCreateError: "決済セッションの作成に失敗しました。",
        urlError: "決済URLの取得に失敗しました。",
        paymentError: "決済処理中にエラーが発生しました。",
        confTitle: "ご予約ありがとうございます",
        confDesc: "予約確認メールをお送りしましたのでご確認ください。当日お会いできることを心よりお待ちしております。",
        backToHome: "ホームへ戻る",
      },
      success: {
        title: "ご予約ありがとうございます！",
        desc: "ご登録いただいたメールアドレスに予約確認メールを送信しました。",
        homeBtn: "ホームに戻る",
      },
    },
    contact: {
      title: "お問い合わせ",
      successTitle: "送信完了",
      successDesc: "お問い合わせいただきありがとうございます。\n担当者より順次ご連絡いたします。",
      newInquiry: "新しいお問い合わせ",
      failed: "送信に失敗しました。もう一度お試しください。",
      sending: "送信中...",
      send: "送信する",
      form: {
        name: "お名前",
        namePlaceholder: "山田 太郎",
        email: "メールアドレス",
        emailPlaceholder: "your@email.com",
        subject: "件名",
        subjectPlaceholder: "お問い合わせ内容の件名",
        message: "本文",
        messagePlaceholder: "お問い合わせ内容を入力してください",
        required: "必須",
      },
      validation: {
        name: "お名前を入力してください",
        email: "メールアドレスを入力してください",
        emailInvalid: "有効なメールアドレスを入力してください",
        subject: "件名を入力してください",
        message: "本文を入力してください",
        messageLength: "本文は10文字以上で入力してください",
      },
    },
    login: {
      title: "ログイン",
      description: "メールアドレスを入力してログインリンクを受け取ってください",
      emailLabel: "メールアドレス",
      sendLink: "ログインリンクを送信",
      sending: "送信中...",
      successTitle: "メールを送信しました",
      successDesc: "ログインリンクをメールでお送りしました。ご確認ください。",
      troubleTitle: "メールが届かない場合",
      troubleSpam: "迷惑メールフォルダをご確認ください",
      troubleEmail: "入力したメールアドレスにお間違いがないかご確認ください",
      troubleRetry: "数分待ってから再度お試しください",
      retryButton: "再送信",
      nonUserTitle: "アカウントが見つかりません",
      nonUserDesc: "このメールアドレスは登録されていません。管理者にご連絡ください。",
      networkError: "ネットワークエラーが発生しました",
      unknownError: "予期せぬエラーが発生しました",
    },
    terms: {
      title: "利用規約",
      content: "この利用規約...",
    },
    privacy: {
      title: "プライバシーポリシー",
      content: "プライバシーポリシー...",
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
      viewDetails: "View Details",
      taxIncl: "Tax incl.",
      currency: "JPY",
      min: "min",
      required: "Required",
      optional: "Optional",
      person: "",
      duration: "Duration",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      processing: "Processing...",
    },
    validation: {
      required: "Required",
      emailInvalid: "Please enter a valid email",
      romajiOnly: "Please enter in Roman alphabet",
      guestNameRequired: "Passenger name is required",
      guestNameRomajiRequired: "Passenger name (Romaji) is required",
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid phone number",
      pickupAddressRequired: "Pickup address is required",
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
      tagline: "Premium sky travel, just for you.",
      viewPlans: "View Plans",
      scroll: "Scroll",
    },
    popularTours: {
      title: "Two Flight Styles to Choose From",
      subtitle: "Elegant sightseeing flights over Tokyo landmarks and comfortable helicopter transfers to your destination.\nSophisticated travel experiences for every guest.",
      sightseeingTitle: "Sightseeing Flights",
      sightseeingSubtitle: "Special moments with the Tokyo sky all to yourself",
      transferTitle: "Transfer & Charter",
      transferSubtitle: "Comfortable travel to your destination, free from traffic",
    },
    services: {
      title: "Why Choose Us",
      safety: {
        title: "Safety & Security",
        desc: "Flights are operated by air transport and aircraft-use businesses authorized by the Ministry of Land, Infrastructure, Transport and Tourism. Our pilots and management systems meet strict safety standards.",
      },
      flexibility: {
        title: "Flexible Service",
        desc: "Our experienced and friendly staff are ready to meet your needs. We can also arrange photographers, local guides, bouquets, and special event coordination upon request.",
      },
      reasonable: {
        title: "Reasonable Prices",
        desc: "We aim for industry-leading value with transparent pricing and seasonal campaigns. Enjoy emotional experiences starting from the 40,000 yen range—perfect for anniversaries and surprises.",
      },
    },
    tourDetail: {
      duration: "Duration",
      capacity: "Capacity",
      departure: "Departure",
      routeMap: "Route Map",
      highlights: "Highlights",
      detailTitle: "Course Details",
      meetingPlace: "Meeting Place",
      viewMap: "Open in Google Maps",
      pricePerHeli: "Per Helicopter (Tax Incl.)",
      roundTripOption: "*Round trip (same day): +¥{price}",
      maxCapacity: "Max {pax} ppl",
      cancellation: "Cancellation Fee",
      cancellationPolicy: "50% prior day / 100% same day",
      specialOffer: "SPECIAL OFFER",
      specialOfferDesc: "For flights over 30 mins, <br /><strong>free Alphard transfer</strong> is available.",
      bookBtn: "Book This Plan",
      weatherNote: "*Flight may be cancelled due to weather",
      companyTitle: "For Groups / Corporate",
      companyDesc: "We accept inquiries for large groups, special charters, and filming. Please feel free to contact us.",
      contactBtn: "Contact Us",
      notFoundTitle: "Plan Not Found",
      notFoundDesc: "The plan you are looking for may not exist or may have been deleted.",
      backToList: "Back to Plans",
      backToTop: "Back to Top",
    },
    flow: {
      title: "How it Works",
      step1: {
        title: "Booking Request",
        desc: "Submit your preferred date, course, and number of passengers via our online form. Payment is made by credit card.",
      },
      step2: {
        title: "Pilot Assignment",
        desc: "We confirm seat availability and assign a pilot. You will receive a confirmation email once the booking is finalized.",
      },
      step3: {
        title: "Pre-payment",
        desc: "You will receive instructions for credit card payment. Your booking is officially confirmed after payment is verified.",
      },
      step4: {
        title: "Boarding",
        desc: "Please arrive at the designated location 20 minutes before your scheduled flight. Enjoy your flight after an ID check.",
      },
    },
    faq: {
      title: "FAQ",
      categories: {
        helicopter: "About Helicopters",
        booking: "About Bookings",
        boarding: "About Boarding",
      },
    },
    testimonials: {
      title: "Customer Reviews",
      items: [
        {
          title: "Anniversary Gift for Parents",
          user: "Female in 30s",
          comment: "I booked a helicopter experience as a birthday gift for my parents. It was an unforgettable time for me as well."
        },
        {
          title: "Birthday Surprise",
          user: "Male in 20s",
          comment: "First time booking a flight as a birthday gift. Thanks to the staff's cooperation with the surprise, she was moved to tears."
        },
        {
          title: "For a Proposal",
          user: "Male in 30s",
          comment: "A memory of a lifetime. The night view was beautiful, but the staff's support made the proposal a success. It was the best moment."
        },
        {
          title: "Amazing Night View",
          user: "Male in 40s",
          comment: "I didn't expect Tokyo's night view to be this beautiful. The pilot's guide was excellent, and we enjoyed the flight with peace of mind."
        },
        {
          title: "Truly Moved",
          user: "Female in 20s",
          comment: "Flying in a helicopter was on my bucket list. Dream came true! The staff was very kind, and I definitely want to come back."
        }
      ]
    },
    access: {
      title: "Access",
      description: "All flights depart from Tokyo Heliport.\nConveniently located with good city access and free parking available.",
      trainBus: "Train / Bus",
      car: "Car",
      viewMap: "View Route on Google Maps",
    },
    footer: {
      tagline: "Helping you create memories for your special day.",
      address: "Tokyo Heliport, 4-7-25 Shinkiba, Koto-ku, Tokyo",
    },
    company: {
      title: "Company Profile",
      name: "PrivateSky Co., Ltd.",
      business: "Aviation Transport Agency, Service Provider related to the above",
      address: "7F Ginza Itchome Bldg, 1-15-4 Ginza, Chuo-ku, Tokyo",
      representative: "Kazuma Nakamura",
      bank: "Mizuho Bank",
    },
    legal: {
      title: "Legal Notice",
      provider: "Service Provider",
      manager: "Operations Manager",
      contact: "Contact Information",
      hours: "Business Hours",
      contactMethod: "Contact Method",
      applicationMethod: "Application Method",
      price: "Price",
      additionalFees: "Additional Fees",
      paymentMethod: "Payment Method",
      paymentTiming: "Payment Timing",
      deliveryTiming: "Service Delivery",
      cancellation: "Cancellation Policy",
      cancellationNote: "If the service is cancelled due to customer circumstances after the contract is established...",
      otherBurden: "None in principle",
      refundPolicy: "In addition to the above...",
    },
    booking: {
      step1: {
        label: "Select Plan",
        title: "Select Your Plan",
        desc: "Please select your preferred plan, date, and number of passengers.",
        planSelectTitle: "Plan List",
        planSelectDesc: "Choose the best plan for your needs.",
        currentPlan: "Selected Plan",
        changePlan: "Change Plan",
        dateLabel: "Date",
        paxLabel: "Passengers",
        paxNote: "*Maximum payload per helicopter is 250kg.",
        timeLabel: "Time",
        timeNote: "*Flight times may change due to weather conditions.",
        location: "Location",
        nextBtn: "Next",
        loading: "Loading...",
        holiday: "Closed",
        holidayNote: "*Selected date is unavailable or closed.",
        noSlots: "No available slots.",
        selectedDate: "Selected Date",
      },
      step2: {
        label: "Guest Info",
        title: "Enter Guest Information",
        desc: "Please enter the information required for booking.",
        nameLabel: "Name (Lead Guest)",
        namePlaceholder: "John Doe",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number",
        phoneNote: "*Please provide a number reachable on the day.",
        paxLabel: "Number of Passengers",
        paxPlaceholder: "Select number",
        weightLimitNote: "*Please be mindful of weight limits",
        guestTitle: "Passenger Information",
        guestDesc: "Please enter information for all passengers.",
        guestLabel: "Passenger",
        guestNameLabel: "Name (Kana)",
        guestNamePlaceholder: "Ozora Hanako",
        guestRomajiLabel: "Name (Romaji)",
        guestRomajiNote: "*Must match passport/ID",
        transferTitle: "Transfer Service (Free)",
        transferCheckbox: "Request Alphard Transfer",
        pickupLabel: "Pickup Address",
        pickupPlaceholder: "1-1-1 Chiyoda, Chiyoda-ku, Tokyo",
        dropoffLabel: "Dropoff Address (Optional)",
        addressPlaceholder: "Enter address",
        transferAreaNote: "*Transfer area is within Tokyo 23 wards.",
        notesLabel: "Notes / Requests",
        notesPlaceholder: "Any special requests...",
        nextBtn: "Confirm Booking",
        customerInfo: "Customer Info",
      },
      step3: {
        label: "Confirm",
        title: "Confirm Booking",
        desc: "Please review your booking details before payment.",
        flightInfo: "Flight Information",
        cancelPolicyTitle: "Cancellation Policy",
        cancel7days: "7 days prior",
        cancel4days: "3 days prior",
        cancel2days: "1 day prior",
        cancelToday: "Same day",
        fullRefund: "Full Refund",
        refund: "Refund",
        noRefund: "No Refund",
        weatherCancelTitle: "Cancellation due to weather",
        weatherCancelDesc: "In case of cancellation due to bad weather or mechanical issues, we offer a full refund or rescheduling.",
        termsTitle: "Terms & Agreements",
        agreeTerms: "I agree to the Terms of Service",
        agreePrivacy: "I agree to the Privacy Policy",
        agreeHealth: "I confirm my health condition",
        paymentAmount: "Payment Amount",
        planPrice: "Plan Price",
        paxCount: "Passengers",
        subtotal: "Subtotal",
        tax: "Tax",
        total: "Total",
        payBtn: "Pay & Book",
        checkAllTerms: "Please agree to all terms",
        stripeSecure: "Information is encrypted and sent securely",
        acceptTermsError: "You must agree to the terms.",
        incompleteDataError: "Booking information is incomplete.",
        reservationCreateError: "Failed to create reservation.",
        reservationConfirmError: "Failed to confirm reservation.",
        sessionCreateError: "Failed to create payment session.",
        urlError: "Failed to get payment URL.",
        paymentError: "Payment error occurred.",
        confTitle: "Thank you for your booking!",
        confDesc: "We have sent a confirmation email. We look forward to seeing you.",
        backToHome: "Back to Home",
      },
      success: {
        title: "Thank you for your booking!",
        desc: "A confirmation email has been sent to your registered email address.",
        homeBtn: "Back to Home",
      },
    },
    contact: {
      title: "Contact Us",
      successTitle: "Message Sent",
      successDesc: "Thank you for your inquiry.\nWe will contact you shortly.",
      newInquiry: "New Inquiry",
      failed: "Failed to send. Please try again.",
      sending: "Sending...",
      send: "Send Message",
      form: {
        name: "Name",
        namePlaceholder: "John Doe",
        email: "Email",
        emailPlaceholder: "your@email.com",
        subject: "Subject",
        subjectPlaceholder: "Subject",
        message: "Message",
        messagePlaceholder: "Enter your message",
        required: "Required",
      },
      validation: {
        name: "Name is required",
        email: "Email is required",
        emailInvalid: "Invalid email",
        subject: "Subject is required",
        message: "Message is required",
        messageLength: "Message must be at least 10 characters",
      },
    },
    login: {
      title: "Login",
      description: "Enter your email to receive a login link",
      emailLabel: "Email Address",
      sendLink: "Send Login Link",
      sending: "Sending...",
      successTitle: "Email Sent",
      successDesc: "We have sent a login link to your email. Please check your inbox.",
      troubleTitle: "Trouble receiving email?",
      troubleSpam: "Check your spam folder",
      troubleEmail: "Verify your email address",
      troubleRetry: "Wait a few minutes and try again",
      retryButton: "Resend",
      nonUserTitle: "Account not found",
      nonUserDesc: "This email is not registered. Please contact support.",
      networkError: "Network error occurred",
      unknownError: "An unexpected error occurred",
    },
    terms: {
      title: "Terms of Service",
      content: "Terms...",
    },
    privacy: {
      title: "Privacy Policy",
      content: "Privacy...",
    },
  },
};

export type TranslationKey = string;