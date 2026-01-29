import type { AdminNewBookingParams } from '../client';

/**
 * 管理者向け新規予約通知メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function adminNewBookingTemplate(params: AdminNewBookingParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    customerEmail,
    customerPhone,
    courseName,
    flightDate,
    flightTime,
    pax,
    totalPrice,
    bookingNumber,
  } = params;

  const formattedPrice = totalPrice.toLocaleString('ja-JP');

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新規予約通知 - PrivateSky Tour</title>
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
                新規予約が入りました
              </h2>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                新しい予約が完了しました。以下の内容をご確認ください。
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 24px 24px;">
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
                                <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${flightDate}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">搭乗時刻</p>
                                <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${flightTime}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">人数</p>
                                <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${pax}名</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">お支払い金額</p>
                                <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">&yen;${formattedPrice}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #1a1a1a; font-weight: 600;">お客様情報</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">お名前</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">メールアドレス</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerEmail}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">電話番号</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a;">${customerPhone}</p>
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
            <td style="padding: 0 24px 32px; text-align: center;">
              <a href="https://tour.privatesky.co.jp/admin/reservations" style="display: inline-block; background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                管理画面で確認
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                PrivateSky Tour | 管理者通知
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
【新規予約】PrivateSky Tour

新しい予約が完了しました。以下の内容をご確認ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗日時: ${flightDate} ${flightTime}

■ 人数: ${pax}名

■ お支払い金額: ¥${formattedPrice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お客様情報】
・お名前: ${customerName}
・メールアドレス: ${customerEmail}
・電話番号: ${customerPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 管理画面で確認
https://tour.privatesky.co.jp/admin/reservations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PrivateSky Tour | 管理者通知
  `.trim();

  return { html, text };
}
