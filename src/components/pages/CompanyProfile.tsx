import React from 'react';

export function CompanyProfile() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">会社概要</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">会社名</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">株式会社PrivateSky</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">事業内容</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">航空運送代理店業 上記に付帯関連するサービス提供</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">住所</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">〒104-0061 東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">Tel</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">03-4446-6125</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">E-mail</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">info@privatesky.co.jp</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">代表取締役</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">中村 和真</dd>
          </div>
          <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-bold text-slate-500">取引銀行</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">みずほ銀行</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
