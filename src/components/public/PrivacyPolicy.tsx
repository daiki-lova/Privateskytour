"use client";

import { useTranslation } from "@/lib/i18n/TranslationContext";

export function PrivacyPolicy() {
  const { t, language } = useTranslation();

  if (language === 'en') {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-40 pb-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('privacy.title')}</h1>
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-600 mb-8">
              PrivateSky Co., Ltd. (hereinafter referred to as the &quot;Company&quot;) establishes the following privacy policy (hereinafter referred to as the &quot;Policy&quot;) regarding the handling of users&apos; personal information in the services provided by the Company (hereinafter referred to as the &quot;Service&quot;).
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 1 (Personal Information)</h2>
            <p className="text-sm text-slate-600 mb-4">
              &quot;Personal Information&quot; refers to &quot;personal information&quot; as defined in the Personal Information Protection Act, and means information about a living individual, including information that can identify a specific individual by name, date of birth, address, telephone number, contact information, or other descriptions contained in such information, as well as data related to appearance, fingerprints, voice prints, and information that can identify a specific individual from such information alone (personal identification information) such as the insurer number of the health insurance card.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 2 (Method of Collecting Personal Information)</h2>
            <p className="text-sm text-slate-600 mb-4">
              The Company may ask for personal information such as name, date of birth, address, telephone number, email address, bank account number, credit card number, etc. when a user registers for use. In addition, the Company may collect information regarding transaction records and payments containing personal information made between users and our partners from our partners (including information providers, advertisers, ad distribution destinations, etc.; hereinafter referred to as &quot;Partners&quot;).
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 3 (Purpose of Collecting and Using Personal Information)</h2>
            <p className="text-sm text-slate-600 mb-4">
              The purposes for which the Company collects and uses personal information are as follows:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 mb-4">
              <li>To provide and operate our services</li>
              <li>To respond to inquiries from users (including identity verification)</li>
              <li>To send emails regarding new features, updates, campaigns, etc. of the service being used by the user and other services provided by the Company</li>
              <li>To contact users as necessary for maintenance, important notices, etc.</li>
              <li>To identify users who violate the Terms of Service or try to use the service for fraudulent or unjustified purposes, and to refuse their use</li>
              <li>To allow users to view, change, or delete their own registered information and view their usage status</li>
              <li>To charge usage fees to users in paid services</li>
              <li>Purposes incidental to the above purposes</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 4 (Change of Purpose of Use)</h2>
            <p className="text-sm text-slate-600 mb-4">
              The Company shall change the purpose of use of personal information only when it is reasonably recognized that the purpose of use is relevant to that before the change.
              If the purpose of use is changed, the Company shall notify the user of the changed purpose by the method prescribed by the Company or announce it on this website.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 5 (Provision of Personal Information to Third Parties)</h2>
            <p className="text-sm text-slate-600 mb-4">
              The Company will not provide personal information to third parties without the prior consent of the user, except in the following cases. However, this excludes cases permitted by the Personal Information Protection Act and other laws and regulations.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 mb-4">
              <li>When it is necessary for the protection of human life, body, or property and it is difficult to obtain the consent of the person concerned</li>
              <li>When it is particularly necessary for improving public health or promoting the sound growth of children and it is difficult to obtain the consent of the person concerned</li>
              <li>When it is necessary to cooperate with a national agency, a local government, or a person entrusted by them in carrying out the affairs prescribed by laws and regulations, and obtaining the consent of the person concerned is likely to impede the execution of such affairs</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 6 (Disclosure of Personal Information)</h2>
            <p className="text-sm text-slate-600 mb-4">
              When the Company is requested to disclose personal information by the person concerned, the Company will disclose it to the person without delay. However, if the disclosure falls under any of the following, the Company may not disclose all or part of it, and if the Company decides not to disclose it, it will notify the person to that effect without delay.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">Article 7 (Contact for Inquiries)</h2>
            <p className="text-sm text-slate-600 mb-4">
              For inquiries regarding this policy, please contact the following window.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
              <p>Address: 7F Ginza Itchome Bldg, 1-15-4 Ginza, Chuo-ku, Tokyo 104-0061</p>
              <p>Company Name: PrivateSky Co., Ltd.</p>
              <p>E-mail: info@privatesky.co.jp</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 lg:pt-40 pb-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('privacy.title')}</h1>

      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-600 mb-8">
            株式会社PrivateSky（以下「当社」といいます。）は、当社の提供するサービス（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第1条（個人情報）</h2>
          <p className="text-sm text-slate-600 mb-4">
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第2条（個人情報の収集方法）</h2>
          <p className="text-sm text-slate-600 mb-4">
            当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下、｢提携先｣といいます。）などから収集することがあります。
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第3条（個人情報を収集・利用する目的）</h2>
          <p className="text-sm text-slate-600 mb-4">
            当社が個人情報を収集・利用する目的は、以下のとおりです。
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 mb-4">
            <li>当社サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</li>
            <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
            <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
            <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
            <li>有料サービスにおいて、ユーザーに利用料金を請求するため</li>
            <li>上記の利用目的に付随する目的</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第4条（利用目的の変更）</h2>
          <p className="text-sm text-slate-600 mb-4">
            当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
            利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとします。
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第5条（個人情報の第三者提供）</h2>
          <p className="text-sm text-slate-600 mb-4">
            当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2 mb-4">
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第6条（個人情報の開示）</h2>
          <p className="text-sm text-slate-600 mb-4">
            当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">第7条（お問い合わせ窓口）</h2>
          <p className="text-sm text-slate-600 mb-4">
            本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
            <p>住所：〒104-0061 東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階</p>
            <p>社名：株式会社PrivateSky</p>
            <p>E-mail：info@privatesky.co.jp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
