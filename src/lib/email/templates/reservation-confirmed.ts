import type { ReservationConfirmationParams } from '../client';

/**
 * 予約確認メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function reservationConfirmedTemplate(params: ReservationConfirmationParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    flightDate,
    flightTime,
    pax,
    totalPrice,
    bookingNumber,
    heliportName,
    heliportAddress,
    mypageUrl,
  } = params;

  const formattedPrice = totalPrice.toLocaleString('ja-JP');

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約確認 - PrivateSky Tour</title>
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

          <!-- Success Badge -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 8px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                ご予約が確定しました
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.8;">
                ${customerName} 様<br><br>
                この度はPrivateSky Tourをご予約いただき、誠にありがとうございます。<br>
                以下の内容でご予約を承りました。
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 20px; color: #1a1a2e; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">搭乗日</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${flightDate}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">搭乗時刻</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${flightTime}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">人数</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">${pax}名</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">お支払い金額</p>
                                <p style="margin: 0; font-size: 16px; color: #333333; font-weight: 600;">&yen;${formattedPrice}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">集合場所</p>
                          <p style="margin: 0 0 4px; font-size: 16px; color: #333333; font-weight: 600;">${heliportName}</p>
                          <p style="margin: 0; font-size: 14px; color: #64748b;">${heliportAddress}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${mypageUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                マイページで予約を確認
              </a>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">ご搭乗前のご注意</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #92400e; line-height: 1.6;">
                      <li>集合時刻の15分前までにお越しください</li>
                      <li>本人確認書類（運転免許証等）をご持参ください</li>
                      <li>動きやすい服装・靴でお越しください</li>
                      <li>天候により運航を中止する場合がございます</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-align: center;">
                ご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
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
【予約確認】PrivateSky Tour

${customerName} 様

この度はPrivateSky Tourをご予約いただき、誠にありがとうございます。
以下の内容でご予約を承りました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗日時: ${flightDate} ${flightTime}

■ 人数: ${pax}名

■ お支払い金額: ¥${formattedPrice}

■ 集合場所:
  ${heliportName}
  ${heliportAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ マイページで予約を確認
${mypageUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ご搭乗前のご注意】
・集合時刻の15分前までにお越しください
・本人確認書類（運転免許証等）をご持参ください
・動きやすい服装・靴でお越しください
・天候により運航を中止する場合がございます

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
