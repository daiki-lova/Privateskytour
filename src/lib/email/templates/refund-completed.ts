import type { RefundNotificationParams } from '../client';

/**
 * 返金完了メールテンプレート
 * HTMLとプレーンテキストの両方を生成
 */
export function refundCompletedTemplate(params: RefundNotificationParams): {
  html: string;
  text: string;
} {
  const {
    customerName,
    courseName,
    bookingNumber,
    refundAmount,
    cardLast4,
    refundDate,
  } = params;

  const formattedRefundAmount = refundAmount.toLocaleString('ja-JP');
  const cardInfo = cardLast4 ? `**** **** **** ${cardLast4}` : 'ご登録のクレジットカード';

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>返金完了のお知らせ - PrivateSky Tour</title>
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
                返金処理が完了しました
              </h2>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                ${customerName} 様<br><br>
                キャンセルに伴う返金処理が完了いたしました。<br>
                ご利用のカード会社により、実際の返金がご確認いただけるまでに数日かかる場合がございます。
              </p>
            </td>
          </tr>

          <!-- Refund Details -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">予約番号</p>
                          <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 700; letter-spacing: 2px;">${bookingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">コース</p>
                          <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${courseName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">
                          <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">返金額</p>
                          <p style="margin: 0; font-size: 32px; color: #1a1a1a; font-weight: 700;">&yen;${formattedRefundAmount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">返金先</p>
                                <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${cardInfo}</p>
                              </td>
                              <td width="50%">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">処理日</p>
                                <p style="margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${refundDate}</p>
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

          <!-- Notice -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a; font-weight: 600;">ご確認ください</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      <li>カード会社によっては、明細への反映まで数日〜数週間かかる場合がございます</li>
                      <li>ご不明な点がある場合は、カード会社へお問い合わせいただくか、当社までご連絡ください</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-align: center;">
                またのご利用を心よりお待ちしております。
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
【返金完了のお知らせ】PrivateSky Tour

${customerName} 様

キャンセルに伴う返金処理が完了いたしました。
ご利用のカード会社により、実際の返金がご確認いただけるまでに数日かかる場合がございます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 予約番号: ${bookingNumber}

■ コース: ${courseName}

■ 返金額: ¥${formattedRefundAmount}

■ 返金先: ${cardInfo}

■ 処理日: ${refundDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【ご確認ください】
・カード会社によっては、明細への反映まで数日〜数週間かかる場合がございます
・ご不明な点がある場合は、カード会社へお問い合わせいただくか、当社までご連絡ください

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

またのご利用を心よりお待ちしております。
ご不明な点がございましたら、お気軽にお問い合わせください。

PrivateSky Tour
info@privatesky.co.jp
  `.trim();

  return { html, text };
}
