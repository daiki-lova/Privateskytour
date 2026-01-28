"use client";

import { useCompanyInfo, useContactInfo } from "@/lib/api/hooks/usePublicSettings";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function CompanyProfile() {
  const { data: companyInfo, isLoading: companyLoading } = useCompanyInfo();
  const { data: contactInfo, isLoading: contactLoading } = useContactInfo();

  const isLoading = companyLoading || contactLoading;

  const { t, language } = useTranslation();

  // ローディング中はスケルトン表示
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-40 pb-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('company.title')}</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="px-6 py-6 border-b border-slate-100 last:border-b-0">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('company.title')}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">{t('company.name')}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {language === 'ja' ? (companyInfo?.name_ja ?? "株式会社PrivateSky") : t('company.name')}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">{t('company.business')}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {language === 'ja'
                ? (companyInfo?.business_description_ja ?? "航空運送代理店業 上記に付帯関連するサービス提供")
                : t('company.business')}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">{t('company.address')}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {language === 'ja'
                ? `〒${companyInfo?.postal_code ?? "104-0061"} ${companyInfo?.address_ja ?? "東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階"}`
                : t('company.address')}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">Tel</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {contactInfo?.phone_display ?? "03-4446-6125"}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">E-mail</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {contactInfo?.email ?? "info@privatesky.co.jp"}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">{t('company.representative')}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {language === 'ja' ? (companyInfo?.representative ?? "中村 和真") : t('company.representative')}
            </dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">{t('company.bank')}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
              {language === 'ja' ? (companyInfo?.bank ?? "みずほ銀行") : t('company.bank')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
