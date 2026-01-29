import type { ReservationReminderParams } from '../client';

/**
 * 予約リマインダーメールテンプレート（フライト3日前送信）
 * HTMLとプレーンテキストの両方を生成
 */
export function reservationReminder3DaysTemplate(params: ReservationReminderParams): {
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
  <title>3日後のフライトのご案内 - PrivateSky Tour</title>
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
                3日後のフライトのご案内
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                ヘリコプター遊覧フライトの日が近づいてまいりました。<br>
                3日後のフライトに向けて、準備のご確認をお願いいたします。
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

          <!-- Preparation Checklist -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a; font-weight: 700;">事前準備チェックリスト</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">本人確認書類の準備（運転免許証・パスポート等）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">動きやすい服装・靴の準備</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">体調管理（前日の飲酒は控えめに）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">カメラ・スマートフォンの充電</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">サングラスの準備（晴天時おすすめ）</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 4px; margin-right: 12px; vertical-align: middle;"></span>
                          <span style="font-size: 14px; color: #1a1a1a; vertical-align: middle;">集合場所へのアクセス確認</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: 600;">フライトをより楽しむために</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      <li>窓際の席からの景色は格別です</li>
                      <li>スマートフォンは機内モードでも撮影可能です</li>
                      <li>乗り物酔いが心配な方は酔い止めをご準備ください</li>
                    </ul>
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
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: 600;">キャンセルについて</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      <li>キャンセル料は搭乗日からの日数により異なります</li>
                      <li>体調不良の場合はお早めにご連絡ください</li>
                      <li>天候による中止の場合はキャンセル料はかかりません</li>
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
                当日お会いできることを楽しみにしております。
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
【3日後のフライトのご案内】PrivateSky Tour

${customerName} 様

ヘリコプター遊覧フライトの日が近づいてまいりました。
3日後のフライトに向けて、準備のご確認をお願いいたします。

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

【事前準備チェックリスト】
□ 本人確認書類の準備（運転免許証・パスポート等）
□ 動きやすい服装・靴の準備
□ 体調管理（前日の飲酒は控えめに）
□ カメラ・スマートフォンの充電
□ サングラスの準備（晴天時おすすめ）
□ 集合場所へのアクセス確認

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【フライトをより楽しむために】
・窓際の席からの景色は格別です
・スマートフォンは機内モードでも撮影可能です
・乗り物酔いが心配な方は酔い止めをご準備ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【キャンセルについて】
・キャンセル料は搭乗日からの日数により異なります
・体調不良の場合はお早めにご連絡ください
・天候による中止の場合はキャンセル料はかかりません

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

当日お会いできることを楽しみにしております。
ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
