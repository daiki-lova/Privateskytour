import React from 'react';

export function LegalNotice() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">特定商取引法に基づく表記</h1>
      
      <div className="space-y-8 bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">サービス提供事業者</h2>
          <p className="text-sm text-slate-600">株式会社PrivateSky</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">業務責任者</h2>
          <p className="text-sm text-slate-600">中村 和真</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">連絡先等</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            〒104-0061<br />
            東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階<br />
            Tel : 03-4446-6125<br />
            E-mail : info@privatesky.co.jp<br />
            ホームページURL : https://tour.privatesky.co.jp/
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">営業時間</h2>
          <p className="text-sm text-slate-600">9:00～18:00</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">お問い合わせ方法</h2>
          <p className="text-sm text-slate-600">電話、メール又はホームページ上のお問い合わせフォーム</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">お申し込み方法</h2>
          <p className="text-sm text-slate-600">ホームページ上のお申し込みフォーム</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">料金</h2>
          <p className="text-sm text-slate-600">ホームページ内をご確認下さい</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">料金以外にお客様が負担する金額</h2>
          <p className="text-sm text-slate-600">原則として無し</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">料金の支払方法</h2>
          <p className="text-sm text-slate-600">銀行振込（前払い）又は、クレジットカード決済</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">料金の支払時期</h2>
          <p className="text-sm text-slate-600">弊社からご契約の引受けに関する承諾通知を発信した日の翌日から2日以内</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">サービス提供時期</h2>
          <p className="text-sm text-slate-600">ご契約の引受けに関する承諾通知に明記したサービス提供予定日</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-2">キャンセル料について</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>契約成立後にお客様の都合（悪天候等によりサービスの提供ができない場合を除く）でサービス提供をキャンセルされる場合は、次のキャンセル料を申し受けます。なお、所定の期限までに料金の支払が確認できない場合及び出発予定時刻までにご連絡がない場合は、キャンセル扱いとさせていただきます。</p>
            <ul className="list-none pl-0 space-y-1">
              <li>（１）前日以降：サービス料金全額</li>
              <li>（２）2日前まで：サービス料金の50%</li>
              <li>（３）4日前まで：サービス料金の30%</li>
              <li>（４）7日前まで：キャンセル料はかかりません</li>
            </ul>
            <p>上記のほか、運行事業者との間の運送契約でキャンセル料、違約金等が発生する場合は、その負担が発生することがあります。</p>
          </div>
        </section>
      </div>
    </div>
  );
}
