"use client";

import { usePublicSettings, useCancellationPolicyDisplay } from "@/lib/api/hooks/usePublicSettings";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function LegalNotice() {
  const { t, language } = useTranslation();
  const { data: settings, isLoading } = usePublicSettings(['company_info', 'contact_info', 'business_hours_display']);
  const { data: cancellationPolicy } = useCancellationPolicyDisplay();

  const companyInfo = settings?.company_info;
  const contactInfo = settings?.contact_info;
  const businessHours = settings?.business_hours_display;

  // ローディング中はスケルトン表示
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-40 pb-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('legal.title')}</h1>
        <div className="space-y-8 bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
          <div className="animate-pulse space-y-6">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // キャンセルポリシーの表示テキストを生成
  // Note: API data is typically JA only currently. For EN, we use fallback/static text logic for now.
  const cancellationPolicyText = language === 'ja'
    ? (cancellationPolicy?.tiers?.map((tier, index) => {
      const label = tier.label_ja;
      const fee = tier.fee_percentage === 0 ? "キャンセル料はかかりません" : `サービス料金の${tier.fee_percentage}%`;
      return `（${index + 1}）${label}：${fee}`;
    }) ?? [
        "（１）前日以降：サービス料金全額",
        "（２）2日前まで：サービス料金の50%",
        "（３）4日前まで：サービス料金の30%",
        "（４）7日前まで：キャンセル料はかかりません",
      ])
    : [
      "(1) Day before or Same day: 100% of service fee",
      "(2) Up to 2 days before: 50% of service fee",
      "(3) Up to 4 days before: 30% of service fee",
      "(4) Up to 7 days before: No cancellation fee",
    ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('legal.title')}</h1>

      <div className="space-y-8 bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.provider')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? (companyInfo?.name_ja ?? "株式会社PrivateSky") : t('company.name')}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.manager')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? (companyInfo?.representative ?? "中村 和真") : t('company.representative')}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.contact')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'ja'
              ? (
                <>
                  〒{companyInfo?.postal_code ?? "104-0061"}<br />
                  {companyInfo?.address_ja ?? "東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階"}<br />
                </>
              )
              : (
                <>
                  {t('company.address')}<br />
                </>
              )
            }
            Tel : {contactInfo?.phone_display ?? "03-4446-6125"}<br />
            E-mail : {contactInfo?.email ?? "info@privatesky.co.jp"}<br />
            URL : https://tour.privatesky.co.jp/
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.hours')}</h2>
          <p className="text-sm text-slate-600">
            {businessHours?.weekday_start ?? "10:00"} - {businessHours?.weekday_end ?? "18:00"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.contactMethod')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? "電話、メール又はホームページ上のお問い合わせフォーム" : "Phone, Email, or Contact Form on the website"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.applicationMethod')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? "ホームページ上のお申し込みフォーム" : "Application Form on the website"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.price')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? "ホームページ内をご確認下さい" : "Please check the website"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.additionalFees')}</h2>
          <p className="text-sm text-slate-600">{t('legal.otherBurden')}</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.paymentMethod')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja' ? "銀行振込（前払い）又は、クレジットカード決済" : "Bank Transfer (Prepayment) or Credit Card Payment"}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.paymentTiming')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja'
              ? "弊社からご契約の引受けに関する承諾通知を発信した日の翌日から2日以内"
              : "Within 2 days starting from the day following the date we send the acceptance notice of the contract."}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.deliveryTiming')}</h2>
          <p className="text-sm text-slate-600">
            {language === 'ja'
              ? "ご契約の引受けに関する承諾通知に明記したサービス提供予定日"
              : "Scheduled service date specified in the acceptance notice."}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">{t('legal.cancellation')}</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>{t('legal.cancellationNote')}</p>
            <ul className="list-none pl-0 space-y-1">
              {cancellationPolicyText.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
            <p>{t('legal.refundPolicy')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
