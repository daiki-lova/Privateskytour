import type { AdminCancellationNoticeParams } from '../client';

/**
 * 運営側キャンセル通知メールテンプレート（お客様宛）
 * 天候・運航上の理由で管理者がキャンセルした場合に送信
 * HTMLとプレーンテキストの両方を生成
 */
export function adminCancellationNoticeTemplate(params: AdminCancellationNoticeParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    flightDate,
    flightTime,
    bookingNumber,
    reason,
    refundAmount,
  } = params;

  const formattedRefund = refundAmount ? refundAmount.toLocaleString('ja-JP') : null;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約キャンセルのお知らせ - PrivateSky Tour</title>
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
                予約キャンセルのお知らせ
              </h2>
            </td>
          </tr>

          <!-- Greeting & Apology -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                いつもPrivateSky Tourをご利用いただき、誠にありがとうございます。<br><br>
                大変申し訳ございませんが、下記のご予約につきまして、運航側の事情によりキャンセルとさせていただくこととなりました。<br>
                お客様にはご迷惑をおかけし、深くお詫び申し上げます。
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
                        <td style="padding: 16px 0;${reason || formattedRefund ? ' border-bottom: 1px solid #e5e7eb;' : ''}">
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
                      ${reason ? `
                      <tr>
                        <td style="padding: 16px 0;${formattedRefund ? ' border-bottom: 1px solid #e5e7eb;' : ''}">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">キャンセル理由</p>
                          <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.6;">${reason}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${formattedRefund ? `
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">返金額</p>
                          <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">&yen;${formattedRefund}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Refund Notice -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: 600;">返金について</p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.8;">
                      運航側の都合によるキャンセルのため、お支払い金額は全額返金いたします。返金はご利用のクレジットカードへ処理され、カード会社の処理状況により5〜10営業日程度お時間をいただく場合がございます。
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                改めまして、この度はご迷惑をおかけし誠に申し訳ございません。<br>
                またのご利用を心よりお待ちしております。
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-align: center;">
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
【予約キャンセルのお知らせ】PrivateSky Tour

${customerName} 様

いつもPrivateSky Tourをご利用いただき、誠にありがとうございます。

大変申し訳ございませんが、下記のご予約につきまして、運航側の事情によりキャンセルとさせていただくこととなりました。
お客様にはご迷惑をおかけし、深くお詫び申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 搭乗日時: ${flightDate} ${flightTime}
${reason ? `\n■ キャンセル理由: ${reason}` : ''}
${formattedRefund ? `\n■ 返金額: ¥${formattedRefund}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【返金について】
運航側の都合によるキャンセルのため、お支払い金額は全額返金いたします。
返金はご利用のクレジットカードへ処理され、カード会社の処理状況により
5〜10営業日程度お時間をいただく場合がございます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

改めまして、この度はご迷惑をおかけし誠に申し訳ございません。
またのご利用を心よりお待ちしております。

ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
