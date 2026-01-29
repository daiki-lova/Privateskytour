import type { ReservationReminderParams } from '../client';

/**
 * 予約リマインダーメールテンプレート（フライト24時間前送信）
 * HTMLとプレーンテキストの両方を生成
 */
export function reservationReminderTemplate(params: ReservationReminderParams): {
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
  } = params;

  const mapLink = googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(heliportAddress)}`;

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
      <td align="center" style="padding: 20px 8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 24px; text-align: center;">
              <img src="https://tour.privatesky.co.jp/logo-header.png" alt="PrivateSky Tour" style="height: 40px; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 8px 24px 16px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; color: #1a1a1a; font-weight: 600;">
                明日のフライトのご案内
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                いよいよ明日、ヘリコプター遊覧フライトの日を迎えます。<br>
                素晴らしい空の旅をお楽しみいただけますよう、スタッフ一同心よりお待ちしております。
              </p>
            </td>
          </tr>

          <!-- Flight Details -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 20px; color: #1a1a1a; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">搭乗日</p>
                                <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${flightDate}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">搭乗時刻</p>
                                <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${flightTime}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">人数</p>
                          <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${pax}名</p>
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
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">集合場所</p>
                    <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 700;">${heliportName}</p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">${heliportAddress}</p>
                    <a href="${mapLink}" style="display: inline-block; background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      Google Mapで開く
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Checklist -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a; font-weight: 700;">当日の持ち物チェックリスト</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">本人確認書類（運転免許証・パスポート等）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">動きやすい服装・靴</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">カメラ・スマートフォン（任意）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">サングラス（晴天時おすすめ）</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Notice -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: 600;">重要なお知らせ</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      <li>集合時刻の<strong style="color: #1a1a1a;">15分前</strong>までにお越しください</li>
                      <li>天候不良の場合はご登録の電話番号にご連絡いたします</li>
                      <li>体調不良の場合は無理をせずご連絡ください</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                明日お会いできることを楽しみにしております。
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280; text-align: center;">
                ご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                PrivateSky Tour | info@privatesky.co.jp
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

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗日時: ${flightDate} ${flightTime}

■ 人数: ${pax}名

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【集合場所】
${heliportName}
${heliportAddress}

▼ Google Mapで開く
${mapLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【当日の持ち物チェックリスト】
□ 本人確認書類（運転免許証・パスポート等）
□ 動きやすい服装・靴
□ カメラ・スマートフォン（任意）
□ サングラス（晴天時おすすめ）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【重要なお知らせ】
・集合時刻の15分前までにお越しください
・天候不良の場合はご登録の電話番号にご連絡いたします
・体調不良の場合は無理をせずご連絡ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

明日お会いできることを楽しみにしております。
ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
