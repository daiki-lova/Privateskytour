import type { ReservationReminderParams } from '../client';

/**
 * 前日リマインダーメールテンプレート（フライト前日送信）
 * 天候確認、集合場所・時間、当日連絡先、持ち物、キャンセルポリシーを含む
 */
export function reservationReminder1DayTemplate(params: ReservationReminderParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    flightDate,
    flightTime,
    pax,
    bookingNumber,
    heliportName,
    heliportAddress,
    googleMapUrl,
    emergencyPhone: emergencyPhoneParam,
  } = params;

  const mapLink = googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(heliportAddress)}`;

  // 当日緊急連絡先（パラメータから取得、フォールバックは通常の電話番号）
  const emergencyPhone = emergencyPhoneParam ?? '03-4446-6125';

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>明日のフライトのご案内 - PrivateSky Tour</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 2px;">
                PrivateSky Tour
              </h1>
            </td>
          </tr>

          <!-- Reminder Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 8px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                明日のフライトのご案内
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                いよいよ明日、ヘリコプター遊覧フライトの日を迎えます。<br>
                素晴らしい空の旅をお楽しみいただけますよう、スタッフ一同心よりお待ちしております。
              </p>
            </td>
          </tr>

          <!-- Weather Notice -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e0f2fe; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #0369a1; font-weight: 600;">天候情報のご確認</p>
                    <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.6;">
                      明日の天候を事前にご確認ください。悪天候（強風・濃霧・雷雨など）の場合は、<br>
                      フライト中止または時間変更のご連絡をいたします。<br>
                      当日朝9時までにご登録のお電話へご連絡いたします。
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Flight Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #bfdbfe;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 20px; color: #1e40af; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #bfdbfe;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #1e3a5f; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #bfdbfe;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">搭乗日</p>
                                <p style="margin: 0; font-size: 18px; color: #1e3a5f; font-weight: 700;">${flightDate}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">搭乗時刻</p>
                                <p style="margin: 0; font-size: 18px; color: #1e3a5f; font-weight: 700;">${flightTime}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">人数</p>
                          <p style="margin: 0; font-size: 16px; color: #1e3a5f; font-weight: 600;">${pax}名</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Location -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">集合場所</p>
                    <p style="margin: 0 0 8px; font-size: 18px; color: #166534; font-weight: 700;">${heliportName}</p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #15803d;">${heliportAddress}</p>
                    <a href="${mapLink}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                      Google Mapで開く
                    </a>
                    <p style="margin: 12px 0 0 0; font-size: 13px; color: #16a34a;">
                      ※ 集合時刻の<strong>15分前</strong>までにお越しください
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Emergency Contact -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">当日緊急連絡先</p>
                    <p style="margin: 0 0 4px; font-size: 20px; color: #92400e; font-weight: 700; letter-spacing: 1px;">
                      TEL: ${emergencyPhone}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #a16207;">
                      ※ 当日の遅刻・体調不良などはこちらまでご連絡ください
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Checklist -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #334155; font-weight: 700;">当日の持ち物チェックリスト</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #64748b; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #475569; vertical-align: middle;">本人確認書類（運転免許証・パスポート等）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #64748b; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #475569; vertical-align: middle;">動きやすい服装・靴（ヒールやサンダル不可）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #64748b; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #475569; vertical-align: middle;">カメラ・スマートフォン（任意）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #64748b; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #475569; vertical-align: middle;">サングラス（晴天時おすすめ）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #64748b; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #475569; vertical-align: middle;">酔い止め薬（乗り物酔いが心配な方）</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cancellation Policy Notice -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #991b1b; font-weight: 600;">キャンセルポリシーについて</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #991b1b; line-height: 1.6;">
                      <li>前日キャンセル：<strong>50%</strong> のキャンセル料が発生します</li>
                      <li>当日キャンセル・無断欠席：<strong>100%</strong> のキャンセル料が発生します</li>
                      <li>天候による中止の場合：キャンセル料はかかりません</li>
                      <li>体調不良の場合はお早めにご連絡ください</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #475569; text-align: center; font-weight: 600;">
                明日お会いできることを楽しみにしております。
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #64748b; text-align: center;">
                ご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                PrivateSky Tour | info@privatesky-tour.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
【明日のフライトのご案内】PrivateSky Tour

${customerName} 様

いよいよ明日、ヘリコプター遊覧フライトの日を迎えます。
素晴らしい空の旅をお楽しみいただけますよう、スタッフ一同心よりお待ちしております。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【天候情報のご確認】
明日の天候を事前にご確認ください。
悪天候（強風・濃霧・雷雨など）の場合は、フライト中止または時間変更のご連絡をいたします。
当日朝9時までにご登録のお電話へご連絡いたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗日時: ${flightDate} ${flightTime}

■ 人数: ${pax}名

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【集合場所】
${heliportName}
${heliportAddress}

※ 集合時刻の15分前までにお越しください

▼ Google Mapで開く
${mapLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【当日緊急連絡先】
TEL: ${emergencyPhone}
※ 当日の遅刻・体調不良などはこちらまでご連絡ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【当日の持ち物チェックリスト】
□ 本人確認書類（運転免許証・パスポート等）
□ 動きやすい服装・靴（ヒールやサンダル不可）
□ カメラ・スマートフォン（任意）
□ サングラス（晴天時おすすめ）
□ 酔い止め薬（乗り物酔いが心配な方）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【キャンセルポリシーについて】
・前日キャンセル：50% のキャンセル料が発生します
・当日キャンセル・無断欠席：100% のキャンセル料が発生します
・天候による中止の場合：キャンセル料はかかりません
・体調不良の場合はお早めにご連絡ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

明日お会いできることを楽しみにしております。
ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky-tour.com
  `.trim();

  return { html, text };
}
